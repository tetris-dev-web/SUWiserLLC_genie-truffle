pragma solidity >=0.4.22 <0.6.0;
import './utility/Ownable.sol';
import './AmendmentRemovalProposal.sol';
import './AmendmentModificationProposal.sol';
import './AmendmentPoll.sol';
import './Cooperative0.sol';

contract Proposals is Ownable {
  address public developer;
  AmendmentPoll public amendmentPoll;

  constructor(address _developer, AmendmentPoll _amendmentPoll) public {
    developer = _developer;
    amendmentPoll = AmendmentPoll(_amendmentPoll);
  }

  bool public notAcceptingNewProposals;

  uint256 public totalNewAmendments;
  mapping(uint256 => address) internal newProposal;
  mapping(address => bool) internal _newProposalExists;

  uint256 public totalAmendmentModifications;
  mapping(uint256 => AmendmentModificationProposal) internal modificationProposal;
  mapping(address => bool) internal _modificationProposalExists;

  uint256 public totalAmendmentRemovals;
  mapping(uint256 => AmendmentRemovalProposal) internal removalProposal;
  mapping(address => bool) internal _removalProposalExists;

  address public newCooperative;

  function newCooperativeProposalExists (address _newCooperative) public returns (bool) {
    return newCooperative == _newCooperative;
  }

  function closeAddingNewProposals () onlyOwner external {
    notAcceptingNewProposals = true;
  }

  function proposeNewCooperative (address _newCooperative) external {
    require(msg.sender == developer);
    require(newCooperative == address(0));
    require(!notAcceptingNewProposals);
    newCooperative = _newCooperative;
  }

  function proposeAmendmentModification (uint256 amendmentId) external {
    require(msg.sender == developer);
    require(!notAcceptingNewProposals);
    address proposalAddress = new AmendmentModificationProposal(amendmentId, amendmentPoll, developer);
    AmendmentModificationProposal _newProposal = AmendmentModificationProposal(proposalAddress);
    _newProposal.transferOwnership(_owner());
    totalAmendmentModifications = totalAmendmentModifications + 1;
    modificationProposal[totalAmendmentModifications] = _newProposal;
    _modificationProposalExists[proposalAddress];
  }

  function proposeNewAmendment (Amendment newAmendment) external {
    require(msg.sender == developer);
    require(!notAcceptingNewProposals);
    totalNewAmendments = totalNewAmendments + 1;
    newProposal[totalNewAmendments] = address(newAmendment);
    _newProposalExists[newAmendment];
  }

  function proposeAmendmentRemoval (uint256 amendmentId) external {
    require(msg.sender == developer);
    require(Cooperative0(owner).canModify(amendmentId));
    require(!notAcceptingNewProposals);
    address proposalAddress = new AmendmentRemovalProposal(amendmentId);
    AmendmentRemovalProposal _removalProposal = AmendmentRemovalProposal(proposalAddress);
    _removalProposal.transferOwnership(_owner());
    totalAmendmentRemovals = totalAmendmentRemovals + 1;
    removalProposal[totalAmendmentRemovals] = _removalProposal;
    _removalProposalExists[proposalAddress];
  }

  function modificationProposalExists(address _modificationProposal) external returns (bool) {
    return _modificationProposalExists[_modificationProposal];
  }

  function removalProposalExists(address _removalProposal) external returns (bool) {
    return _removalProposalExists[_removalProposal];
  }

  function newProposalExists(address _newProposal) external returns (bool) {
    return _newProposalExists[_newProposal];
  }

  function recordCooperativeAdoption() external onlyOwner {
    newCooperative = address(0);
  }

  function recordModificationAdoption(address _modificationProposal) external onlyOwner {
    _modificationProposalExists[_modificationProposal] = false;
  }

  function recordNewAdoption(address _newProposal) external onlyOwner {
    _newProposalExists[_newProposal] = false;
  }

  function recordRemovalAdoption(address _removalProposal) external onlyOwner {
    _removalProposalExists[_removalProposal] = false;
  }
}

pragma solidity >=0.4.22 <0.6.0;
import './Amendment.sol';
import './utility/SafeMath.sol';
import './Cooperative.sol';
import './AmendmentPoll.sol';
import './Proposals.sol';

contract Cooperative0 is Cooperative {
  using SafeMath for uint256;
  AmendmentPoll public amendmentPoll;

  constructor(address _developer, AmendmentPoll _amendmentPoll) public
  Cooperative(_developer) {
    developer = _developer;
    amendmentPoll = AmendmentPoll(_amendmentPoll);
  }

  Proposals public currentProposals;
  bool public canInitElection;

  function initNewProposals () external {
    require(msg.sender == developer);
    require(
      newCooperative == address(0) &&
      (adoptionsComplete() || amendmentPoll.proposalsFailed())
    );
    address newProposals = new Proposals(developer, amendmentPoll);
    currentProposals = Proposals(newProposals);
    totalCompleteAdoptions = 0;
    canInitElection = true;
  }

  function initElection () external {
    require(msg.sender == developer);
    require(canInitElection);
    currentProposals.closeAddingNewProposals();
    amendmentPoll.openPoll();
    canInitElection = false;
  }

  uint256 public totalCompleteAdoptions;

  address public newCooperative;
  uint256 public totalAmendmentsMigrated;
  mapping(uint => bool) internal migrated;

  function adoptNewCooperative (address _newCooperative) external {
    require(amendmentPoll.proposalsPassed());
    require(currentProposals.newCooperativeProposalExists(_newCooperative));
    newCooperative = _newCooperative;
    currentProposals.recordCooperativeAdoption();
  }

  function migrateAmendmentToNewCooperative (uint256 amendmentId) external {
    require(newCooperative != address(0));
    require(!migrated[amendmentId]);
    require(adoptionsComplete());

    Amendment amendmentToMigrate = amendmentById[amendmentId];
    Cooperative _newCooperative = Cooperative(newCooperative);

    if (!amendmentToMigrate.depricated()) {
      _newCooperative.migrateAmendment(amendmentToMigrate, replacable[amendmentId]);
      amendmentToMigrate.transferOwnership(newCooperative);
    }

    migrated[amendmentId] = true;
    totalAmendmentsMigrated = totalAmendmentsMigrated.add(1);

    if (totalAmendmentsMigrated == totalAmendmentCount) {
      _newCooperative.completeMigrations();
      _newCooperative.renounceOwnership();
    }
  }

  function adoptAmendmentModification (
    uint256 amendmentId,
    uint256 coAmendmentToUpdateId,
    address newReferenceAmendment,
    bool finalModification
    ) external {
    require(amendmentPoll.proposalsPassed());
    require(currentProposals.modificationProposalExists(msg.sender));// or its a new amendment and the new amendmnet has been added already

    Amendment amendmentToModify = amendmentById[amendmentId];
    amendmentToModify.modifyAmendment(coAmendmentToUpdateId, newReferenceAmendment);

    if (finalModification) {
      currentProposals.recordModificationAdoption(msg.sender);//prevent reentrancy
    }

    updateCompleteAdoptions(finalModification);
  }
  //we need to open the functionality
  function adoptNewAmendment (address newAmendment) external {
    require(amendmentPoll.proposalsPassed());
    require(currentProposals.newProposalExists(newAmendment));

    totalAmendmentCount = totalAmendmentCount.add(1);
    amendmentById[totalAmendmentCount] = Amendment(newAmendment);
    currentProposals.recordNewAdoption(msg.sender);

    updateCompleteAdoptions(true);
  }

  function adoptAmendmentRemoval (uint256 amendmentId) external {
    require(amendmentPoll.proposalsPassed());
    require(currentProposals.removalProposalExists(msg.sender));

    Amendment amendmentToRemove = amendmentById[amendmentId];
    amendmentToRemove.closeFunctionality();
    currentProposals.recordRemovalAdoption(msg.sender);

    updateCompleteAdoptions(true);
  }

  function updateCompleteAdoptions (bool canUpdate) internal {
    if(canUpdate) {
      totalCompleteAdoptions = totalCompleteAdoptions.add(1);
    }
  }

  function adoptionsComplete () internal view returns (bool) {
    /* return true; */
    return totalCompleteAdoptions == currentProposals.totalNewAmendments().add(currentProposals.totalAmendmentModifications()).add(currentProposals.totalAmendmentRemovals());
  }
}

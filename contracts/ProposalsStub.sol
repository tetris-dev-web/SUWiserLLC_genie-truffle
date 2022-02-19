pragma solidity >=0.4.22 <0.6.0;
import './utility/Ownable.sol';
import './AmendmentRemovalProposal.sol';
import './AmendmentModificationProposal.sol';
import './Proposals.sol';
import './ContractStub.sol';

contract ProposalsStub is Proposals, ContractStub {
  constructor(address _developer, AmendmentPoll _amendmentPoll) public
  Proposals(_developer, _amendmentPoll) {}


  function setTotalAmendmentModifications (uint256 n) public {
    totalAmendmentModifications = n;
  }

  function setTotalAmendmentRemovals (uint256 n) public {
    totalAmendmentRemovals = n;
  }

  function setTotalNewAmendments (uint256 n) public {
    totalNewAmendments = n;
  }

  function closeAddingNewProposals () external {
    CallData storage methodState = method['closeAddingNewProposals'];
    methodState.firstAddress = msg.sender;
  }


  address internal proposal;

  function setProposalExists (address a) public {
    proposal = a;
  }

  function modificationProposalExists (address a) external returns (bool) {
    return a == proposal;
  }

  function newProposalExists (address a) external returns (bool) {
    return a == proposal;
  }

  function removalProposalExists (address a) external returns (bool) {
    return a == proposal;
  }

  function newCooperativeProposalExists (address a) public returns (bool) {
    return a == proposal;
  }

  function recordModificationAdoption (address adopted) external {
    CallData storage methodState = method['recordModificationAdoption'];
    methodState.firstAddress = adopted;
    methodState.called = true;
  }

  function recordNewAdoption (address adopted) external {
    CallData storage methodState = method['recordNewAdoption'];
    methodState.firstAddress = adopted;
    methodState.called = true;
  }

  function recordRemovalAdoption (address adopted) external {
    CallData storage methodState = method['recordRemovalAdoption'];
    methodState.firstAddress = adopted;
    methodState.called = true;
  }

  function recordCooperativeAdoption () external {
    CallData storage methodState = method['recordCooperativeAdoption'];
    methodState.called = true;
  }
}

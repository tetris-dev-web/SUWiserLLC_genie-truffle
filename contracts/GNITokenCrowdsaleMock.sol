pragma solidity >=0.4.22 <0.6.0;

import './crowdsale/GNITokenCrowdsale.sol';
import './token/TokenStub.sol';
import './ContractStub.sol';
import './projectLeader/ProjectLeaderTracker.sol';
import './voting/Voting.sol';
import './crowdsale/Activation.sol';


contract GNITokenCrowdsaleMock is GNITokenCrowdsale, ContractStub {
constructor
  (
    uint256 _openingTime,
    uint256 _doomsDay,
    uint256 _rate,
    address  _developer,
    InactiveToken _inactiveToken,
    address  _reimbursements
  )
  public
  GNITokenCrowdsale(
    _openingTime,
    _doomsDay,
    _rate,
    _developer,
    _inactiveToken,
    _reimbursements
  ) {}

  function receiveMockWei () external payable {

  }


  function setMockWeiRaised (uint256 mockRaised_) public {
    weiRaised = mockRaised_;
  }

  function mockDoomsDay () public view returns (uint256) {
    return doomsDay;
  }

  function setMockOpening (uint256 _openingTime) public {
    openingTime = _openingTime;
  }

  function setMockDoomsDay (uint256 _doomsDay) public {
    doomsDay = _doomsDay;
  }


  /* function removeVotesFromProject_ (address account, address fromProjectAddr, uint256 votes) internal {
    CallData storage methodState = method['removeVotesFromProject_'];
    methodState.firstAddress = account;
    methodState.secondAddress = fromProjectAddr;
    methodState.firstUint = votes;
  }

  function authenticateVoter(bytes _signedMessage, address voter, bytes32 unsignedMessage) internal {
    CallData storage methodState = method['authenticateVoter'];
    //the below throws an out of gas error?
    methodState.firstBytes = _signedMessage;
    methodState.firstBytes32 = unsignedMessage;
    methodState.firstAddress = voter;
  }

  function activateProject () internal {
    CallData storage methodState = method['activateProject'];
    methodState.called = true;
  } */

  /* function setMockVoteHash (address projectAddr, bytes32 mockHash) {
    voteHash[projectAddr] = mockHash;
  }

  function setMockRemoveHash (address projectAddr, bytes32 mockHash) {
    removeVoteHash[projectAddr] = mockHash;
  }

  function viewMockVoteHash (address projectAddress) public view returns (bytes32) {
    return voteHash[projectAddress];
  }

  function viewMockRemoveVoteHash (address projectAddress) public view returns (bytes32) {
    return removeVoteHash[projectAddress];
  }

  function mockProjectById (uint256 id) public view returns (address) {
    return projectAddress[id];
  } */

  function setMockReOpening (bool status) public {
    canReOpen = status;
  }
}

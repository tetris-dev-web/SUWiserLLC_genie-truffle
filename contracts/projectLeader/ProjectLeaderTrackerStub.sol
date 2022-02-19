pragma solidity >=0.4.22 <0.6.0;
import './ProjectLeaderTracker.sol';
import '../ContractStub.sol';

contract ProjectLeaderTrackerStub is ProjectLeaderTracker, ContractStub {
  address addr;
  function trackProject (address  projectAddr) external { //we need more tests for new functionality (when its implemented)
    CallData storage methodState = method['trackProject'];
    methodState.firstAddress = projectAddr;
    methodState.called = true;
  }

  address public mockLeader;
  bool public mockLeaderStatus;

  function reset () external {
    CallData storage methodState = method['reset'];
    methodState.called = true;
  }

  function setTentativeLeader (address a, bool b) public {
    mockLeader = a;
    mockLeaderStatus = b;
  }

  function tentativeLeader () external view returns (address , bool) {
    return (mockLeader, mockLeaderStatus);
  }

  function handleProjectActivation () external {
    CallData storage methodState = method['handleProjectActivation'];
    methodState.called = true;
  }

  function handleProjectPitch () external {
    CallData storage methodState = method['handleProjectPitch'];
    methodState.called = true;
  }
}

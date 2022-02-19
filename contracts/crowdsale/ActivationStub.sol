pragma solidity >=0.4.22 <0.6.0;
import './Activation.sol';
import '../ContractStub.sol';

contract ActivationStub is Activation, ContractStub {
  constructor
      (
        InactiveToken _inactiveToken,
        ProjectLeaderTracker _projectLeaderTracker
      )
      public
      Activation(
        _inactiveToken,
        _projectLeaderTracker
      )
      {}

  function activateProject (address a, uint256 n) external {
    CallData storage methodState = method['activateProject'];
    methodState.firstAddress = a;
    methodState.firstUint = n;
  }

  function tryActivateProject () external {
    CallData storage methodState = method['tryActivateProject'];
    methodState.called = true;
  }
}

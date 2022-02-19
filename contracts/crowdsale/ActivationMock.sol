pragma solidity >=0.4.22 <0.6.0;
import './Activation.sol';
import '../ContractStub.sol';

contract ActivationMock is Activation, ContractStub {
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

    function _activateProject(address projectAddress, uint256 capitalRequired) internal {
      CallData storage methodState = method['activateProject'];
      methodState.firstAddress = projectAddress;
      methodState.firstUint = capitalRequired;
    }

    function _activateProject_ (address projectAddress, uint256 capitalRequired) public {
      super._activateProject(projectAddress, capitalRequired);
    }
}

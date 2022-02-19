pragma solidity >=0.4.22 <0.6.0;
import './projectFactory/ProjectFactoryHelper.sol';
import './ContractStub.sol';

contract ProjectFactoryHelperStub is ProjectFactoryHelper, ContractStub {
  constructor(
    Activation _activation,
    Voting _voting,
    ProjectLeaderTracker _projectLeaderTracker
    ) public
    ProjectFactoryHelper(
      _activation,
      _voting,
      _projectLeaderTracker
      )
    {}

  function handleNewProject (address projectAddr) public {
    CallData storage methodState = method['handleNewProject'];
    methodState.firstAddress = projectAddr;
  }
}

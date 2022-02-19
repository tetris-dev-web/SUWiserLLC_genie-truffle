pragma solidity >=0.4.22 <0.6.0;

import '../project/Project.sol';
import '../projectLeader/ProjectLeaderTracker.sol';
import '../voting/Voting.sol';
import '../crowdsale/Activation.sol';
import '../utility/Ownable.sol';
import '../Amendment.sol';

contract ProjectFactoryHelper is Ownable {
  Activation public activation;
  Voting public voting;
  ProjectLeaderTracker public projectLeaderTracker;

  constructor(
    Activation _activation,
    Voting _voting,
    ProjectLeaderTracker _projectLeaderTracker
    ) public {
      activation = _activation;
      voting = _voting;
      projectLeaderTracker = _projectLeaderTracker;
    }


  function handleNewProject (address projectAddr) public onlyOwner {
    Project project = Project(projectAddr);

    uint256 capitalRequired = project.capitalRequired();

    project.transferOwnership(address(Voting(voting)));
    project.transferPrimary(address(Activation(activation)));

    ProjectLeaderTracker(projectLeaderTracker).handleProjectPitch();

    if (capitalRequired == 0) {
      activation.activateProject(projectAddr, capitalRequired);
    }
  }
}

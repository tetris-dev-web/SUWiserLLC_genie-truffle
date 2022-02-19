pragma solidity >=0.4.22 <0.6.0;

import '../utility/SafeMath.sol';
import '../utility/Ownable.sol';
import '../utility/VotingLocked.sol';
import '../utility/ProjectFactoryLocked.sol';
import '../project/Project.sol';
import '../token/InactiveToken.sol';
import '../projectLeader/ProjectLeaderTracker.sol';
import './GNITokenCrowdsale.sol';
import '../Amendment.sol';

//owner will be Voting
//secondary will be project factory

contract Activation is Ownable, ProjectFactoryLocked {
  using SafeMath for uint256;
  InactiveToken public inactiveToken;
  ProjectLeaderTracker public projectLeaderTracker;
  GNITokenCrowdsale public crowdsale;

  constructor
      (
        InactiveToken _inactiveToken,
        ProjectLeaderTracker _projectLeaderTracker
      )
      public {
        inactiveToken = InactiveToken(_inactiveToken);
        projectLeaderTracker = ProjectLeaderTracker(_projectLeaderTracker);
      }

  event ProjectActivation (
    address addr,
    uint256 capitalRequired,
    uint256 time
  );

  function setCrowdsale (GNITokenCrowdsale _crowdsale) public onlyOwner {
    crowdsale = _crowdsale;
  }

   function tryActivateProject () external {
     (
       address  tentativeLeaderAddr,
       bool tentativeLeaderConfirmed
     ) = projectLeaderTracker.tentativeLeader();

     Project project = Project(tentativeLeaderAddr);
     uint256 capitalRequired = project.capitalRequired();
     if (
       tentativeLeaderConfirmed &&
       capitalRequired <= crowdsale.weiRaised_() &&
       project.open()
       ) {
         _activateProject(tentativeLeaderAddr, capitalRequired);
       }
    }

    function activateProject (address projectAddress, uint256 capitalRequired) external onlyProjectFactory {
      _activateProject (projectAddress, capitalRequired);
    }

    function _activateProject (address projectAddress, uint256 capitalRequired) internal {
      Project project = Project(projectAddress);
      uint256 time = project.activate();
      projectLeaderTracker.handleProjectActivation();
      InactiveToken(inactiveToken).increasePendingActivations(project.developerTokens().add(project.investorTokens()));
      GNITokenCrowdsale(crowdsale).transferCapitalToDeveloper(capitalRequired);
      emit ProjectActivation(projectAddress, project.capitalRequired(), time);
    }

}

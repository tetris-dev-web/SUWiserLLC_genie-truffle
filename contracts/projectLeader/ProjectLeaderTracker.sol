pragma solidity >=0.4.22 <0.6.0;
import '../project/Project.sol';
import '../utility/CrowdsaleLocked.sol';
import '../utility/ActivationLocked.sol';
import '../utility/ProjectFactoryLocked.sol';
import '../utility/SafeMath.sol';
import '../Amendment.sol';


contract ProjectLeaderTracker is CrowdsaleLocked, ActivationLocked, ProjectFactoryLocked {
  using SafeMath for uint256;
  uint256 public candidateCount;
  address  public tentativeLeaderAddr;
  uint256 public leadingVoteCount;
  uint256 public startTime;

  struct ProjectsChecked {
    mapping(address => bool) isChecked;
    uint256 totalChecked;
  }

  uint256 internal currentCheckCycle;
  mapping(uint256 => ProjectsChecked) internal checkCycle;

  function tentativeLeader () external view returns (address , bool) {
    return (tentativeLeaderAddr, tentativeLeaderConfirmed());
  }

  function reset () onlyCrowdsale external {
    resetProjectsChecked();
    setTentativeLeader(address(0));
    candidateCount = 0;
    startTime = now;
  }

  function handleProjectActivation () onlyActivation external {
    resetProjectsChecked();
    setTentativeLeader(address(0));
    decrementCandidateCount();
  }

  function handleProjectPitch () onlyProjectFactory external {
    candidateCount = candidateCount.add(1);
  }

  function trackProject (address projectAddr) external {
    require(projectAddr != address(0) && !Project(projectAddr).active());
    require(startTime < Project(projectAddr).closingTime()); //ensures that this project is part of the current cycle

    if(Project(projectAddr).open()) {
      updateTentativeLeader(projectAddr);
    }

    recordCheck(projectAddr);
  }

  function recordCheck (address  projectAddr) internal {
    if (!alreadyChecked(projectAddr)) {
     checkCycle[currentCheckCycle].totalChecked = checkCycle[currentCheckCycle].totalChecked.add(1);
     checkCycle[currentCheckCycle].isChecked[projectAddr] = true;
    }
  }

  function updateTentativeLeader (address projectAddr) internal {
    bool _leaderExists = leaderExists();
    bool _isLeader;
    bool _currentLeaderClosed;
    bool _beatsLeader;

    if (_leaderExists) {
      _isLeader = isLeader(projectAddr);
      _currentLeaderClosed = currentLeaderClosed();
      _beatsLeader = beatsLeader(projectAddr);

      if (_currentLeaderClosed || (_isLeader && !_beatsLeader)) {  //if the real leader can be a project that we have already checked
        resetProjectsChecked();
      }
    }

    if (!_leaderExists || _currentLeaderClosed || _beatsLeader) { //if the tentative leader cannot possibly be in the lead
      setTentativeLeader(projectAddr);
    } else if (_isLeader) {
      setLeadingVoteCount();
    }
  }

  function leaderExists () internal view returns (bool) {
    return tentativeLeaderAddr != address(0);
  }

  function isLeader (address  projAddr) internal view returns (bool) {
    return projAddr == tentativeLeaderAddr;
  }

  function beatsLeader (address  projAddr) internal view returns (bool) {
    return Project(projAddr).totalVotes() > leadingVoteCount;
  }

  function resetProjectsChecked() internal {
    ProjectsChecked memory newProjectsChecked;
    currentCheckCycle = currentCheckCycle.add(1);
    checkCycle[currentCheckCycle] = newProjectsChecked;
  }

  function setTentativeLeader(address  newLeaderAddr) internal {
    tentativeLeaderAddr = newLeaderAddr;
    setLeadingVoteCount();
  }

  function setLeadingVoteCount () internal {
    if (tentativeLeaderAddr == address(0)) {
      leadingVoteCount = 0;
    } else {
      leadingVoteCount = Project(tentativeLeaderAddr).totalVotes();
    }
  }

  function decrementCandidateCount() internal {
    candidateCount = candidateCount.sub(1);
  }

  function currentLeaderClosed () internal view returns (bool) {
    return !Project(tentativeLeaderAddr).open();
  }

  function alreadyChecked (address  projectAddr) internal view returns (bool) {
    return checkCycle[currentCheckCycle].isChecked[projectAddr];
  }

  function tentativeLeaderConfirmed () internal view returns (bool) {
    return totalChecked() == candidateCount;
  }

  function totalChecked () public view returns (uint256) {
    return checkCycle[currentCheckCycle].totalChecked;
  }
}

/* function attemptProjectActivation () public {
  if (
    tentativeLeaderCapRequired <= weiRaised &&
    tentativeLeaderConfirmed &&
    Project(tentativeLeaderAddr).open()
    ) {
    activateProject();
  }
} */

/* function activateProject () internal { //we need more tests for added functionality
  Project project = Project(tentativeLeaderAddr);
  project.activate();
  project.log();
  //reduce cast vote count by the number of project votes, set the number of project votes to 0.

  forwardFunds(developer, tentativeLeaderCapRequired);
  weiRaised = weiRaised.sub(tentativeLeaderCapRequired);
  candidateCount = candidateCount.sub(1);
  Token(token).increasePendingActivations(project.developerTokens_().add(project.investorTokens_()));
} */

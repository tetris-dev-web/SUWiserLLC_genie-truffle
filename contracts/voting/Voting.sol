pragma solidity >=0.4.22 <0.6.0;
import '../utility/Ownable.sol';
import '../project/Project.sol';
import '../crowdsale/GNITokenCrowdsale.sol';
import '../token/VotingToken.sol';
import '../projectLeader/ProjectLeaderTracker.sol';
import '../crowdsale/Activation.sol';
import '../ECRecovery.sol';
import '../Amendment.sol';

contract Voting is Ownable {
  /* using ECRecovery for bytes32; */
  VotingToken public votingToken;
  ProjectLeaderTracker public projectLeaderTracker;
  Activation public activation;
  GNITokenCrowdsale public crowdsale;

  constructor (VotingToken _votingToken, ProjectLeaderTracker _projectLeaderTracker, Activation _activation) public {
    votingToken = _votingToken;
    projectLeaderTracker = _projectLeaderTracker;
    activation = _activation;
  }

  event VoteChange (
    uint256 projectId,
    uint256 totalVotes
  );

  function () external payable {}

  function setCrowdsale (GNITokenCrowdsale _crowdsale) public onlyOwner {
    crowdsale = _crowdsale;
  }

  function voteForProject (address _project, uint256 votes) external {
    Project(_project).vote(msg.sender, votes);
    VotingToken(votingToken).assign(msg.sender, votes);
    GNITokenCrowdsale(crowdsale).extendDoomsDay(6);//this can be called externally
    handleVoteChange(_project);
  }

  function voteAgainstProject(address  _project, uint256 votes) external {
    Project(_project).voteAgainst(msg.sender, votes);
    handleVoteRemoval(msg.sender, _project, votes);
  }

   //this is for adding vote credit for each investor from the frontend after a project has been activated
   //call this function removeVotesFromIneligibleProject
   function removeVotesFromIneligibleProject (address account, address fromProjectAddr) public {
     uint256 votes = Project(fromProjectAddr).votesOf(account);
     Project(fromProjectAddr).removeVotes(account, votes);
     handleVoteRemoval(account, fromProjectAddr, votes);
   }

   function handleVoteRemoval (address account, address  fromProjectAddr, uint256 votes) internal {
     VotingToken(votingToken).freeUp(account, votes);
     GNITokenCrowdsale(crowdsale).reduceDoomsDay(6);
     handleVoteChange(fromProjectAddr);
  }

  function handleVoteChange (address votedForProj) internal {
    projectLeaderTracker.trackProject(votedForProj);
    Activation(activation).tryActivateProject();

    Project project = Project(votedForProj);
    emit VoteChange(project.id(), project.totalVotes());
  }
}

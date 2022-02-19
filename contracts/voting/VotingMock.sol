pragma solidity >=0.4.22 <0.6.0;

import './Voting.sol';

contract VotingMock is Voting {
  constructor (VotingToken _votingToken, ProjectLeaderTracker _projectLeaderTracker, Activation _activation) public
  Voting(
    _votingToken,
    _projectLeaderTracker,
    _activation
    )
  {}
}

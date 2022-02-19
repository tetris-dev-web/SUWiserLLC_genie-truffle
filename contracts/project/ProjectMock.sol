pragma solidity >=0.4.22 <0.6.0;

import './Project.sol';

contract ProjectMock is Project {
  constructor (
    string memory _projectInfo,
    address _developer,
    uint256 _valuation,
    uint256 _capitalRequired,
    uint256 _developerTokens,
    uint256 _investorTokens,
    string _cashFlow,
    address _dividendWallet
    ) public Project(
      _projectInfo,
      _developer,
      _valuation,
      _capitalRequired,
      _developerTokens,
      _investorTokens,
      _cashFlow,
      _dividendWallet
      ) {}

  function removeMockVoter (address addr) public {
    totalVotes = totalVotes.sub(votes[addr]);
    votes[addr] = 0;
  }

  function initMockVoter (address addr, uint256 voteAmount) public {
    votes[addr] = voteAmount;
    totalVotes = totalVotes.add(voteAmount);
  }

  function changeClosingTime (uint256 time) public {
    closingTime = time;
  }

  function checkDividendWallet () public view returns (address) {
    return dividendWallet;
  }

  function checkManagerStatus (address account) public view returns (bool) {
    return managers[account];
  }

  function checkVoteAmount (address voter) public view returns (uint256) {
    return votes[voter];
  }
}

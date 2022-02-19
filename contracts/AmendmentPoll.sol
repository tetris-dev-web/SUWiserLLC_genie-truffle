pragma solidity >=0.4.22 <0.6.0;
import './utility/Ownable.sol';
import './utility/SafeMath.sol';
import './token/ActiveToken.sol';

contract AmendmentPoll is Ownable {
  using SafeMath for uint256;
  ActiveToken token;

  constructor (ActiveToken _token) public {
    token = _token;
  }

  struct VoteRecord {
    mapping(address => bool) voteCast;
  }

  uint256 public currentPollId;
  mapping(uint256 => VoteRecord) voteRecordByPoll;
  uint256 public totalInFavorWeighted;
  uint256 public totalAgainstWeighted;
  uint256 public totalInFavor;
  uint256 public totalAgainst;

  uint256 private voteMultiplier = 10e30;

  function proposalsPassed () public view returns (bool) {
    return totalInFavorWeighted.mul(voteMultiplier) > token.totalSupply().mul(voteMultiplier).mul(8).div(10);
  }

  function proposalsFailed () public view returns (bool) {
    return totalAgainstWeighted.mul(voteMultiplier) >= token.totalSupply().mul(voteMultiplier).mul(2).div(10);
  }

  function open () public view returns (bool) {
    return !(proposalsFailed() || proposalsPassed());
  }

  function openPoll () external onlyOwner {
    totalInFavorWeighted = 0;
    totalAgainstWeighted = 0;
    currentPollId = currentPollId.add(1);
    VoteRecord memory newVoteRecord;
    voteRecordByPoll[currentPollId] = newVoteRecord;
  }

  function castVote (bool inFavor) external {
    require(currentPollId != 0);
    require(!voteRecordByPoll[currentPollId].voteCast[msg.sender]);

    uint256 voteAmount = token.balanceOf(msg.sender);

    require(voteAmount > 0);

    if (inFavor) {
      totalInFavorWeighted = totalInFavorWeighted.add(voteAmount);
      totalInFavor = totalInFavor.add(1);
    }
    else {
      totalAgainstWeighted = totalAgainstWeighted.add(voteAmount);
      totalAgainst = totalAgainst.add(1);
    }

    voteRecordByPoll[currentPollId].voteCast[msg.sender] = true;
  }
}

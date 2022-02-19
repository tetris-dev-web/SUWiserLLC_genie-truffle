pragma solidity >=0.4.22 <0.6.0;
import './utility/SafeMath.sol';
import './Project.sol';
import './utility/Ownable.sol';
import './utility/Secondary.sol';

contract InvestorList is Ownable, Secondary {
  using SafeMath for uint256;

  struct Investor {
    address addr;
    uint256 id;
    uint256 voteCredit;
  }

  //maps and id to an investor
  mapping(uint256 => Investor) internal investors;
  //maps an address to an investor id
  mapping(address => uint256) internal investorIds;
  uint256 internal investorCount_;

  event LogVotes (
    address voter,
    uint256 projectId,
    uint256 votes
  );

  modifier authorize () {
    require(msg.sender == owner || msg.sender == primary());
    _;
  }

  function investorCount () external view returns(uint256) {
    return investorCount_;
  }

  function validAccount (address investorAddr) public view returns (bool) {
    return !(investorIds[investorAddr] == 0);
  }
  //make only accessible by token
  function addInvestor (address investorAddr) external authorize {
    if (!validAccount(investorAddr)) {
      Investor memory newInvestor;
      investorCount_ = investorCount_.add(1);

      uint256 id = investorCount_;
      newInvestor.id = id;
      newInvestor.addr = investorAddr;

      investorIds[investorAddr] = id;
      investors[id] = newInvestor;
    }
  }
  //make this function only accessible by crowdsale for security
  /* function addVoteCredit (address investorAddr, uint256 votes) public authorize {
    investors[investorIds[investorAddr]].voteCredit = investors[investorIds[investorAddr]].voteCredit.add(votes);
  }
  //make only accessible by corwdsale
  function removeVoteCredit (address investorAddr, uint256 votes) public authorize {
    require(investors[investorIds[investorAddr]].voteCredit >= votes);
    investors[investorIds[investorAddr]].voteCredit = investors[investorIds[investorAddr]].voteCredit.sub(votes);
  } */
}

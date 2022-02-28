pragma solidity >=0.4.22 <0.6.0;
import '../utility/SafeMath.sol';
import '../utility/Ownable.sol';
import '../utility/Secondary.sol';
import '../dividends/Dividends.sol';
import '../projectFactory/ProjectFactory.sol';
/* import './ECRecovery.sol'; */

contract Project is Ownable, Secondary {
  using SafeMath for uint256;
  uint256 public id;
  string public projectInfo;
  address public developer;
  address public dividendWallet;
  uint256 public openingTime;
  uint256 public closingTime;
  uint256 public valuation;
  uint256 public capitalRequired;
  uint256 public developerTokens;
  uint256 public investorTokens;
  string public cashFlow;
  uint256 public totalVotes;
  bool public active;
  uint256 public activationTime;
  constructor (
    string memory _projectInfo,
    address _developer,
    uint256 _valuation,
    uint256 _capitalRequired,
    uint256 _developerTokens,
    uint256 _investorTokens,
    string _cashFlow,
    address _dividendWallet
    ) public
    {
      projectInfo = _projectInfo;
      developer = _developer;
      valuation = _valuation;
      capitalRequired = _capitalRequired;
      developerTokens = _developerTokens;
      investorTokens = _investorTokens;
      cashFlow = _cashFlow;
      totalVotes = 0;
      active = false;
      openingTime = now;
      closingTime = now + 86600 * 240;
      dividendWallet = _dividendWallet;
  }

  mapping(address => uint256) internal votes;

  event ReceiveCashFlow (uint256 weiAmount, uint256 time, uint256 projectId);

  function setId (uint256 _id) onlyOwner {
    id = _id;
  }

  function getData() public view returns (
    address,
    string,
    uint256,
    uint256,
    string
    ) {
      return (
        address(this),
        projectInfo,
        capitalRequired,
        valuation,
        cashFlow
        );
    }

  function votesOf(address voter) public view returns (uint256) {
    return votes[voter];
  }

  function open () public view returns (bool) {
    return closingTime > now;
  }

  mapping(address => bool) internal managers;

  function () external payable {}

  modifier authorize () {
    require(managers[msg.sender] == true || msg.sender == developer);
    _;
  }

  function deposit () public payable {
    require(msg.value != 0);
    uint256 weiAmount = msg.value;
    emit ReceiveCashFlow(msg.value, now, id);
    Dividends(dividendWallet).receiveDividends.value(weiAmount)();
  }

  function addManager (address manager) public authorize {
    managers[manager] = true;
  }

  function setDividendWallet (address wallet) public authorize {
    dividendWallet = wallet;
  }

  function vote (address voter, uint256 voteAmount) external onlyOwner {
    require(open());
    votes[voter] = votes[voter].add(voteAmount);
    totalVotes = totalVotes.add(voteAmount);
    closingTime = closingTime.add(43200);
  }

  function voteAgainst (address voter, uint256 voteAmount) external onlyOwner {
    require(open());
    removeVotes_(voter, voteAmount);
  }

  function removeVotes (address voter, uint256 voteAmount) external onlyOwner {
    require(!open() || active);
    removeVotes_(voter, voteAmount);
  }

  function removeVotes_ (address voter, uint256 voteAmount) internal {
    require(voteAmount <= totalVotes);
    require(voteAmount <= votes[voter]);

    votes[voter] = votes[voter].sub(voteAmount);
    totalVotes = totalVotes.sub(voteAmount);
    closingTime = closingTime.sub(43200);
  }

  function activate () external onlyPrimary returns(uint256) {
    active = true;
    activationTime = block.timestamp;
    return activationTime;
  }
}

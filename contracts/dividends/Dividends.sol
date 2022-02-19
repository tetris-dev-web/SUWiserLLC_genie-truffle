pragma solidity >=0.4.22 <0.6.0;
import '../utility/SafeMath.sol';
import '../token/ActiveToken.sol';
import '../crowdsale/GNITokenCrowdsale.sol';

contract Dividends {
  using SafeMath for uint256;
  ActiveToken token;

  constructor (ActiveToken token_) public {
    token = token_;
  }

  mapping(address => uint256) public lastDividendPoints;

  event ReceiveDividends(uint256 weiAmount, uint256 time);
  event DividendCollection(address account, uint256 amount);

  uint256 public totalDividendPoints;
  uint256 internal pointMultiplier = 10e30;

  function dividendOwedTo(address account) public view returns (uint256) {
    uint256 owedDividendPoints = totalDividendPoints.sub(lastDividendPoints[account]);
    uint256 accountTokens = ActiveToken(token).balanceOf(account);
    return accountTokens.mul(owedDividendPoints).div(pointMultiplier);
  }

  function distributeDividend(address account) external returns (bool) {
    uint256 dividend = dividendOwedTo(account);
    account.transfer(dividend);
    lastDividendPoints[account] = totalDividendPoints;
    emit DividendCollection(account, dividend);
    return true;
  }

  function receiveDividends () external payable {
    uint256 totalTokens = ActiveToken(token).totalSupply();
    uint256 weiAmount = msg.value;

    uint256 newDividendPoints = weiAmount.mul(pointMultiplier).div(totalTokens);
    totalDividendPoints = totalDividendPoints.add(newDividendPoints);
    ReceiveDividends(msg.value, now);
  }
}

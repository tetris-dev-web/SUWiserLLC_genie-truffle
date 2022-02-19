pragma solidity >=0.4.22 <0.6.0;
import './Dividends.sol';
import '../token/ActiveToken.sol';

contract DividendsMock is Dividends {

  constructor (ActiveToken token_)
  public
  Dividends(token_) {}


  function lastDividendPointsOf(address account) public view returns(uint256) {
    return lastDividendPoints[account];
  }

  function addMockTotalDividendPonts(uint256 eth, uint256 tokens) public {
    totalDividendPoints = eth.mul(1e18).mul(pointMultiplier).div(tokens);
  }

  function setMockLastDividendPoints (uint256 eth, uint256 tokens, address account) public {
    lastDividendPoints[account] = eth.mul(1e18).mul(pointMultiplier).div(tokens);
  }
}

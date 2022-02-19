pragma solidity >=0.4.22 <0.6.0;
import "../token/InactiveToken.sol";
import '../utility/SafeMath.sol';

contract Crowdsale {
  using SafeMath for uint256;
  InactiveToken public token;
  address  public developer;
  uint256 internal rate;
  uint256 internal weiRaised;

  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount,
    uint256 time
  );

  constructor(uint256 _rate, address  _developer, InactiveToken _token) public {
    require(_rate > 0);
    require(_developer != address(0));

    rate = _rate;
    developer = _developer;
    token = _token;
  }

  function () public payable {
  }

  function buyTokensFor(address  _beneficiary) public payable returns (uint256) {
    uint256 weiAmount = msg.value;
    require(_beneficiary != address(0));
    require(weiAmount != 0);

    uint256 tokens = weiAmount.mul(rate);

    weiRaised = weiRaised.add(weiAmount);

    InactiveToken(token).transfer(_beneficiary, tokens);

    emit TokenPurchase(
      msg.sender,
      _beneficiary,
      weiAmount,
      tokens,
      now
    );

    return tokens;
  }

  function weiRaised_() public view returns(uint256) {
    return weiRaised;
  }
}

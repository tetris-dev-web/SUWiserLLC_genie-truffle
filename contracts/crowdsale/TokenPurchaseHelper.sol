pragma solidity >=0.4.22 <0.6.0;
import '../Amendment.sol';
import '../utility/Ownable.sol';

contract TokenPurchaseHelper is Ownable {
  address public lastPurchaser;
  uint256 public lastAmount;

  function handleTokenPurchase (address purchaser, uint256 amount) public onlyOwner {
    lastPurchaser = purchaser;
    lastAmount = amount;
  }
}

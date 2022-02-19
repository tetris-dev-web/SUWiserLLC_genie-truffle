pragma solidity >=0.4.22 <0.6.0;
import './TokenPurchaseHelper.sol';
import '../ContractStub.sol';

contract TokenPurchaseHelperStub is TokenPurchaseHelper, ContractStub {
  function handleTokenPurchase (address a, uint256 n) public {
    CallData storage methodState = method['handleTokenPurchase'];
    methodState.firstAddress = a;
    methodState.firstUint = n;
  }
}

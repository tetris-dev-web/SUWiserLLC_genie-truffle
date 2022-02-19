pragma solidity >=0.4.22 <0.6.0;
import './Cooperative.sol';
import './ContractStub.sol';

contract CooperativeBaseStub is Cooperative, ContractStub {
  constructor (address _developer) public
  Cooperative(_developer) {}

  function migrateAmendment (Amendment amendmnet, bool replacable) external {
    CallData storage methodState = method['migrateAmendment'];
    methodState.firstAddress = address(amendmnet);
    methodState.firstBool = replacable;
    methodState.called = true;
  }

  function completeMigrations () external {
    CallData storage methodState = method['completeMigrations'];
    methodState.called = true;
  }

  function renounceOwnership () public {
    CallData storage methodState = method['renounceOwnership'];
    methodState.called = true;
  }
}

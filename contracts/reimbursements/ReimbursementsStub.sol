pragma solidity >=0.4.22 <0.6.0;
import '../reimbursements/Reimbursements.sol';
import '../utility/SafeMath.sol';
import '../ContractStub.sol';
import '../token/InactiveToken.sol';

contract ReimbursementsStub is Reimbursements, ContractStub {
  using SafeMath for uint256;

  constructor (InactiveToken _token) public Reimbursements(_token) payable {}

  modifier onlyOwner {
    _;
  }

  function () external payable {}

  function recordReimbursement () public payable onlyOwner {
    CallData storage methodState = method['recordReimbursement'];
    methodState.called = true;
    methodState.firstUint = msg.value;
  }

  /* function claimReimbursement (address account) public {
    CallData storage methodState = method['claimReimbursement'];
    methodState.called = true;
    methodState.firstAddress = account;
  } */
}

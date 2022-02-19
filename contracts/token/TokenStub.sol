pragma solidity >=0.4.22 <0.6.0;
/* import './ERC20/Token.sol';
import '../ContractStub.sol'; */

/* contract TokenStub is Token, ContractStub {
  address mockInvestorA;
  address mockInvestorB;
  address mockInvestorC;

  uint256 balanceA = 12000000;
  uint256 balanceB = 48000000;
  uint256 balanceC = 30000000;

  function init(address investorA, address investorB, address investorC) public {
    mockInvestorA = investorA;
    mockInvestorB = investorB;
    mockInvestorC = investorC;
  }

  function totalActiveSupply () public view returns (uint256) {
    return balanceA.add(balanceB).add(balanceC);
  }

  function activeBalanceOf (address addr) public view returns (uint256) {
    uint256 b;

    if (addr == mockInvestorA) {
      b = balanceA;
    }

    if (addr == mockInvestorB) {
      b = balanceB;
    }

    if (addr == mockInvestorC) {
      b = balanceC;
    }

    return b;
  }

  function totalInactiveSupply () public view returns (uint256) {
    return balanceA.add(balanceB).add(balanceC);
  }

  function setStubTotalPendingActivations (uint256 amount) public returns(uint256) {
    totalPendingActivations = amount;
  }

  mapping(address => uint256) stubPending;

  function pendingActivations(address  account) public view returns(uint256) {
    return stubPending[account];
  }

  function setStubPendingActivations(address account, uint256 amount) public {
    stubPending[account] = amount;
  }

  function inactiveBalanceOf (address addr) public view returns (uint256) {
    uint256 b;

    if (addr == mockInvestorA) {
      b = balanceA;
    }

    if (addr == mockInvestorB) {
      b = balanceB;
    }

    if (addr == mockInvestorC) {
      b = balanceC;
    }

    return b;
  }

  function mint(
    address _to,
    uint256 _amount
  )
    public
    canMint
    returns (bool)
  {
    CallData storage methodState = method['mint'];
    methodState.called = true;

    if (methodState.firstAddress == address(0)) {
      methodState.firstAddress = _to;
    } else {
      methodState.secondAddress = _to;
    }

    if (methodState.firstUint == 0) {
      methodState.firstUint = _amount;
    } else {
      methodState.secondUint = _amount;
    }

    return true;
  }

  function resetInactiveTokenCycle (address  developer) public {
    CallData storage methodState = method['resetInactiveTokenCycle'];
    methodState.firstAddress = developer;
    methodState.called = true;
  }

  function activatePending (address  account) external returns (bool) {
    CallData storage methodState = method['activatePending'];
    methodState.firstAddress = account;
    methodState.called = true;
  }

  function increasePendingActivations(uint256 amount) external {
    CallData storage methodState = method['increasePendingActivations'];
    methodState.called = true;
    methodState.firstUint = amount;
  }

  function transferInactive (address _to, uint256 _value) external {
    CallData storage methodState = method['transferInactive'];
    methodState.firstAddress = _to;
    methodState.firstUint = _value;

    methodState.correctCallOrder = method['activatePending'].called == true;
  }
} */

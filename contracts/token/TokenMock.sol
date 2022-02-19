pragma solidity >=0.4.22 <0.6.0;

/* import './ERC20/Token.sol';
import '../ContractStub.sol'; */

/* contract TokenMock is Token, ContractStub {
  function setMockTotalActivationPonts (uint256 newTokens, uint256 inactiveSupply) public {
    totalActivationPoints = newTokens.mul(activationMultiplier).div(inactiveSupply);
  }

  function setMockLastActivationPoints (uint256 newTokens, uint256 inactiveSupply, address account) public {
    lastActivationPoints[account] = newTokens.mul(activationMultiplier).div(inactiveSupply);
  }

  function setMockTotalPendingActivations (uint256 amount) public {
    totalPendingActivations = amount;
  }

  function lastActivationPointsOf(address account) public view returns(uint256) {
    return lastActivationPoints[account];
  }

  function activate_ (address  account, uint256 amount) public {
    super.activate(account, amount);
  }

  function activate (address  account, uint256 amount) internal {
    super.activate(account, amount);
    CallData storage methodState = method['activate'];
    methodState.called = true;
    methodState.firstAddress = account;
    methodState.firstUint = amount;
  }

  function resetSupply () public {
    totalSupply_ = 0;
    totalActiveSupply_ = 0;
    totalAccounts_ = 0;
  }

  function clearMockBalance (address addr) public {
    balances[addr].inactive = 0;
    balances[addr].active = 0;
    balances[addr].assigned = 0;
    balances[addr].exists = false;
  }

  function initMockBalance (address addr, uint256 active, uint256 inactive, uint256 assigned) public {
    balances[addr].inactive = inactive;
    balances[addr].active = active;
    balances[addr].assigned = assigned;
    balances[addr].exists = true;

    totalAccounts_ = totalAccounts_.add(1);
    totalSupply_ = totalSupply_.add(active).add(inactive);
    totalActiveSupply_ = totalActiveSupply_.add(active);
  }

  function getMockInactiveTokenCycle () public returns (uint256) {
    return currentInactiveTokenCycle;
  }

  function setMockInactiveTokenCycle (uint256 cycle) public {
    currentInactiveTokenCycle = cycle;
  }

  function setMockCycleUpdateStatus (address account, bool status) public {
    inactiveTokenCycle[currentInactiveTokenCycle].updated[account] = status;
  }

  function getMockCycleUpdateStatus (address account) public returns (bool) {
    return inactiveTokenCycle[currentInactiveTokenCycle].updated[account];
  }
} */

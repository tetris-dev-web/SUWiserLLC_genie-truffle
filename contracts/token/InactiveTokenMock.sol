pragma solidity >=0.4.22 <0.6.0;
import './InactiveToken.sol';
import '../ContractStub.sol';

contract InactiveTokenMock is InactiveToken, ContractStub {
  constructor (VotingToken _votingToken, ActiveToken _activeToken) public
  InactiveToken(_votingToken, _activeToken)
  {}

  function updateAccountCycle (address a) public {
    CallData storage methodState = method['updateAccountCycle'];
    methodState.firstAddress = a;
    methodState.called = true;
    super.updateAccountCycle(a);
  }

  function activatePending (address a) public returns (bool) {
    CallData storage methodState = method['activatePending'];
    methodState.firstAddress = a;
    methodState.called = true;
    return true;
  }

  function _activatePending (address account) public returns (bool) {
    return super.activatePending(account);
  }

  function setMockCycleUpdateStatus (address account, bool status) public {
    inactiveTokenCycle[currentInactiveTokenCycle].updated[account] = status;
  }

  function setMockInactiveTokenCycle (uint256 cycle) public {
    currentInactiveTokenCycle = cycle;
  }

  function resetSupply () public {
    _totalSupply = 0;
  }

  function clearMockBalance (address addr) public {
    _balances[addr] = 0;
  }

  function initMockBalance (address a, uint256 n) public {
    _balances[a] = n;
    _totalSupply = _totalSupply.add(n);
  }

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

  function activate (address account, uint256 amount) internal {
    /* super.activate(account, amount); */
    CallData storage methodState = method['activate'];
    methodState.called = true;
    methodState.firstAddress = account;
    methodState.firstUint = amount;
  }
}

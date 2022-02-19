pragma solidity >=0.4.22 <0.6.0;
import './InactiveToken.sol';
import '../ContractStub.sol';

contract InactiveTokenStub is InactiveToken, ContractStub {
  constructor (VotingToken _votingToken, ActiveToken _activeToken) public
  InactiveToken(_votingToken, _activeToken) {}

  function increasePendingActivations (uint256 n) external {
    CallData storage methodState = method['increasePendingActivations'];
    methodState.firstUint = n;
  }

  function transfer (address a, uint256 n) public returns (bool){
    CallData storage methodState = method['transfer'];
    methodState.firstAddress = a;
    methodState.firstUint = n;
    return true;
  }

  function resetInactiveTokenCycle () public {
    CallData storage methodState = method['resetInactiveTokenCycle'];
    methodState.called = true;
  }

  function mint (address a, uint256 n) external {
    CallData storage methodState = method['mint'];
    /* methodState.called = true; */

    if (methodState.firstAddress == address(0)) {
      methodState.firstAddress = a;
    } else {
      methodState.secondAddress = a;
    }

    if (methodState.firstUint == 0) {
      methodState.firstUint = n;
    } else {
      methodState.secondUint = n;
    }

  }

  function initMockBalance (address a, uint256 n) public {
    _balances[a] = n;
    _totalSupply = _totalSupply.add(n);
  }

  bool public mockAccountUpdated;

  function setAccountUpdated (bool b) public {
    mockAccountUpdated = b;
  }

  function accountCycleUpdated (address a) public view returns (bool) {
    return mockAccountUpdated;
  }

  function updateAccountCycle (address account) public {
    CallData storage methodState = method['updateAccountCycle'];
    methodState.called = true;
    methodState.firstAddress = account;
  }
}

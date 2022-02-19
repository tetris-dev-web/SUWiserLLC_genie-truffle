pragma solidity >=0.4.22 <0.6.0;
import './ActiveToken.sol';
import '../ContractStub.sol';

contract ActiveTokenMock is ActiveToken, ContractStub {

  constructor (VotingToken _votingToken) public
  ActiveToken(_votingToken) {}

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
}

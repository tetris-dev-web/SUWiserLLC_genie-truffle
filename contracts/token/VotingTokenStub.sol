pragma solidity >=0.4.22 <0.6.0;
import '../utility/VotingLocked.sol';
import '../utility/Ownable.sol';
import '../utility/SafeMath.sol';
import './InactiveToken.sol';
import './ActiveToken.sol';
import './VotingToken.sol';
import '../ContractStub.sol';

contract VotingTokenStub is VotingToken, ContractStub {
  uint256 public mockFreedUpBalance;

  function setFreedUpBalance (uint256 n) public {
    mockFreedUpBalance = n;
  }

  function freedUpBalanceOf (address a) public view returns (uint256) {
    return mockFreedUpBalance;
  }

  function assign (address voter, uint256 voteAmount) public {
    CallData storage methodState = method['assign'];
    methodState.firstAddress = voter;
    methodState.firstUint = voteAmount;
  }

  function freeUp (address voter, uint256 voteAmount) public {
    CallData storage methodState = method['freeUp'];
    methodState.firstAddress = voter;
    methodState.firstUint = voteAmount;
  }
}

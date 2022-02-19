pragma solidity >=0.4.22 <0.6.0;
import './VotingToken.sol';

contract VotingTokenMock is VotingToken {

  function initMockAssigned (address a, uint256 n) public {
    assigned[a] = n;
  }

}

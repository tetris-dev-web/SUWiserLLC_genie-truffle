pragma solidity >=0.4.22 <0.6.0;
import './Amendment.sol';

contract AmendmentMock is Amendment {
  constructor (bool _replacable) public
  Amendment(_replacable) {}

  function setFinishedAddingCoAmendments (bool b) public {
    finishedAddingCoAmendments = b;
  }

  function resetAmendmentById (uint256 n) public {
    _amendmentById[n] = address(0);
  }
}

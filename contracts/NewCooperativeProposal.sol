pragma solidity >=0.4.22 <0.6.0;
import './Amendment.sol';
import './utility/Ownable.sol';
import './Cooperative0.sol';

contract NewCooperativeProposal is Ownable {
  address public newCooperative;

  constructor (address _newCooperative) public {
    newCooperative = _newCooperative;
  }

  function executeAmendment () public {
    Cooperative0(owner).adoptNewCooperative(newCooperative);
  }
}

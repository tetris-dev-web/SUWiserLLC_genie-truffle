pragma solidity >=0.4.22 <0.6.0;
import './utility/SafeMath.sol';
import './utility/Ownable.sol';
import './Amendment.sol';

contract Cooperative is Ownable {
  address public developer;

  constructor (address _developer) public {
    developer = _developer;
  }

  bool public migrationsComplete;

  uint256 public totalAmendmentCount;
  mapping(uint256 => Amendment) public amendmentById;
  mapping(uint256 => bool) public replacable;

  function _amendmentById (uint256 amendmentId) public returns (address) {
    return address(amendmentById[amendmentId]);
  }

  function completeMigrations () external onlyOwner {
    migrationsComplete = true;
  }

  function canModify (uint256 amendmentId) public view returns (bool) {
    return replacable[amendmentId];
  }

  function migrateAmendment (Amendment amendment, bool _replacable) external onlyOwner {
    require(!migrationsComplete);
    totalAmendmentCount = totalAmendmentCount + 1;
    amendmentById[totalAmendmentCount] = amendment;
    replacable[totalAmendmentCount] = _replacable;
  }
}

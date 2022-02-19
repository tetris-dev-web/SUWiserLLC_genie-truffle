pragma solidity >=0.4.22 <0.6.0;
import '../utility/VotingLocked.sol';
import '../utility/Ownable.sol';
import '../utility/SafeMath.sol';
import './InactiveToken.sol';
import './ActiveToken.sol';

contract VotingToken is VotingLocked, Ownable {
  using SafeMath for uint256;
  ActiveToken public activeToken;
  InactiveToken public inactiveToken;

  function setActiveToken (ActiveToken _activeToken) external onlyOwner {
    activeToken = ActiveToken(_activeToken);
  }

  function setInactiveToken (InactiveToken _inactiveToken) external onlyOwner {
    inactiveToken = InactiveToken(_inactiveToken);
  }

  mapping(address => uint256) internal assigned;

  function balanceOf (address _who) public returns (uint256) {
    return inactiveToken.balanceOf(_who).add(activeToken.balanceOf(_who));
  }

  function assignedBalanceOf (address _who) public view returns (uint256) {
    if (inactiveToken.accountCycleUpdated(_who)) {
      return assigned[_who];
    }
    return 0;
  }

  function freedUpBalanceOf (address _who) public view returns (uint256) {
    return balanceOf(_who).sub(assignedBalanceOf(_who));
  }

  function freeUp (address account, uint256 amount) public onlyVoting {
    require(amount != 0 && assignedBalanceOf(account) >= amount);
    assigned[account]= assigned[account].sub(amount);
  }

  function assign (address account, uint256 amount) public onlyVoting {
    require(freedUpBalanceOf(account) >= amount);

    if (!inactiveToken.accountCycleUpdated(account)) {
      inactiveToken.updateAccountCycle(account);
      assigned[account] = amount;
    } else {
      assigned[account] = assigned[account].add(amount);
    }
  }
}

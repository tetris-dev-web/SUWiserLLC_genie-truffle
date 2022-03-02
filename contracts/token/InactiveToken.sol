pragma solidity >=0.4.22 <0.6.0;

import '../utility/CrowdsaleLocked.sol';
import '../utility/ActivationLocked.sol';
import '../utility/SafeMath.sol';
import './VotingToken.sol';
import './ActiveToken.sol';

//we need to activate pending on transfer
contract InactiveToken is CrowdsaleLocked, ActivationLocked {
  using SafeMath for uint256;
  VotingToken public votingToken;
  ActiveToken public activeToken;

  constructor (VotingToken _votingToken, ActiveToken _activeToken) public
  {
    votingToken = VotingToken(_votingToken);
    activeToken = ActiveToken(_activeToken);
  }

  event TokenActivation(address account, uint256 amount);

  event Transfer(address indexed from, address indexed to, uint256 value, , uint256 time);

  event Approval(address indexed owner, address indexed spender, uint256 value);

  mapping (address => uint256) internal _balances;

  mapping (address => mapping (address => uint256)) internal _allowed;

  uint256 internal _totalSupply;


  function totalSupply() public view returns (uint256) {
      return _totalSupply;
  }

  function allowance(address owner, address spender) public view returns (uint256) {
      return _allowed[owner][spender];
  }

  function transfer(address to, uint256 value) public returns (bool) {
      _transfer(msg.sender, to, value);
      return true;
  }

  function approve(address spender, uint256 value) public returns (bool) {
      _approve(msg.sender, spender, value);
      return true;
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool) {
      _transfer(from, to, value);
      _approve(from, msg.sender, _allowed[from][msg.sender].sub(value));
      return true;
  }

  function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
      _approve(msg.sender, spender, _allowed[msg.sender][spender].add(addedValue));
      return true;
  }

  function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
      _approve(msg.sender, spender, _allowed[msg.sender][spender].sub(subtractedValue));
      return true;
  }

  function _transfer(address from, address to, uint256 value) internal {
      require(to != address(0));
      require(votingToken.freedUpBalanceOf(from) >= value);
      prepareTransfer(from, to);
      _balances[from] = _balances[from].sub(value);
      _balances[to] = _balances[to].add(value);
      emit Transfer(from, to, value, now);
  }

  function _mint(address account, uint256 value) internal {
      require(account != address(0));

      _totalSupply = _totalSupply.add(value);
      _balances[account] = _balances[account].add(value);
      emit Transfer(address(0), account, value, now);
  }

  function _burn(address account, uint256 value) internal {
      require(account != address(0));

      _totalSupply = _totalSupply.sub(value);
      _balances[account] = _balances[account].sub(value);
      emit Transfer(account, address(0), value, now);
  }

  function _approve(address owner, address spender, uint256 value) internal {
      require(spender != address(0));
      require(owner != address(0));

      _allowed[owner][spender] = value;
      emit Approval(owner, spender, value);
  }

  struct InactiveTokenCycle {
    uint256 totalUpdated;
    mapping(address => bool) updated;
    uint256 totalAccounts;
    mapping(uint256 => address) accountById;
    mapping (address => uint256) idByAccount;
  }

  uint256 internal currentInactiveTokenCycle;
  mapping(uint256 => InactiveTokenCycle) internal inactiveTokenCycle;

  function resetInactiveTokenCycle () public onlyCrowdsale {
    _totalSupply = 0;
    currentInactiveTokenCycle = currentInactiveTokenCycle.add(1);

    InactiveTokenCycle memory newInactiveTokenCycle;
    inactiveTokenCycle[currentInactiveTokenCycle] = newInactiveTokenCycle;


    updateAccountCycle(msg.sender);
  }

  function balanceOf(address _who) public view returns (uint256) {
    if (accountCycleUpdated(_who)) {
      return _balances[_who];
    }
    return 0;
  }

  function prepareTransfer (address from, address to) internal {
    prepareBalanceChange(from);
    prepareBalanceChange(to);
    recordAccount(to);
  }

  function mint(address account, uint256 value) external onlyCrowdsale {
    prepareBalanceChange(account);
    recordAccount(account);
    _mint(account, value);
  }

  mapping(address => uint256) internal lastActivationPoints;
  uint256 public totalActivationPoints;
  uint256 public totalPendingActivations;
  uint256 internal activationMultiplier = 10e30;


  function activate(address account, uint256 amount) internal {
    activeToken.mint(account, amount);
    _burn(account, amount);
  }

  function pendingActivations(address account) public view returns (uint256) {
    require(account != crowdsale());
    uint256 pendingActivationPoints = totalActivationPoints.sub(lastActivationPoints[account]);
    uint256 inactiveAccountTokens = _balances[account];
    return inactiveAccountTokens.mul(pendingActivationPoints).div(activationMultiplier);
  }

  function activatePending (address account) public returns (bool) {
    if (account != crowdsale()) {
      uint256 tokens = pendingActivations(account);
      activate(account, tokens);
      lastActivationPoints[account] = totalActivationPoints;
      totalPendingActivations = totalPendingActivations.sub(tokens);
      emit TokenActivation(account, tokens);
    }
    return true;
  }

  function increasePendingActivations(uint256 amount) external onlyActivation {//should only be callable by activation
    require(
      currentInactiveTokenCycle == 0 ||
      (
        inactiveTokenCycle[currentInactiveTokenCycle].totalUpdated ==
        inactiveTokenCycle[currentInactiveTokenCycle.sub(1)].totalAccounts
      )
    );

    uint256 inactiveSupply = totalSupply().sub(balanceOf(crowdsale())).sub(totalPendingActivations);
    require(amount <= inactiveSupply);

    uint256 newActivationPoints = amount.mul(activationMultiplier).div(inactiveSupply);
    totalActivationPoints = totalActivationPoints.add(newActivationPoints);
    totalPendingActivations = totalPendingActivations.add(amount);
  }

  function recordAccount (address account) internal {
    if (inactiveTokenCycle[currentInactiveTokenCycle].idByAccount[account] == 0) {
      inactiveTokenCycle[currentInactiveTokenCycle].totalAccounts = inactiveTokenCycle[currentInactiveTokenCycle].totalAccounts.add(1);
      inactiveTokenCycle[currentInactiveTokenCycle].idByAccount[account] = inactiveTokenCycle[currentInactiveTokenCycle].totalAccounts;
      inactiveTokenCycle[currentInactiveTokenCycle].accountById[inactiveTokenCycle[currentInactiveTokenCycle].totalAccounts] = account;
    }
  }

  function updateAccountCycle (address account) public {
    require(!accountCycleUpdated(account));//maybe this should just be a conditional statement instead?

    activatePending(account);
    _balances[account] = 0;
    inactiveTokenCycle[currentInactiveTokenCycle].updated[account] = true;

    if (inactiveTokenCycle[currentInactiveTokenCycle.sub(1)].idByAccount[account] != 0) {
      inactiveTokenCycle[currentInactiveTokenCycle].totalUpdated = inactiveTokenCycle[currentInactiveTokenCycle].totalUpdated.add(1);
    }
  }

  function accountCycleUpdated (address account) public view returns (bool) {
    return inactiveTokenCycle[currentInactiveTokenCycle].updated[account] == true || currentInactiveTokenCycle == 0;
  }

  function prepareBalanceChange (address account) internal {
    if (!accountCycleUpdated(account)) {
      updateAccountCycle(account);
    } else {
      activatePending(account);
    }
  }
}

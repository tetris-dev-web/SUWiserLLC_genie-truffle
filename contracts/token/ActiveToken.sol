pragma solidity >=0.4.22 <0.6.0;
/* import './ERC20Base.sol'; */
/* import './IERC20.sol'; */
import '../dividends/Dividends.sol';
import '../utility/Ownable.sol';
import './VotingToken.sol';

contract ActiveToken is Ownable {
  using SafeMath for uint256;
  Dividends public dividendWallet;
  address public minter;
  VotingToken public votingToken;

  constructor (VotingToken _votingToken) public {
    votingToken = VotingToken(_votingToken);
  }

  event Transfer(address indexed from, address indexed to, uint256 value, , uint256 time);

  event Approval(address indexed owner, address indexed spender, uint256 value);

  mapping (address => uint256) internal _balances;

  mapping (address => mapping (address => uint256)) internal _allowed;

  mapping(uint256 => address) internal investorAddress;
  mapping(address => uint256) internal investorId;

  uint256 internal _totalSupply;
  uint256 public totalInvestors;

  function totalSupply() public view returns (uint256) {
      return _totalSupply;
  }

  function investorById (uint256 id) public returns (address) {
    return investorAddress[id];
  }

  function balanceOf(address owner) public view returns (uint256) {
      return _balances[owner];
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
      require(votingToken.freedUpBalanceOf(to) >= value);
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

  function setDividendWallet(address _dividendWallet) external onlyOwner {
    dividendWallet = Dividends(_dividendWallet);
  }

  function setMinter(address _minter) external onlyOwner {
    minter = _minter;
  }

  modifier onlyMinter () {
    require(msg.sender == minter);
    _;
  }

  function mint (address account, uint256 value) external onlyMinter {
    dividendWallet.distributeDividend(account);
    _mint(account, value);
  }

  function prepareTransfer (address from, address to) internal {
    recordAccount(to);
    dividendWallet.distributeDividend(from);
    dividendWallet.distributeDividend(to);
  }

  function recordAccount (address account) internal {
    if (investorId[account] == 0) {
      totalInvestors = totalInvestors.add(1);
      investorAddress[totalInvestors] = account;
      investorId[account] = totalInvestors;
    }
  }
}

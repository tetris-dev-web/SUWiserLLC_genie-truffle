pragma solidity >=0.4.22 <0.6.0;
/* import './ERC20Base.sol'; */
import './IERC20.sol';
import '../dividends/Dividends.sol';
import '../utility/Ownable.sol';
import './VotingToken.sol';
import './ActiveToken.sol';

contract ActiveTokenStub is ActiveToken {
  constructor(VotingToken _votingToken) public
  ActiveToken(_votingToken){}

    function initMockBalance (address a, uint256 n) public {
      _balances[a] = n;
      _totalSupply = _totalSupply.add(n);
    }

}

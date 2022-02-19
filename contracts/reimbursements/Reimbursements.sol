pragma solidity >=0.4.22 <0.6.0;

import '../token/InactiveToken.sol';
import '../utility/SafeMath.sol';
import '../utility/CrowdsaleLocked.sol';
import '../crowdsale/GNITokenCrowdsale.sol';

contract Reimbursements is CrowdsaleLocked {
  using SafeMath for uint256;
  uint256 public inactiveTokensAtClosing;
  uint256 public weiToReimburse;
  InactiveToken public token;

  constructor (InactiveToken _token) public payable {
    token = _token;
  }

  function () external payable {}
  function recordReimbursement () public payable onlyCrowdsale {
    inactiveTokensAtClosing = InactiveToken(token).totalSupply().sub(InactiveToken(token).totalPendingActivations());
    weiToReimburse = msg.value;
  }

  function claimReimbursement (address account) public {
    require(weiToReimburse != 0 && address(this).balance != 0);
    uint256 inactiveTokens = InactiveToken(token).balanceOf(account);
    uint256 pendingActivations = InactiveToken(token).pendingActivations(account);
    uint256 accountTokens = inactiveTokens.sub(pendingActivations);
    uint256 reimbursement = weiToReimburse.mul(accountTokens).div(inactiveTokensAtClosing);
    account.transfer(reimbursement);

    if (address(this).balance == 0) {
      weiToReimburse = 0;
      GNITokenCrowdsale(crowdsale()).allowReOpening();
    }
  }
}

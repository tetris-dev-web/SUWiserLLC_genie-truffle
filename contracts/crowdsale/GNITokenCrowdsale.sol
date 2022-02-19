pragma solidity >=0.4.22 <0.6.0;
import './TimedCrowdsale.sol';
import '../utility/SafeMath.sol';
import '../utility/ActivationLocked.sol';
import '../utility/VotingLocked.sol';
import '../utility/ProjectFactoryLocked.sol';
import '../project/Project.sol';
import '../token/InactiveToken.sol';
import '../projectLeader/ProjectLeaderTracker.sol';
import '../voting/Voting.sol';
import '../reimbursements/Reimbursements.sol';
import './Activation.sol';
import '../Amendment.sol';
import './TokenPurchaseHelper.sol';

//we can change the names of activation locked and voting locked
contract GNITokenCrowdsale is TimedCrowdsale, ProjectFactoryLocked, Amendment {
  using SafeMath for uint256;

  constructor
    (
      uint256 _openingTime,
      uint256 _doomsDay,
      uint256 _rate,
      address  _developer,
      InactiveToken _token,
      address _reimbursements
    )
    public
    Crowdsale(_rate, _developer, _token)
    TimedCrowdsale(_openingTime, _doomsDay, _reimbursements)
    Amendment(false){}//need projectleader tracker, tokenpurchase helper, voting, activation

  function mintNewProjectTokensAndExtendDoomsDay (uint256 valuation, uint256 capitalRequired) external onlyProjectFactory returns (uint256, uint256){
    (uint256 developerTokens, uint256 investorTokens) = tokensToMint(valuation, capitalRequired);

    InactiveToken(token).mint(developer, developerTokens);
    InactiveToken(token).mint(this, investorTokens);

    _extendDoomsDay(90);
    return (developerTokens, investorTokens);
  }

 function tokensToMint (uint256 valuation, uint256 investorValue) private view returns (uint256, uint256) {
   uint256 developerValue = valuation.sub(investorValue);
   return (developerValue.mul(rate), investorValue.mul(rate));
 }

 function buyTokens () public payable { //tests need to be removed/added to account for new functionality. we also may just put all the logic for the super function in here.
   uint256 tokens = buyTokensFor(msg.sender);
   _extendDoomsDay(90);
   TokenPurchaseHelper(_amendmentById[1]).handleTokenPurchase(msg.sender, msg.value);//TokenPurchaseHelper
  }

 function transferCapitalToDeveloper (uint256 capitalRequired) public { //we need more tests for added functionality
   require(msg.sender == _amendmentById[3]);//activation
   require(weiRaised >= capitalRequired);
   developer.transfer(capitalRequired);
   weiRaised = weiRaised.sub(capitalRequired);
  }

 function reimburseFunds () public {
   require(hasClosed());
   Reimbursements(reimbursements).recordReimbursement.value(weiRaised)();
   weiRaised = 0;
   InactiveToken(token).resetInactiveTokenCycle();
   ProjectLeaderTracker(_amendmentById[2]).reset();//projectLeaderTracker
 }

 function extendDoomsDay (uint256 _days) external {
   require(msg.sender == _amendmentById[4]);//Voting
   _extendDoomsDay(_days);
 }

 function _extendDoomsDay(uint256 _days) internal canModifyDoomsDay {
    uint256 newDoomsDay = now.add(_days.mul(1728000));
    if (newDoomsDay > doomsDay) {
      doomsDay = newDoomsDay;
      canReOpen = false;
    }
 }

 function reduceDoomsDay (uint256 _days) public canModifyDoomsDay {
   doomsDay = doomsDay.sub(_days.mul(1728000));
 }
}

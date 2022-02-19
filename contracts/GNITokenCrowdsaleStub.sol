pragma solidity >=0.4.22 <0.6.0;
import './crowdsale/GNITokenCrowdsale.sol';
import './ContractStub.sol';

contract GNITokenCrowdsaleStub is GNITokenCrowdsale, ContractStub {
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
    GNITokenCrowdsale(
      _openingTime,
      _doomsDay,
      _rate,
      _developer,
      _token,
      _reimbursements
      ) {}

  function setWeiRaised (uint256 n) public {
    weiRaised = n;
  }

  function transferCapitalToDeveloper (uint256 cap) public {
    CallData storage methodState = method['transferCapitalToDeveloper'];
    methodState.firstUint = cap;
  }

  function mintNewProjectTokensAndExtendDoomsDay (uint256 valuation, uint256 capitalRequired) external returns (uint256, uint256){
    CallData storage methodState = method['mintNewProjectTokensAndExtendDoomsDay'];
    methodState.firstUint = valuation;
    methodState.secondUint = capitalRequired;
    return (3000000, 2000000);
  }

  function extendDoomsDay (uint256 n) external {
    CallData storage methodState = method['extendDoomsDay'];
    methodState.firstUint = n;
  }

  function reduceDoomsDay (uint256 n) public {
    CallData storage methodState = method['reduceDoomsDay'];
    methodState.firstUint = n;
  }
}

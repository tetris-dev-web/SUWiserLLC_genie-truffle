pragma solidity >=0.4.22 <0.6.0;
import '../utility/SafeMath.sol';
import "./Crowdsale.sol";

contract TimedCrowdsale is Crowdsale {
  using SafeMath for uint256;
  uint256 public openingTime;
  uint256 public doomsDay;
  bool public canReOpen;
  address  public reimbursements;

  modifier onlyWhileOpen {
    require(block.timestamp >= openingTime && block.timestamp <= doomsDay);
    _;
  }

  modifier canModifyDoomsDay {
    require((block.timestamp >= openingTime && block.timestamp <= doomsDay) || canReOpen);
    _;
  }

  constructor(uint256 _openingTime, uint256 _doomsDay, address  _reimbursements) public {
    require(_openingTime >= block.timestamp);
    require(_doomsDay >= _openingTime);

    openingTime = _openingTime;
    doomsDay = _doomsDay;
    reimbursements = _reimbursements;
  }

  function hasClosed() public view returns (bool) {
    return block.timestamp > doomsDay;
  }

  function allowReOpening () external {
    require(msg.sender == reimbursements && hasClosed());
    canReOpen = true;
  }
}

pragma solidity >=0.4.22 <0.6.0;
import './Amendment.sol';
import './AmendmentPoll.sol';
import './utility/Ownable.sol';
import './utility/SafeMath.sol';
import './Cooperative0.sol';

contract AmendmentModificationProposal is Ownable {
  using SafeMath for uint256;
  uint256 public amendmentId;
  AmendmentPoll public amendmentPoll;
  address developer;

  constructor(uint256 _amendmentId, AmendmentPoll _amendmentPoll, address _developer) public {
    amendmentId = _amendmentId;
    amendmentPoll = AmendmentPoll(_amendmentPoll);
    developer = _developer;
  }

  uint256 public totalModifications;
  uint256 public totalModificationsExecuted;

  struct Modification {
    address newAmendment;
    bool executed;
    bool exists;
  }
  mapping(uint256 => Modification) public modificationByCoAmendment;


  function addModification (uint256 coAmendmentId, Amendment newCoAmendment) external {
    require(msg.sender == developer);
    require(Cooperative0(owner).canModify(coAmendmentId));
    require(!amendmentPoll.open());
    totalModifications = totalModifications.add(1);
    Modification memory newModification;
    newModification.newAmendment = address(newCoAmendment);
    newModification.exists = true;
    modificationByCoAmendment[coAmendmentId] = newModification;
  }

  function executeModification (uint256 coAmendmentId) external {
    require(modificationByCoAmendment[coAmendmentId].exists);
    modificationByCoAmendment[coAmendmentId].exists = false;
    totalModificationsExecuted = totalModificationsExecuted.add(1);
    address newCoAmendment = modificationByCoAmendment[coAmendmentId].newAmendment;
    bool finalModification = totalModificationsExecuted == totalModifications;

    Cooperative0(owner).adoptAmendmentModification(
      amendmentId,
      coAmendmentId,
      newCoAmendment,
      finalModification
      );
  }
}

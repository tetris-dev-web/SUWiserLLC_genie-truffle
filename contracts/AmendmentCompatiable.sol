pragma solidity >=0.4.22 <0.6.0;

contract Amendment {
  mapping(uint256 => address) public amendmentById;

  bool private _valid;

  modifier onlyWhileValid () {
    require(_valid);
    _;
  }

  constructor (
      address coAmendment1,
      address coAmendment2,
      address coAmendment3,
      address coAmendment4,
      address coAmendment5,
      address coAmendment6
    ) public {
      amendmentById[1] = coAmendment1;
      amendmentById[2] = coAmendment2;
      amendmentById[3] = coAmendment3;
      amendmentById[4] = coAmendment4;
      amendmentById[5] = coAmendment5;
      amendmentById[6] = coAmendment6;
      _valid = true;
    }

    function modifyAmendment(uint256 coAmendmentToUpdateId, address newReferenceAmendment) external {
      amendmentById[coAmendmentToUpdateId] = newReferenceAmendment;
    }

    function closeFunctionality() external {
      _valid = false;
    }
}

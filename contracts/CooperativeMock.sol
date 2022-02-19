pragma solidity >=0.4.22 <0.6.0;
import './Amendment.sol';
import './AmendmentModificationProposal.sol';
import './utility/SafeMath.sol';
import './Cooperative0.sol';

contract CooperativeMock is Cooperative0 {
  constructor(address _developer, AmendmentPoll _amendmentPoll) public
  Cooperative0(_developer, _amendmentPoll) {}

  function setStubProposals (Proposals _proposals) external {
    currentProposals = _proposals;
  }

  function setTotalCompleteAdoptions (uint256 n) public {
    totalCompleteAdoptions = n;
  }

  function getCurrentProposals () public returns (address) {
    return address(currentProposals);
  }

  function setCurrentProposals (Proposals _proposals) public {
    currentProposals = Proposals(_proposals);
  }

  function setCanInitElection (bool b) public {
    canInitElection = b;
  }

  function setNewCooperative (address c) public {
    newCooperative = c;
  }

  function clearNewCooperative () public {
    newCooperative = address(0);
  }

  function setTotalAmendmentCount (uint256 n) public {
    totalAmendmentCount = n;
  }

  function addAmendment (uint256 n, address a) public {
    amendmentById[n] = Amendment(a);
  }

  function setMigrationStatus (uint256 n, bool b) public {
    migrated[n] = b;
  }

  function getMigrationStatus (uint256 n) public returns (bool) {
    return migrated[n];
  }

  function setReplacableStatus (uint256 n, bool b) public {
    replacable[n] = b;
  }

  function setTotalAmendmentsMigrated (uint256 n) public {
    totalAmendmentsMigrated = n;
  }
 }

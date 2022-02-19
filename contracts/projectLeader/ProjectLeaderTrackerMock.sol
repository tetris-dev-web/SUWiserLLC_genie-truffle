 pragma solidity >=0.4.22 <0.6.0;
 import './ProjectLeaderTracker.sol';

 contract ProjectLeaderTrackerMock is ProjectLeaderTracker {
   function totalChecked () public view returns(uint256) {
     return checkCycle[currentCheckCycle].totalChecked;
   }

   function checkedStatusOf(address projectAddr) public view returns (bool) {
     return checkCycle[currentCheckCycle].isChecked[projectAddr];
   }

   function setMockCheckedStatus (address  projectAddr, bool status) public {
     checkCycle[currentCheckCycle].isChecked[projectAddr] = status;
   }

   function setStubCandidateCount (uint256 count) public {
     candidateCount = count;
   }

   function setMockTotalChecked(uint256 num) public {
     checkCycle[currentCheckCycle].totalChecked = num;
   }

   function setMockTentativeLeader (address  mockAddr) public {
     tentativeLeaderAddr = mockAddr;
   }

   function resetMockTentativeProject () public {
     tentativeLeaderAddr = address(0);
     leadingVoteCount = 0;

     ProjectsChecked memory newProjectsChecked;
     currentCheckCycle = currentCheckCycle.add(1);
     checkCycle[currentCheckCycle] = newProjectsChecked;
   }

   function mockTentativeLeaderConfirmed () public view returns (bool) {
     return tentativeLeaderConfirmed();
   }

   function setMockLeadingVoteCount (uint256 count) public {
     leadingVoteCount = count;
   }
   /* function considerTentativeLeaderShip (uint256 _projectId) public {
     CallData storage methodState = method['considerTentativeLeaderShip'];
     methodState.firstUint = _projectId;
   }

   function considerTentativeLeaderShip_ (uint256 _projectId) public {
     super.considerTentativeLeaderShip(_projectId);
   } */

   /* function attemptProjectActivation () public {
     CallData storage methodState = method['attemptProjectActivation'];
     methodState.called = true;
   }

   function attemptProjectActivation_ () public {
     super.attemptProjectActivation(); */
   /* } */
 }

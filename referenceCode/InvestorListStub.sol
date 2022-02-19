pragma solidity >=0.4.22 <0.6.0;

import './InvestorList.sol';
import './ContractStub.sol';

contract InvestorListStub is InvestorList, ContractStub {
  address mockInvestorA;
  address mockInvestorB;
  address mockInvestorC;

  function initMockInvestors (address investorA, address investorB) public {
    mockInvestorA = investorA;
    mockInvestorB = investorB;
  }

  function addrById (uint256 id) public view returns (address) {
    address a;

    if (id == 1) {
      a = mockInvestorA;
    }

    if (id == 2) {
      a = mockInvestorB;
    }

    return a;
  }

  function investorCount () external view returns(uint256) {
    return 2;
  }

  function addInvestor (address investorAddr) external {
    CallData storage methodState = method['addInvestor'];
    methodState.called = true;
    methodState.firstAddress = investorAddr;
  }

  function addVoteCredit (address investorAddr, uint256 votes) public {
    CallData storage methodState = method['addVoteCredit'];
    methodState.called = true;

    if (methodState.firstAddress == address(0)) {
      methodState.firstAddress = investorAddr;
      methodState.firstUint = votes;
    } else if (methodState.secondAddress == address(0)) {
      methodState.secondAddress = investorAddr;
      methodState.secondUint = votes;
    } else {
      methodState.thirdAddress = investorAddr;
      methodState.thirdUint = votes;
    }
  }

  function removeVoteCredit (address investorAddr, uint256 votes) public {
    CallData storage methodState = method['removeVoteCredit'];
    methodState.called = true;
    methodState.firstAddress = investorAddr;
    methodState.firstUint = votes;
  }
}

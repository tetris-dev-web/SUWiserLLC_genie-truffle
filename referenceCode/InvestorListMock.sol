pragma solidity >=0.4.22 <0.6.0;

import './InvestorList.sol';

contract InvestorListMock is InvestorList {
  function addTestInvestor (
      address investorAddr,
      uint256 voteCredit
    ) external {
      Investor memory newInvestor;
      investorCount_ = investorCount_.add(1);
      uint256 id = investorCount_;

      newInvestor.id = id;
      newInvestor.addr = investorAddr;
      newInvestor.voteCredit = voteCredit;

      investorIds[investorAddr] = id;
      investors[id] = newInvestor;
  }

  function getVoteCredit (address investor) public view returns (uint256) {
    return investors[investorIds[investor]].voteCredit;
  }
}

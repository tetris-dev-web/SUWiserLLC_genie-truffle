pragma solidity >=0.4.22 <0.6.0;
import './utility/Ownable.sol';
import './utility/SafeMath.sol';
import './AmendmentPoll.sol';
import './token/ActiveToken.sol';
import './ContractStub.sol';

contract AmendmentPollStub is AmendmentPoll, ContractStub {
  constructor (ActiveToken _token) public AmendmentPoll(_token){}
    bool public proposalsPassed;

    function setProposalsPassed (bool b) public {
      proposalsPassed = b;
    }

    bool public proposalsFailed;

    function setProposalsFailed (bool b) public {
      proposalsFailed = b;
    }

    function openPoll () external {
      CallData storage methodState = method['openPoll'];
      methodState.firstAddress = msg.sender;
    }
}

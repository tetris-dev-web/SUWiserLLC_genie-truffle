pragma solidity >=0.4.22 <0.6.0;
import './Project.sol';
import '../ContractStub.sol';

contract ProjectStub is Project, ContractStub {
  constructor (
    string memory _projectInfo,
    address _developer,
    uint256 _valuation,
    uint256 _capitalRequired,
    uint256 _developerTokens,
    uint256 _investorTokens,
    string _cashFlow,
    uint256 _mockVotes,
    address _dividendWallet
    )
    public
    Project(
      _projectInfo,
      _developer,
      _valuation,
      _capitalRequired,
      _developerTokens,
      _investorTokens,
      _cashFlow,
      _dividendWallet
      )
      {
    totalVotes = _mockVotes;
  }

  function setMockVotes (uint256 mockVotes) public {
    totalVotes = mockVotes;
  }

  function setStubClosingTime (uint256 time) public {
    closingTime = time;
  }

  function vote (address voter, uint256 voteAmount) external {
    CallData storage methodState = method['vote'];
    methodState.firstAddress = voter;
    methodState.firstUint = voteAmount;
  }

  function voteAgainst (address voter, uint256 voteAmount) external {
    CallData storage methodState = method['voteAgainst'];
    methodState.firstAddress = voter;
    methodState.firstUint = voteAmount;
  }

  function removeVotes (address voter, uint256 voteAmount) external {
    CallData storage methodState = method['removeVotes'];
    methodState.firstAddress = voter;
    methodState.firstUint = voteAmount;
  }

  /* function removeVotes (address voter, uint256 voteAmount) external {
    CallData storage methodState = method['removeVotes'];
    if (methodState.firstAddress == address(0)) {
      methodState.firstAddress = voter;
      methodState.firstUint = voteAmount;
    } else if (methodState.secondAddress == address(0)) {
      methodState.secondAddress = voter;
      methodState.secondUint = voteAmount;
    } else {
      methodState.thirdAddress = voter;
      methodState.thirdUint = voteAmount;
    }
  } */

  bool stubActiveStatus;

  function setStubActiveStatus (bool status) public {
    active = status;
  }

  bool stubOpenStatus;

  function setStubOpenStatus (bool status) public {
    stubOpenStatus = status;
  }

  function open () public view returns (bool) {
    return stubOpenStatus;
  }

  uint256 stubCapRequired;

  function setStubCapRequired (uint256 cap) public {
    stubCapRequired = cap;
  }

  function capitalRequired_ () public view returns (uint256) {
    return stubCapRequired;
  }
  uint256 public developerTokens = 10000000;
  uint256 public investorTokens = 10000000;
  /* function developerTokens () public returns (uint256) {
    return 10000000;
  }

  function investorTokens () public returns (uint256) {
    return 10000000;
  } */

  function activate () external returns(uint256){
    CallData storage methodState = method['activate'];
    methodState.called = true;
    return now;
  }

  function setMockVotesOf (address voter, uint256 amount) public {
    votes[voter] = amount;
  }

  function transferOwnership (address a) public {
    CallData storage methodState = method["transferOwnership"];
    methodState.firstAddress = a;
    methodState.called = true;
  }

  function transferPrimary (address a) public {
    CallData storage methodState = method["transferPrimary"];
    methodState.firstAddress = a;
    methodState.called = true;
  }
}

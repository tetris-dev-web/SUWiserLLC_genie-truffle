pragma solidity >=0.4.22 <0.6.0;

contract ContractStub {
  struct CallData {
    uint256 firstUint;
    uint256 secondUint;
    uint256 thirdUint;
    string firstString;
    string secondString;
    string thirdString;
    address firstAddress;
    address secondAddress;
    address thirdAddress;
    bool called;
    bool firstBool;
  }

  mapping(string => CallData) internal method;

  function addMethod (string memory methodName) public {
    
    CallData memory newCallData;
    method[methodName] = newCallData;
  }

  function resetMethod (string memory methodName) public {
    CallData storage data = method[methodName];

    data.firstUint = 0;
    data.secondUint = 0;
    data.thirdUint = 0;
    data.firstString = '';
    data.secondString = '';
    data.thirdString = '';
    data.firstAddress = address(0);
    data.secondAddress = address(0);
    data.thirdAddress = address(0);
    data.called = false;
    data.firstBool = false;
  }

  function callHistory (string memory methodName) public view returns (
    uint256,
    uint256,
    uint256,
    string memory,
    string memory,
    string memory,
    address,
    address,
    address,
    bool,
    bool
    ) {
    CallData memory data = method[methodName];
    return (
      data.firstUint,
      data.secondUint,
      data.thirdUint,
      data.firstString,
      data.secondString,
      data.thirdString,
      data.firstAddress,
      data.secondAddress,
      data.thirdAddress,
      data.called,
      data.firstBool
    );
  }
}

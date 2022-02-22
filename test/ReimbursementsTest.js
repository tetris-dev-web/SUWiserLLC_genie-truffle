// 
//
//
// it('sets inactiveTokensAtClosing to totalInactiveSupply - totalPendingActivations', async () => {
//   let inactiveTokensAtClosing = await mockGTC.inactiveTokensAtClosing();
//   assert.equal(inactiveTokensAtClosing, 60000000, 'should set inactiveTokensAtClosing to totalInactiveSupply - totalPendingActivations');
// })
//
// it('sets weiToReimburse to weiRaised', async () => {
//   let weiToReimburse = await mockGTC.weiToReimburse();
//   assert.equal(weiToReimburse, 1200000, 'should set weiToReimburse to weiRaised');
// })
//
// describe('claimReimbursement', async () => {
//   let initialAccountWei;
//   let initialContractWei;
//   before(async () => {
//     await mockGTC.receiveMockWei({value: 1200000, from: accounts[3]});
//     await tokenStub.init(accounts[1], accounts[2], accounts[3]);
//     await mockGTC.setMockWeiToReimburse(1200000);
//     await mockGTC.setMockInactiveTokensAtClosing(60000000);
//     await tokenStub.setStubPendingActivations(accounts[1], 4000000);
//
//     let contractBalance = await web3.eth.getBalance(mockGTC.address);
//     initialContractWei = new BigNumber(contractBalance.toString());
//     let accountBalance = await web3.eth.getBalance(accounts[1]);
//     initialAccountWei = await BigNumber(accountBalance.toString());
//
//     await mockGTC.claimReimbursement(accounts[1]);
//   })
//
//   it('adds wei to the account as a function of (acount inactive - account pending) * weiToReimburse / inactiveTokensAtClosing', async () => {
//     let accountBalance = await web3.eth.getBalance(accounts[1]);
//     let finalAccountWei = await BigNumber(accountBalance.toString());
//     let expected = initialAccountWei.plus('160000').decimalPlaces(0);
//     assert(finalAccountWei.isEqualTo(expected), `expected ${expected} but got ${finalAccountWei}`);
//   })
//
//   it('removes the same wei amount from the contract', async () => {
//     let contractBalance = await web3.eth.getBalance(mockGTC.address);
//     let finalContractWei = await BigNumber(contractBalance.toString());
//     let expected = initialContractWei.minus('160000').decimalPlaces(0);
//     assert(finalContractWei.isEqualTo(expected), `expected ${expected} but got ${finalContractWei}`);
//   })
// })

/* function setMockWeiToReimburse (uint256 amount) public {
  weiToReimburse = amount;
}

function setMockInactiveTokensAtClosing (uint256 amount) public {
  inactiveTokensAtClosing = amount;
} */

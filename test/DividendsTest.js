const DividendsMock = artifacts.require("DividendsMock");
const TokenStub = artifacts.require("TokenStub");
const InvestorListStub = artifacts.require("InvestorListStub");
const BigNumber = require('bignumber.js');
const exceptions = require('./exceptions');
const { parseBN, parseMethod, weiBalanceOf } = require('./parseUtil');
let accounts;
let mD;
const multiplier = new BigNumber('10e30');

contract('Dividends', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  })

  describe('payable', async () => {
    let initialBalance;
    let initialPoints;
    let addedEther;

    before(async () => {
      let balance = await web3.eth.getBalance(mD.address);
      initialBalance = await web3.fromWei(balance.toNumber(), 'ether');
      let points = await mD.totalDividendPoints();
      initialPoints = new BigNumber(points.toString());
      addedWei = new BigNumber('1e18');
      await web3.eth.sendTransaction({from: accounts[1], to: mD.address, value: web3.toWei(1, "ether")});
    })

    it('should increase the contract ether by the value sent', async () => {
      let balance = await web3.eth.getBalance(mD.address);
      let afterBalance = await web3.fromWei(balance.toNumber(), 'ether');
      assert.equal(Number(afterBalance), Number(initialBalance) + 1, 'contract ether not increased by the value');
    })

    it('should increase totalDividendPoints as a function of (wei value * multiplier) / totalTokens', async () => {
      let points = await mD.totalDividendPoints();
      let afterPoints = new BigNumber(points.toString());
      let expected = initialPoints.plus(addedWei).times(multiplier).dividedBy('90000000').decimalPlaces(0);

      assert(afterPoints.isEqualTo(expected), 'totalDividendPoints not increased by the proper amount');
    })
  })

  describe('distributeDividend', async () => {
    let initialAccountEth;
    let initialContractEth;

    before(async () => {
      await mD.addMockTotalDividendPonts(4, 80000000);
      await mD.addMockTotalDividendPonts(5, 90000000);
      await mD.setMockLastDividendPoints(4, 80000000, accounts[3]);

      let contractBalance = await web3.eth.getBalance(mD.address);
      initialContractEth = await web3.fromWei(contractBalance.toNumber(), 'ether');

      let accountBalance = await web3.eth.getBalance(accounts[3]);
      initialAccountEth = await web3.fromWei(accountBalance.toNumber(), 'ether');
      await mD.distributeDividend(accounts[3]);
    })

    it('distributes a dividend based on the amount owed', async () => {
      let contractBalance = await web3.eth.getBalance(mD.address);
      let afterContractEth = await web3.fromWei(contractBalance.toString(), 'ether');
      let contractLoss = initialContractEth - afterContractEth;

      let accountBalance = await web3.eth.getBalance(accounts[3]);
      let afterAccountEth = await web3.fromWei(accountBalance.toString(), 'ether');

      let accountAddition = afterAccountEth - initialAccountEth;

      assert.equal(accountAddition.toFixed(10), .1666666667, 'incorrect ether amount transferred');
      assert.equal(contractLoss.toFixed(10), accountAddition.toFixed(10), 'ether removed from contract not equal to ether received by account');
    })

    it('sets the accounts lastDividendPoints to the totallDividendPoints', async () => {
      let lastPoints = await mD.lastDividendPointsOf(accounts[3]);
      lastPoints = new BigNumber(lastPoints.toString());
      let totalPoints = await mD.totalDividendPoints();
      totalPoints = new BigNumber(totalPoints.toString());
      assert(lastPoints.isEqualTo(totalPoints), 'lastDividend for account should be set to totalDividendPoints');
    })
  })
})



const setUp = async () => {
  let iL = await InvestorListStub.new();
  iL.initMockInvestors(accounts[2], accounts[3]);
  let token = await TokenStub.new(iL.address);
  token.init(accounts[1], accounts[2], accounts[3]);

  mD = await DividendsMock.new(token.address, accounts[1]);
  // await web3.eth.sendTransaction({from: accounts[1], to: mD.address, value: web3.toWei(9, "ether")});
}

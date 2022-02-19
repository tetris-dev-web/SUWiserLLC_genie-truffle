const VotingTokenStub = artifacts.require('VotingTokenStub');
const DividendsStub = artifacts.require('DividendsStub');
const ActiveTokenMock = artifacts.require('ActiveTokenMock');

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');
const { parseBN, parseMethod, parseWithArg } = require('./parseUtil');

let accounts;

let activeToken;
let votingToken;
let dividends;

let totalSupplyT1;
let senderTotalBalanceT1;
let receiverTotalBalanceT1;

contract('ActiveToken', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  describe('totalSupply', async () => {
    it('returns the total supply of tokens', async () => {
      let bigNumber = await activeToken.totalSupply();
      let supply = parseBN(bigNumber);
      assert.equal(supply, 7000000, 'incorrect total supply');
    });
  });

  describe('balanceOf', async () => {
    it('returns the total balance of the passed address', async () => {
      let balance = await parseWithArg(getTotalBalance, accounts[1]);
      assert.equal(balance, 4000000, 'incorrect balance for account');
    });
  });

  describe('transfer', async () => {
    describe('when the sender can cover the value', async () => {
      describe('when the sender has enough freed up tokens', async () => {
        before(async () => {
          await votingToken.setFreedUpBalance(4000);
          await stubUtil.addMethod(dividends, 'distributeDividend');
          await activeToken.transfer(accounts[2], 3000, { from: accounts[1] });
        });

        after(async () => {
          await resetBalances();
          await stubUtil.resetMethod(dividends, 'distributeDividend');
        });

        it('distributes dividends to the parties involved', async () => {
          let { firstAddress, secondAddress } = await stubUtil.callHistory(
            dividends,
            'distributeDividend',
          );
          assert.equal(firstAddress, accounts[1], 'should distribute dividend to the sender');
          assert.equal(secondAddress, accounts[2], 'should distribute dividend to the receiver');
        });

        it('removes the token value from the senders total balance', async () => {
          let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
          assert.equal(
            senderTotalBalanceT2,
            senderTotalBalanceT1 - 3000,
            'sender total balance should decrease by the value',
          );
        });

        it('does not change totalSupply', async () => {
          let totalSupplyT2 = await parseMethod(getTotalSupply);
          assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
        });
      });
      describe('when the sender does not have enough freed up tokens', async () => {
        before(async () => {
          await votingToken.setFreedUpBalance(2000);
        });

        after(async () => {
          await votingToken.setFreedUpBalance(4000);
          await resetBalances();
        });

        it('reverts', async () => {
          await exceptions.catchRevert(
            activeToken.transfer(accounts[2], 3000, { from: accounts[1] }),
          );
        });
      });
    });
    describe('when the sender cannot cover the value', async () => {
      before(async () => {
        await votingToken.setFreedUpBalance(6000000);
      });
      it('reverts', async () => {
        await exceptions.catchInvalidOpcode(
          activeToken.transfer(accounts[2], 5000000, { from: accounts[1] }),
        );
      });
    });
  });

  describe('transferFrom', async () => {
    describe('when the sender is not allowed to spend the amount', async () => {
      after(async () => {
        await resetBalances();
      });

      it('reverts', async () => {
        await exceptions.catchInvalidOpcode(
          activeToken.transferFrom(accounts[1], accounts[2], 2000, { from: accounts[0] }),
        );
      });
    });

    describe('when the sender is allowed to spend the amount', async () => {
      describe('when the from address has enough active tokens to transfer', async () => {
        before(async () => {
          await activeToken.approve(accounts[0], 3000, { from: accounts[1] });
          await activeToken.transferFrom(accounts[1], accounts[2], 3000, { from: accounts[0] });
        });

        after(async () => {
          await resetBalances();
        });

        it('removes the token value from the from address total balance', async () => {
          let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
          assert.equal(
            senderTotalBalanceT2,
            senderTotalBalanceT1 - 3000,
            'from total balance should decrease by the value',
          );
        });

        it('adds the token value to the recipients total balance', async () => {
          let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
          assert.equal(
            receiverTotalBalanceT2,
            receiverTotalBalanceT1 + 3000,
            'recipient total balance should increase by the value',
          );
        });

        it('does not change totalSupply', async () => {
          let totalSupplyT2 = await parseMethod(getTotalSupply);
          assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
        });
      });

      describe('when the from address does not have enough active tokens to cover the transfer', async () => {
        before(async () => {
          await activeToken.approve(accounts[0], 6000000, { from: accounts[1] });
        });

        after(async () => {
          await resetBalances();
        });

        it('reverts', async () => {
          await exceptions.catchInvalidOpcode(
            activeToken.transferFrom(accounts[1], accounts[2], 6000000, { from: accounts[0] }),
          );
        });
      });
    });
  });

  describe('mint', async () => {
    describe('when called by the owner', async () => {
      before(async () => {
        await activeToken.setMinter(accounts[0]);
        await stubUtil.addMethod(dividends, 'distributeDividend');
        await activeToken.mint(accounts[2], 3000, { from: accounts[0] });
      });

      after(async () => {
        resetBalances();
      });

      it('distributes dividends to the receiver', async () => {
        let { firstAddress } = await stubUtil.callHistory(dividends, 'distributeDividend');
        assert.equal(firstAddress, accounts[2], 'should distribute dividend to the receiver');
      });

      it('increases the totalSupply by the amount', async () => {
        let totalSupplyT2 = await parseMethod(getTotalSupply);
        assert.equal(
          totalSupplyT2,
          totalSupplyT1 + 3000,
          'totalSupply should increase by the amount',
        );
      });

      it('increases the receivers total balance by the amount', async () => {
        let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
        assert.equal(
          receiverTotalBalanceT2,
          receiverTotalBalanceT1 + 3000,
          'receiver balance should increase by the amount',
        );
      });
    });

    describe('when called by an account other than the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(activeToken.mint(accounts[2], 3000, { from: accounts[1] }));
      });
    });
  });
});

const setUp = async () => {
  votingToken = await VotingTokenStub.new();
  activeToken = await ActiveTokenMock.new(votingToken.address);
  dividends = await DividendsStub.new(activeToken.address);
  activeToken.setDividendWallet(dividends.address);
  await resetBalances();
  await setValues();
};

const getTotalSupply = async () => {
  return await activeToken.totalSupply();
};

const getTotalBalance = async (account) => {
  return await activeToken.balanceOf(account);
};

const resetBalances = async () => {
  await activeToken.resetSupply();
  await activeToken.initMockBalance(accounts[1], 4000000);
  await activeToken.initMockBalance(accounts[2], 3000000);
};

const setValues = async () => {
  totalSupplyT1 = await parseMethod(getTotalSupply);
  senderTotalBalanceT1 = await parseWithArg(getTotalBalance, accounts[1]);
  receiverTotalBalanceT1 = await parseWithArg(getTotalBalance, accounts[2]);
};

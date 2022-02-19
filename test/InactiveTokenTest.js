const VotingTokenStub = artifacts.require('VotingTokenStub');
const ActiveTokenStub = artifacts.require('ActiveTokenStub');
const InactiveTokenMock = artifacts.require('InactiveTokenMock');

const BigNumber = require('bignumber.js');
const multiplier = new BigNumber('10e30');

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');
const { parseBN, parseMethod, parseWithArg } = require('./parseUtil');

let accounts;

let inactiveToken;
let activeToken;
let votingToken;

let totalSupplyT1;
let senderTotalBalanceT1;
let receiverTotalBalanceT1;

contract('InactiveToken', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  describe('totalSupply', async () => {
    it('returns the total supply of tokens', async () => {
      let bigNumber = await inactiveToken.totalSupply();
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
          await stubUtil.addMethod(inactiveToken, 'updateAccountCycle');
          await stubUtil.addMethod(inactiveToken, 'activatePending');
        });

        describe('when the receiver has been updated with the current inactive token cycle', async () => {
          before(async () => {
            await inactiveToken.setMockCycleUpdateStatus(accounts[1], true);
            await inactiveToken.setMockCycleUpdateStatus(accounts[2], true);
            await inactiveToken.transfer(accounts[2], 3000, { from: accounts[1] });
          });

          after(async () => {
            await stubUtil.resetMethod(inactiveToken, 'updateAccountCycle');
            await stubUtil.resetMethod(inactiveToken, 'activatePending');
            await resetBalances();
          });

          it('removes the token value from the senders total balance', async () => {
            let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
            assert.equal(
              senderTotalBalanceT2,
              senderTotalBalanceT1 - 3000,
              'sender total balance should decrease by the value',
            );
          });

          it('adds the token value to the receivers balnce', async () => {
            let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
            assert.equal(
              receiverTotalBalanceT2,
              receiverTotalBalanceT1 + 3000,
              'sender total balance should decrease by the value',
            );
          });

          it('does not change totalSupply', async () => {
            let totalSupplyT2 = await parseMethod(getTotalSupply);
            assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
          });

          it('does not update the account to the current cycle', async () => {
            let { called } = await stubUtil.callHistory(inactiveToken, 'updateAccountCycle');
            assert(!called, 'should not update an account that has already been updated');
          });

          it('activates the accounts pending activations', async () => {
            let { called } = await stubUtil.callHistory(inactiveToken, 'activatePending');
            assert(called, 'should activate the accounts pedning activation');
          });
        });

        describe('when the receiver has not been updated with the current inactive token cycle', async () => {
          before(async () => {
            await stubUtil.addMethod(inactiveToken, 'updateAccountCycle');
            await stubUtil.addMethod(inactiveToken, 'activatePending');
            await inactiveToken.setMockCycleUpdateStatus(accounts[2], false);
            await inactiveToken.transfer(accounts[2], 3000, { from: accounts[1] });
          });

          after(async () => {
            await stubUtil.resetMethod(inactiveToken, 'updateAccountCycle');
            await stubUtil.resetMethod(inactiveToken, 'activatePending');
            await resetBalances();
          });

          it('removes the token value from the senders total balance', async () => {
            let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
            assert.equal(
              senderTotalBalanceT2,
              senderTotalBalanceT1 - 3000,
              'sender total balance should decrease by the value',
            );
          });

          it('sets the receivers balance to the amount', async () => {
            let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
            assert.equal(
              receiverTotalBalanceT2,
              3000,
              'sender total balance should decrease by the value',
            );
          });

          it('does not change totalSupply', async () => {
            let totalSupplyT2 = await parseMethod(getTotalSupply);
            assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
          });

          it('updates the account to the current cycle', async () => {
            let { called } = await stubUtil.callHistory(inactiveToken, 'updateAccountCycle');
            assert(called, 'should update the account to the current voting cycle');
          });

          it('activates the accounts pending activations', async () => {
            let { called } = await stubUtil.callHistory(inactiveToken, 'activatePending');
            assert(called, 'should activate the accounts pedning activation');
          });
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
            inactiveToken.transfer(accounts[2], 3000, { from: accounts[1] }),
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
          inactiveToken.transfer(accounts[2], 5000000, { from: accounts[1] }),
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
          inactiveToken.transferFrom(accounts[1], accounts[2], 2000, { from: accounts[0] }),
        );
      });
    });

    describe('when the sender is allowed to spend the amount', async () => {
      describe('when the from address has enough active tokens to transfer', async () => {
        before(async () => {
          await inactiveToken.setMockCycleUpdateStatus(accounts[2], true);
          await inactiveToken.approve(accounts[0], 3000, { from: accounts[1] });
          await inactiveToken.transferFrom(accounts[1], accounts[2], 3000, { from: accounts[0] });
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
          await inactiveToken.approve(accounts[0], 6000000, { from: accounts[1] });
        });

        after(async () => {
          await resetBalances();
        });

        it('reverts', async () => {
          await exceptions.catchInvalidOpcode(
            inactiveToken.transferFrom(accounts[1], accounts[2], 6000000, { from: accounts[0] }),
          );
        });
      });
    });
  });

  describe('mint', async () => {
    describe('when called by the owner', async () => {
      describe('when the account is up to date with the current cycle', async () => {
        before(async () => {
          await stubUtil.addMethod(inactiveToken, 'updateAccountCycle');
          await stubUtil.addMethod(inactiveToken, 'activatePending');
          await inactiveToken.mint(accounts[2], 3000, { from: accounts[0] });
        });

        after(async () => {
          resetBalances();
        });

        it('does not update the account to the current cycle', async () => {
          let { called } = await stubUtil.callHistory(inactiveToken, 'updateAccountCycle');
          assert(!called, 'should not update an account that has already been updated');
        });

        it('activates the accounts pending activations', async () => {
          let { called } = await stubUtil.callHistory(inactiveToken, 'activatePending');
          assert(called, 'should activate the accounts pedning activation');
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

      describe('when the account is not up to date with the current cycle', async () => {
        before(async () => {
          await stubUtil.addMethod(inactiveToken, 'updateAccountCycle');
          await stubUtil.addMethod(inactiveToken, 'activatePending');
          await inactiveToken.setMockCycleUpdateStatus(accounts[2], false);
          await inactiveToken.mint(accounts[2], 3000, { from: accounts[0] });
        });

        it('updates the account to the current cycle', async () => {
          let { called } = await stubUtil.callHistory(inactiveToken, 'updateAccountCycle');
          assert(called, 'should update the account to the current voting cycle');
        });

        it('activates the accounts pending activations', async () => {
          let { called } = await stubUtil.callHistory(inactiveToken, 'activatePending');
          assert(called, 'should activate the accounts pedning activation');
        });

        it('increases the totalSupply by the amount', async () => {
          let totalSupplyT2 = await parseMethod(getTotalSupply);
          assert.equal(
            totalSupplyT2,
            totalSupplyT1 + 3000,
            'totalSupply should increase by the amount',
          );
        });

        it('sets the receivers total balance to the amount', async () => {
          let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
          assert.equal(
            receiverTotalBalanceT2,
            3000,
            'receiver balance should increase by the amount',
          );
        });
      });
    });

    describe('when called by an account other than the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(inactiveToken.mint(accounts[2], 3000, { from: accounts[1] }));
      });
    });
  });

  describe('activatePending', async () => {
    before(async () => {
      await inactiveToken.setMockTotalPendingActivations(5000);
      await inactiveToken.setMockTotalActivationPonts(9000, 10000);
      await inactiveToken.setMockLastActivationPoints(3000, 4000, accounts[2]);
      await inactiveToken.setMockCycleUpdateStatus(accounts[2], true);
      await stubUtil.addMethod(inactiveToken, 'activate');
      await inactiveToken._activatePending(accounts[2]);
    });

    after(async () => {
      await resetBalances();
    });

    it('activates tokens as a function of (totalActivationPoints - lastActivationPoints) * inactiveAccountTokens', async () => {
      let { firstAddress, firstUint, called } = await stubUtil.callHistory(
        inactiveToken,
        'activate',
      );
      assert.equal(firstAddress, accounts[2], 'tokens not activated for the correct account');
      assert.equal(firstUint, 450, 'incorrect number of tokens activated');
    });

    it('sets the accounts lastActivationPoints to the totallActivationPoints', async () => {
      let lastPoints = await inactiveToken.lastActivationPointsOf(accounts[2]);
      lastPoints = new BigNumber(lastPoints.toString());
      let totalPoints = await inactiveToken.totalActivationPoints();
      totalPoints = new BigNumber(totalPoints.toString());
      assert(
        lastPoints.isEqualTo(totalPoints),
        'lastActivation for account should be set to totalActivationPoints',
      );
    });

    it('reduces the totalPendingActivations by the number of tokens activated', async () => {
      let finalPendingActivations = await parseMethod(inactiveToken.totalPendingActivations);
      assert.equal(
        finalPendingActivations,
        4550,
        'totalPendingActivations not reduced by the number of tokens activated',
      );
    });
  });

  describe('increasePendingActivations', async () => {
    let initialPendingActivations;
    let initialPoints;
    let supply;
    let points;

    before(async () => {
      initialPendingActivations = await parseMethod(inactiveToken.totalPendingActivations);
      let totalSupply = await parseMethod(getTotalSupply);
      supply = (totalSupply - initialPendingActivations).toString();
      points = await inactiveToken.totalActivationPoints();
      console.log('before', parseBN(points));
      console.log(
        'expected difference',
        (5000000 * multiplier) / (totalSupply - initialPendingActivations),
      );
      initialPoints = new BigNumber(points.toString());
      await resetBalances();
      await inactiveToken.increasePendingActivations(5000000);
    });

    after(async () => {
      await resetBalances();
    });

    it('should increase the totalPendingActivations by the amount', async () => {
      let finalPendingActivations = await parseMethod(inactiveToken.totalPendingActivations);
      assert.equal(
        finalPendingActivations,
        initialPendingActivations + 5000000,
        'totalPendingActivations not increased by the amount',
      );
    });

    it('should increase totaActivationPoints as a function of (wei value * multiplier) / totalTokens', async () => {
      let afterPoints = await inactiveToken.totalActivationPoints();
      let finalPoints = new BigNumber(afterPoints.toString());
      let sent = new BigNumber('5000000');
      let added = sent.times(multiplier).dividedBy(supply.toString()).decimalPlaces(0);

      let expected = initialPoints.plus(added);

      assert.equal(
        parseBN(finalPoints),
        parseBN(expected),
        'totalActivationPoints not increased by the proper amount',
      );
    });
  });
});

const setUp = async () => {
  votingToken = await VotingTokenStub.new();
  activeToken = await ActiveTokenStub.new(votingToken.address);
  inactiveToken = await InactiveTokenMock.new(votingToken.address, activeToken.address);
  await inactiveToken.setMockInactiveTokenCycle(1);
  await inactiveToken.setMockCycleUpdateStatus(accounts[1], true);
  await inactiveToken.setMockCycleUpdateStatus(accounts[2], true);
  await resetBalances();
  await setValues();
};

const getTotalSupply = async () => {
  return await inactiveToken.totalSupply();
};

const getTotalBalance = async (account) => {
  return await inactiveToken.balanceOf(account);
};

const resetBalances = async () => {
  await inactiveToken.resetSupply();
  await inactiveToken.initMockBalance(accounts[1], 4000000);
  await inactiveToken.initMockBalance(accounts[2], 3000000);
};

const setValues = async () => {
  totalSupplyT1 = await parseMethod(getTotalSupply);
  senderTotalBalanceT1 = await parseWithArg(getTotalBalance, accounts[1]);
  receiverTotalBalanceT1 = await parseWithArg(getTotalBalance, accounts[2]);
};

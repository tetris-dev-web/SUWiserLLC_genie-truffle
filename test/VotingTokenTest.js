const VotingTokenMock = artifacts.require('VotingTokenMock');
const ActiveTokenStub = artifacts.require('ActiveTokenStub');
const InactiveTokenStub = artifacts.require('InactiveTokenStub');

let votingToken;
let activeToken;
let inactiveToken;

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');

let accounts;

contract('VotingToken', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  describe('assignedBalanceOf', async () => {
    before(async () => {
      votingToken.initMockAssigned(accounts[1], 3000000);
    });

    describe('when the account is updated with the current inactive token cycle', async () => {
      before(async () => {
        await inactiveToken.setAccountUpdated(true);
      });

      it('returns the assigned balance', async () => {
        let assigned = await votingToken.assignedBalanceOf.call(accounts[1]);
        assert.equal(assigned, 3000000, 'should return the assigned balance of the account');
      });
    });

    describe('when the account is not updated with the current inactive token cycle', async () => {
      before(async () => {
        await inactiveToken.setAccountUpdated(false);
      });

      after(async () => {
        await inactiveToken.setAccountUpdated(true);
      });

      it('returns 0', async () => {
        let assigned = await votingToken.assignedBalanceOf.call(accounts[1]);
        assert.equal(assigned, 0, 'should return the assigned balance of the account');
      });
    });
  });

  describe('freedUpBalanceOf', async () => {
    before(async () => {
      await inactiveToken.initMockBalance(accounts[1], 2000000);
      await activeToken.initMockBalance(accounts[1], 5000000);
    });

    describe('when the account is updated with the current inactive token cycle', async () => {
      it('returns the total balance minus the assigned balance', async () => {
        let freedUp = await votingToken.freedUpBalanceOf.call(accounts[1]);
        assert.equal(freedUp, 4000000, 'should return the freedUp balance of the account');
      });
    });

    describe('when the account is not updated with the current inactive token cycle', async () => {
      before(async () => {
        await inactiveToken.setAccountUpdated(false);
      });

      after(async () => {
        await inactiveToken.setAccountUpdated(true);
      });

      it('returns the active balance', async () => {
        let freedUp = await votingToken.freedUpBalanceOf.call(accounts[1]);
        assert.equal(freedUp, 5000000, 'should return the active balance of the account');
      });
    });
  });

  describe('freeUp', async () => {
    describe('when the assigned balance is greater than or equal to the amount', async () => {
      describe('when the account is updated with the current inactive token cycle', async () => {
        before(async () => {
          await inactiveToken.setAccountUpdated(true);
          await votingToken.initMockAssigned(accounts[1], 3000000);
          await votingToken.freeUp(accounts[1], 2500000);
        });

        after(async () => {
          await votingToken.initMockAssigned(accounts[1], 3000000);
        });

        it('reduces the assigned balance by the amount', async () => {
          let assigned = await votingToken.assignedBalanceOf.call(accounts[1]);
          assert.equal(
            Number(assigned),
            500000,
            'should reduce the assigned balance by the amount',
          );
        });
      });
    });

    describe('when the assigned balance is less than the amount', async () => {
      describe('when the account is updated with the current inactive token cycle', async () => {
        before(async () => {
          await inactiveToken.setAccountUpdated(true);
        });

        it('reverts', async () => {
          await exceptions.catchRevert(votingToken.freeUp(accounts[1], 4000000));
        });
      });

      describe('when the account is not updated with the current inactive token cycle', async () => {
        before(async () => {
          await inactiveToken.setAccountUpdated(false);
        });

        it('reverts', async () => {
          await exceptions.catchRevert(votingToken.freeUp(accounts[1], 2500000));
        });
      });
    });
  });

  describe('assign', async () => {
    describe('when the freedUpBalance balance is greater than or equal to the amount', async () => {
      describe('when the account is updated with the current inactive token cycle', async () => {
        before(async () => {
          await inactiveToken.setAccountUpdated(true);
          await stubUtil.addMethod(inactiveToken, 'updateAccountCycle');
          await votingToken.assign(accounts[1], 2000000);
        });

        after(async () => {
          await stubUtil.resetMethod(inactiveToken, 'updateAccountCycle');
        });

        it('adds the amount to the accounts assigned balance', async () => {
          let assigned = await votingToken.assignedBalanceOf.call(accounts[1]);
          assert.equal(
            Number(assigned),
            5000000,
            'should return the assigned balance of the account',
          );
        });

        it('does not update the account cycle', async () => {
          let { called } = await stubUtil.callHistory(inactiveToken, 'updateAccountCycle');
          assert(!called, 'should not update an account that is already up to date');
        });
      });

      describe('when the account is not updated with the current inactive token cycle', async () => {
        before(async () => {
          votingToken.initMockAssigned(accounts[1], 3000000);
          await inactiveToken.setAccountUpdated(false);
          await votingToken.assign(accounts[1], 2000000);
          await inactiveToken.setAccountUpdated(true);
        });

        after(async () => {
          await inactiveToken.setAccountUpdated(true);
        });

        it('sets the accounts assigned balance to the amount', async () => {
          let assigned = await votingToken.assignedBalanceOf.call(accounts[1]);
          assert.equal(assigned, 2000000, 'should return the assigned balance of the account');
        });

        it('update the account cycle', async () => {
          let { firstAddress } = await stubUtil.callHistory(inactiveToken, 'updateAccountCycle');
          assert.equal(
            firstAddress,
            accounts[1],
            'should not update an account that is already up to date',
          );
        });
      });
    });

    describe('when the freedUpBalance is less than the amount', async () => {
      describe('when the account is updated with the current vote cycle', async () => {
        before(async () => {
          await inactiveToken.setAccountUpdated(true);
        });

        it('reverts', async () => {
          await exceptions.catchRevert(votingToken.assign(accounts[1], 8000000));
        });
      });

      describe('when the account is not updated with the current vote cycle', async () => {
        before(async () => {
          await inactiveToken.setAccountUpdated(false);
        });

        it('reverts', async () => {
          await exceptions.catchRevert(votingToken.assign(accounts[1], 6000000));
        });
      });
    });
  });
});

const setUp = async () => {
  votingToken = await VotingTokenMock.new();
  activeToken = await ActiveTokenStub.new(votingToken.address);
  inactiveToken = await InactiveTokenStub.new(votingToken.address, activeToken.address);
  await votingToken.setActiveToken(activeToken.address);
  await votingToken.setInactiveToken(inactiveToken.address);
};

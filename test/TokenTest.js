const TokenMock = artifacts.require('TokenMock');
const DividendsStub = artifacts.require('DividendsStub');
const BigNumber = require('bignumber.js');
const multiplier = new BigNumber('10e30');

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');
const { parseBN, parseMethod, parseWithArg } = require('./parseUtil');

let accounts;
let mT;
let d;
let iL;

let totalSupplyT1;
let totalActiveSupplyT1;
let totalInactiveSupplyT1;

let senderTotalBalanceT1;
let senderActiveBalanceT1;
let senderInactiveBalanceT1;
let senderAssignedBalanceT1;
let senderFreedUpBalanceT1;

let receiverTotalBalanceT1;
let receiverActiveBalanceT1;
let receiverInactiveBalanceT1;
let receiverAssignedBalanceT1;
let receiverFreedUpBalanceT1;

contract('Token', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  describe('totalSupply', async () => {
    it('returns the total supply of tokens', async () => {
      let bigNumber = await mT.totalSupply();
      let supply = parseBN(bigNumber);
      assert.equal(supply, 17000, 'incorrect total supply');
    });
  });

  // describe('totalActiveSupply', async () => {
  //   it('returns the total active supply of tokens', async () => {
  //     let bigNumber = await mT.totalActiveSupply();
  //     let activeSupply = parseBN(bigNumber);
  //     assert.equal(activeSupply, 7000, 'incorrect active supply');
  //   })
  // })
  //
  // describe('totalInactiveSupply', async () => {
  //   it('returns the total inactive supply of tokens', async () => {
  //     let bigNumber = await mT.totalInactiveSupply();
  //     let inactiveSupply = parseBN(bigNumber);
  //     assert.equal(inactiveSupply, 10000, 'incorrect inactive supply');
  //   })
  // })

  describe('balanceOf', async () => {
    it('returns the total balance of the passed address when the account is up to date with the current inactive token cycle', async () => {
      await mT.setMockCycleUpdateStatus(accounts[1], true);

      let balance = await parseWithArg(getTotalBalance, accounts[1]);
      assert.equal(balance, 7000, 'incorrect balance for account');
    });

    it('returns the active balance of the passed address when the account is not up to date with the current inactive token cycle', async () => {
      await mT.setMockCycleUpdateStatus(accounts[2], false);

      let balance = await parseWithArg(getTotalBalance, accounts[2]);
      assert.equal(balance, 3000, 'incorrect balance for account');
    });
  });

  // describe('activeBalanceOf', async () => {
  //   it('returns the active balance of the passed address', async () => {
  //     let activeBalance1 = await mT.activeBalanceOf(accounts[1]);
  //     let activeBalance2 = await mT.activeBalanceOf(accounts[2]);
  //
  //     assert.equal(activeBalance1, 4000, 'incorrect active balance for account[1]');
  //     assert.equal(activeBalance2, 3000, 'incorrect active balance for account[2]');
  //   })
  // })

  // describe('inactiveBalanceOf', async () => {
  //   it('returns the inactive balance of the passed address when the account is up to date with the current inactive token cycle', async () => {
  //     await mT.setMockCycleUpdateStatus(accounts[1], true);
  //
  //     let balance = await parseWithArg(getInactiveBalance, accounts[1]);
  //     assert.equal(balance, 3000, 'incorrect balance for account');
  //   })
  //
  //   it('returns 0 when the account is not up to date with the current inactive token cycle', async () => {
  //     await mT.setMockCycleUpdateStatus(accounts[2], false);
  //
  //     let balance = await parseWithArg(getInactiveBalance, accounts[2]);
  //     assert.equal(balance, 0, 'incorrect balance for account');
  //   })
  // })

  // describe('activate', async () => {
  //   describe('when the sender has enough tokens to activate', async () => {
  //     before(async () => {
  //       await stubUtil.addMethod(d, 'distributeDividend');
  //       await mT.setMockCycleUpdateStatus(accounts[1], true);
  //       console.log('t1', senderInactiveBalanceT1)
  //       await mT.activate_(accounts[1], 1000, {from: accounts[1]});
  //     })
  //
  //     after(async () => {
  //       await resetBalances();
  //     })
  //
  //     it('distributes a dividend to the account', async () => {
  //       let { firstAddress, called } = await stubUtil.callHistory(d, 'distributeDividend');
  //       assert.equal(firstAddress, accounts[1], 'dividend not distributed to the correct address');
  //     })
  //
  //     it('increases the senders active balance by the amount', async () => {
  //       let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
  //       assert.equal(senderActiveBalanceT2, senderActiveBalanceT1 + 1000, 'active balance not increased by the correct amount');
  //     })
  //
  //     it('decreases the senders inactive balance by the amount', async () => {
  //       let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
  //       console.log('t2', senderInactiveBalanceT2)
  //       assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1 - 1000, 'inactive balance not decreased by the correct amount');
  //     })
  //
  //     it('does not change the senders total balance', async () => {
  //       let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
  //       assert.equal(senderTotalBalanceT2, senderTotalBalanceT1, 'overall balance should not change');
  //     })
  //
  //     it('increases the totalActiveSupply by the amount', async () => {
  //       let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
  //       assert.equal(totalActiveSupplyT2, totalActiveSupplyT1 + 1000, 'totalActiveSupply should increase by the amount');
  //     })
  //
  //     it('decreases the totalInactiveSupply by the amount', async () => {
  //       let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
  //       assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1 - 1000, 'totalInactiveSupply should decrease by the amount');
  //     })
  //
  //     it('does not change totalSupply', async () => {
  //       let totalSupplyT2 = await parseMethod(getTotalSupply);
  //       assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
  //     })
  //   })
  //
  //   describe('when the sender does not have enough tokens to activate', async () => {
  //     after(async () => {
  //       await resetBalances();
  //     })
  //
  //     it('reverts', async () => {
  //       await exceptions.catchRevert(mT.activate_(accounts[1], 5000));
  //     })
  //   })
  // })

  // describe('increasePendingActivations', async () => {
  //   let initialPendingActivations;
  //   let initialPoints;
  //
  //   before(async () => {
  //     initialPendingActivations = await parseMethod(mT.totalPendingActivations);
  //     let points = await mT.totalActivationPoints();
  //     initialPoints = new BigNumber(points.toString());
  //     await mT.increasePendingActivations(5000000);
  //   })
  //
  //   after(async () => {
  //     await resetBalances();
  //   })
  //
  //   it('should increase the totalPendingActivations by the amount', async () => {
  //     let finalPendingActivations = await parseMethod(mT.totalPendingActivations);
  //     assert.equal(finalPendingActivations, initialPendingActivations + 5000000, 'totalPendingActivations not increased by the amount');
  //   })
  //
  //   it('should increase totaActivationPoints as a function of (wei value * multiplier) / totalTokens', async () => {
  //     let points = await mT.totalActivationPoints();
  //     let finalPoints = new BigNumber(points.toString());
  //     let expected = initialPoints.plus('5000000').times(multiplier).dividedBy('10000').decimalPlaces(0);
  //     assert(finalPoints.isEqualTo(expected), 'totalActivationPoints not increased by the proper amount');
  //   })
  // })

  // describe('activatePending', async () => {
  //   before(async () => {
  //     await mT.setMockTotalPendingActivations(5000);
  //     await mT.setMockTotalActivationPonts(9000, 10000);
  //     await mT.setMockLastActivationPoints(3000, 4000, accounts[2]);
  //     await mT.setMockCycleUpdateStatus(accounts[2], true);
  //     await stubUtil.addMethod(mT, 'activate');
  //     await mT.activatePending(accounts[2]);
  //   })
  //
  //   after(async () => {
  //     await resetBalances();
  //   })
  //
  //   it('activates tokens as a function of (totalActivationPoints - lastActivationPoints) * inactiveAccountTokens', async () => {
  //     let { firstAddress, firstUint } = await stubUtil.callHistory(mT, 'activate');
  //     assert.equal(firstAddress, accounts[2], 'tokens not activated for the correct account');
  //     assert.equal(firstUint, 1050, 'incorrect number of tokens activated');
  //   })
  //
  //   it('sets the accounts lastActivationPoints to the totallActivationPoints', async () => {
  //     let lastPoints = await mT.lastActivationPointsOf(accounts[2]);
  //     lastPoints = new BigNumber(lastPoints.toString());
  //     let totalPoints = await mT.totalActivationPoints();
  //     totalPoints = new BigNumber(totalPoints.toString());
  //     assert(lastPoints.isEqualTo(totalPoints), 'lastActivation for account should be set to totalActivationPoints');
  //   })
  //
  //   it('reduces the totalPendingActivations by the number of tokens activated', async () => {
  //     let finalPendingActivations = await parseMethod(mT.totalPendingActivations);
  //     assert.equal(finalPendingActivations, 3950, 'totalPendingActivations not reduced by the number of tokens activated');
  //   })
  // })

  describe('transfer', async () => {
    describe('when the sender can cover the value', async () => {
      //it initializes the account

      //when the account has been updated -- works as expected
      //when the accounts had not been updated -- does all the resetting that transfer inactive does and sets freed up to the total balance

      describe('when the receiver has been updated with the current inactive token cycle', async () => {
        before(async () => {
          // await stubUtil.addMethod(iL, 'removeVoteCredit');
          // await stubUtil.addMethod(iL, 'addVoteCredit');
          // await stubUtil.addMethod(iL, 'addInvestor');
          await mT.setMockCycleUpdateStatus(accounts[2], true);
          await mT.transfer(accounts[2], 3000, { from: accounts[1] });
        });

        after(async () => {
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

        it('removes the token value from the senders active balance', async () => {
          let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
          assert.equal(
            senderActiveBalanceT2,
            senderActiveBalanceT1 - 3000,
            'sender active balance should decrease by the value',
          );
        });

        // it('does not change the senders inactive balance', async () => {
        //   let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
        //   assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1, 'sender inactive balance should not change');
        // })
        //
        // it('removes the value from the senders freed up balance', async () => {
        //   let senderFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[1]);
        //   assert.equal(senderFreedUpBalanceT2, senderFreedUpBalanceT1 - 3000, 'sender freed up balance should decrease by the value');
        // })
        //
        // it('does not change the senders assigned balance', async () => {
        //   let senderAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[1]);
        //   assert.equal(senderAssignedBalanceT2, senderAssignedBalanceT1, 'sender freed up balance should decrease by the value');
        // })
        //
        // it('adds the token value to the recipients total balance', async () => {
        //   let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
        //   assert.equal(receiverTotalBalanceT2, receiverTotalBalanceT1 + 3000, 'recipient total balance should increase by the value');
        // })
        //
        // it('adds the token value to the recipients active balance', async () => {
        //   let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[2]);
        //   assert.equal(receiverActiveBalanceT2, receiverActiveBalanceT1 + 3000, 'recipient active balance should increase by the value');
        // })
        //
        // it('does not change the recipients inactive balance', async () => {
        //   let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[2]);
        //   assert.equal(receiverInactiveBalanceT2, receiverInactiveBalanceT1, 'recipient inactive balance should not change');
        // })
        //
        // it('increases the recipients freed up balance by the amount', async () => {
        //   let receiverFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[2]);
        //   assert.equal(receiverFreedUpBalanceT2, receiverFreedUpBalanceT1 + 3000, 'recipient freed up balance should be equal to recipient total balance');
        // })
        //
        //
        // it('does not change the recipients assigned balance', async () => {
        //   let receiverAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[2]);
        //   assert.equal(receiverAssignedBalanceT2, receiverAssignedBalanceT1, 'recipient freed up balance should be equal to recipient total balance');
        // })

        it('does not change totalSupply', async () => {
          let totalSupplyT2 = await parseMethod(getTotalSupply);
          assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
        });

        it('does not change totalActiveSupply', async () => {
          let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
          assert.equal(
            totalActiveSupplyT2,
            totalActiveSupplyT1,
            'totalActiveSupply should not change',
          );
        });
        //
        // it('does not change totalInactiveSupply', async () => {
        //   let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
        //   assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1, 'totalInactiveSupply should not change');
        // })
        //
        // it('does not effect total number of accounts', async () => {
        //   let totalAccounts = await parseMethod(mT.totalAccounts);
        //   assert.equal(totalAccounts, 2, 'total number of accounts should not change');
        // })
      });

      // describe('when the receiever has not been updated with the current vote cycle', async () => {
      //   //sets freedUp balance to the receivers total balance in addition to everything below
      //   describe('when the receiver already has an account', async () => {
      //
      //     before(async () => {
      //       await mT.setMockCycleUpdateStatus(accounts[2], false);
      //       await mT.transfer(accounts[2], 3000, {from: accounts[1]});
      //     })
      //
      //     after(async () => {
      //       await resetBalances();
      //       await mT.setMockCycleUpdateStatus(accounts[2], true);
      //     })
      //
      //     it('removes the token value from the senders total balance', async () => {
      //       let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
      //       assert.equal(senderTotalBalanceT2, senderTotalBalanceT1 - 3000, 'sender total balance should decrease by the value');
      //     })
      //
      //     it('removes the token value from the senders active balance', async () => {
      //       let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
      //       assert.equal(senderActiveBalanceT2, senderActiveBalanceT1 - 3000, 'sender active balance should decrease by the value');
      //     })
      //
      //     it('does not change the senders inactive balance', async () => {
      //       let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
      //       assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1, 'sender inactive balance should not change');
      //     })
      //
      //     it('removes the token value from the senders freed up balance', async () => {
      //       let senderFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[1]);
      //       assert.equal(senderFreedUpBalanceT2, senderFreedUpBalanceT1 - 3000, 'sender freed up balance should decrease by the value transferred');
      //     })
      //
      //     it('does not change the senders assigned balance', async () => {
      //       let senderAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[1]);
      //       assert.equal(senderAssignedBalanceT2, senderAssignedBalanceT1, 'sender assigned balance should not change');
      //     })
      //
      //     it('increases the recipients active balance by the value', async () => {
      //       let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[2]);
      //       assert.equal(receiverActiveBalanceT2, receiverActiveBalanceT1 + 3000, 'recipient active balance should increase by the value transferred');
      //     })
      //
      //     it('sets the recipients total balance to their active balance', async () => {
      //       let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
      //       let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[2]);
      //       assert.equal(receiverTotalBalanceT2, receiverActiveBalanceT2, 'recipient total balance should equal recipient active balance');
      //     })
      //
      //     it('sets the recipients inactive balance to 0', async () => {
      //       let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[2]);
      //       assert.equal(receiverInactiveBalanceT2, 0, 'recipient inactive balance should by set to 0');
      //     })
      //
      //     it('sets the recipients freed up balance to their total balance', async () => {
      //       let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
      //       let freedUpBalance = await parseWithArg(mT.freedUpBalanceOf, accounts[2]);
      //       assert.equal(freedUpBalance, receiverTotalBalanceT2, 'recipient freed up balance should be equal to recipient total balance');
      //     })
      //
      //     it('sets the recipients assgined value to 0', async () => {
      //       let receiverAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[2]);
      //       assert.equal(receiverAssignedBalanceT2, 0, 'recipient freed up balance should be 0');
      //     })
      //
      //     it('updates the recipients inactive token update status to true', async () => {
      //       let newStatus = await mT.getMockCycleUpdateStatus.call(accounts[2]);
      //       assert.equal(newStatus, true, 'recipients inactive token cycle should be updated');
      //     })
      //
      //     it('does not change totalSupply', async () => {
      //       let totalSupplyT2 = await parseMethod(getTotalSupply);
      //       assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
      //     })
      //
      //     it('does not change totalActiveSupply', async () => {
      //       let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
      //       assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
      //     })
      //
      //     it('does not change totalInactiveSupply', async () => {
      //       let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
      //       assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1, 'totalInactiveSupply should not change');
      //     })
      //
      //     it('does not effect total number of accounts', async () => {
      //       let totalAccounts = await parseMethod(mT.totalAccounts);
      //       assert.equal(totalAccounts, 2, 'total number of accounts should not change');
      //     })
      //   })
      //
      //   describe('when the receiver does not have an account', async () => {
      //     before(async () => {
      //       await mT.setMockCycleUpdateStatus(accounts[2], false);
      //       await mT.transfer(accounts[3], 3000, {from: accounts[1]});
      //     })
      //
      //     after(async () => {
      //       await resetBalances();
      //       await mT.clearMockBalance(accounts[3]);
      //     })
      //
      //     it('removes the token value from the senders total balance', async () => {
      //       let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
      //       assert.equal(senderTotalBalanceT2, senderTotalBalanceT1 - 3000, 'sender total balance should decrease by the value');
      //     })
      //
      //     it('removes the token value from the senders active balance', async () => {
      //       let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
      //       assert.equal(senderActiveBalanceT2, senderActiveBalanceT1 - 3000, 'sender active balance should decrease by the value');
      //     })
      //
      //     it('does not change the senders inactive balance', async () => {
      //       let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
      //       assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1, 'sender inactive balance should not change');
      //     })
      //
      //     it('removes the token value from the senders freed up balance', async () => {
      //       let senderFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[1]);
      //       assert.equal(senderFreedUpBalanceT2, senderFreedUpBalanceT1 - 3000, 'sender freed up balance should decrease by the value transferred');
      //     })
      //
      //     it('does not change the senders assigned balance', async () => {
      //       let senderAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[1]);
      //       assert.equal(senderAssignedBalanceT2, senderAssignedBalanceT1, 'sender assigned balance should not change');
      //     })
      //
      //     it('sets the recipients active balance to the value', async () => {
      //       let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[3]);
      //       assert.equal(receiverActiveBalanceT2, 3000, 'recipient active balance should increase by the value transferred');
      //     })
      //
      //     it('sets the recipients total balance to their active balance', async () => {
      //       let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[3]);
      //       let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[3]);
      //       assert.equal(receiverTotalBalanceT2, receiverActiveBalanceT2, 'recipient total balance should equal recipient active balance');
      //     })
      //
      //     it('sets the recipients inactive balance to 0', async () => {
      //       let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[3]);
      //       assert.equal(receiverInactiveBalanceT2, 0, 'recipient inactive balance should by set to 0');
      //     })
      //
      //     it('sets the recipients freed up balance to their total balance', async () => {
      //       let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[3]);
      //       let freedUpBalance = await parseWithArg(mT.freedUpBalanceOf, accounts[3]);
      //       assert.equal(freedUpBalance, receiverTotalBalanceT2, 'recipient freed up balance should be equal to recipient total balance');
      //     })
      //
      //     it('sets the recipients assgined value to 0', async () => {
      //       let receiverAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[3]);
      //       assert.equal(receiverAssignedBalanceT2, 0, 'recipient freed up balance should be 0');
      //     })
      //
      //     it('updates the recipients inactive token update status to true', async () => {
      //       let newStatus = await mT.getMockCycleUpdateStatus.call(accounts[3]);
      //       assert.equal(newStatus, true, 'recipients inactive token cycle should be updated');
      //     })
      //
      //     it('does not change totalSupply', async () => {
      //       let totalSupplyT2 = await parseMethod(getTotalSupply);
      //       assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
      //     })
      //
      //     it('does not change totalActiveSupply', async () => {
      //       let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
      //       assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
      //     })
      //
      //     it('does not change totalInactiveSupply', async () => {
      //       let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
      //       assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1, 'totalInactiveSupply should not change');
      //     })
      //
      //     it('increases the total number of accounts by one', async () => {
      //       let totalAccounts = await parseMethod(mT.totalAccounts);
      //       assert.equal(totalAccounts, 3, 'total number of accounts should increase by one');
      //     })
      //   })
      // })
    });

    describe('when sender cannot cover the value', async () => {
      after(async () => {
        await resetBalances();
      });

      it('reverts', async () => {
        await exceptions.catchRevert(mT.transfer(accounts[2], 5000, { from: accounts[1] }));
      });
    });
  });

  // describe('transferInactive', async () => {
  //   describe('when sent by the owner', async () => {
  //     describe('when the sender can cover the value', async () => {
  //
  //
  //       describe('when the receivers inactive tokens are up to date with the current cycle', async () => {
  //         before(async () => {
  //           await mT.setMockCycleUpdateStatus(accounts[2], true);
  //           await mT.transferInactive(accounts[2], 3000, {from: accounts[1]});
  //         })
  //
  //         after(async () => {
  //           await resetBalances();
  //           await mT.clearMockBalance(accounts[3]);
  //         })
  //
  //         it('removes the token value from the senders total balance', async () => {
  //           let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
  //           assert.equal(senderTotalBalanceT2, senderTotalBalanceT1 - 3000, 'sender total balance should decrease by the value');
  //         })
  //
  //         it('removes the token value from the senders inactive balance', async () => {
  //           let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
  //           assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1 - 3000, 'sender inactive balance should decrease by the value');
  //         })
  //
  //         it('does not change the senders active balance', async () => {
  //           let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
  //           assert.equal(senderActiveBalanceT2, senderActiveBalanceT1, 'sender active balance should not change');
  //         })
  //
  //         it('removes the value from the senders freed up balance', async () => {
  //           let senderFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[1]);
  //           assert.equal(senderFreedUpBalanceT2, senderFreedUpBalanceT1 - 3000, 'sender freed up balance should decrease by the value');
  //         })
  //
  //         it('does not change the senders assigned balance', async () => {
  //           let senderAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[1]);
  //           assert.equal(senderAssignedBalanceT2, senderAssignedBalanceT1, 'sender freed up balance should decrease by the value');
  //         })
  //
  //
  //         it('adds the token value to the recipients total balance', async () => {
  //           let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
  //           assert.equal(receiverTotalBalanceT2, receiverTotalBalanceT1 + 3000, 'recipient total balance should increase by the value');
  //         })
  //
  //         it('adds the token value to the recipients inactive balance', async () => {
  //           let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[2]);
  //           assert.equal(receiverInactiveBalanceT2, receiverInactiveBalanceT1 + 3000, 'recipient inactive balance should increase by the value');
  //         })
  //
  //         it('does not change the recipients active balance', async () => {
  //           let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[2]);
  //           assert.equal(receiverActiveBalanceT2, receiverActiveBalanceT1, 'recipient active balance should not change');
  //         })
  //
  //         it('increases the recipients freed up balance by the amount', async () => {
  //           let receiverFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[2]);
  //           assert.equal(receiverFreedUpBalanceT2, receiverFreedUpBalanceT1 + 3000, 'recipient freed up balance should be equal to recipient total balance');
  //         })
  //
  //         it('does not change the recipients assigned balance', async () => {
  //           let receiverAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[2]);
  //           assert.equal(receiverAssignedBalanceT2, receiverAssignedBalanceT1, 'recipient freed up balance should be equal to recipient total balance');
  //         })
  //
  //         it('does not change totalSupply', async () => {
  //           let totalSupplyT2 = await parseMethod(getTotalSupply);
  //           assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
  //         })
  //
  //         it('does not change totalActiveSupply', async () => {
  //           let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
  //           assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
  //         })
  //
  //         it('does not change totalInactiveSupply', async () => {
  //           let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
  //           assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1, 'totalInactiveSupply should not change');
  //         })
  //
  //         it('does not effect total number of accounts', async () => {
  //           let totalAccounts = await parseMethod(mT.totalAccounts);
  //           assert.equal(totalAccounts, 2, 'total number of accounts should not change');
  //         })
  //       })
  //
  //       describe('when the receivers inactive tokens are not up to date with the current cycle', async () => {
  //         describe('when the receiver already has an account', async () => {
  //           before(async () => {
  //             await mT.setMockCycleUpdateStatus(accounts[2], false);
  //             await mT.transferInactive(accounts[2], 3000, {from: accounts[1]});
  //           })
  //
  //           after(async () => {
  //             await resetBalances();
  //           })
  //
  //           //it sets the freedUp balance to the total balance
  //
  //           it('removes the token value from the senders total balance', async () => {
  //             let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
  //             assert.equal(senderTotalBalanceT2, senderTotalBalanceT1 - 3000, 'sender total balance should decrease by the value');
  //           })
  //
  //           it('removes the token value from the senders inactive balance', async () => {
  //             let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
  //             assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1 - 3000, 'sender inactive balance should decrease by the value');
  //           })
  //
  //           it('does not change the senders active balance', async () => {
  //             let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
  //             assert.equal(senderActiveBalanceT2, senderActiveBalanceT1, 'sender active balance should not change');
  //           })
  //
  //           it('removes the value from the senders freed up balance', async () => {
  //             let senderFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[1]);
  //             assert.equal(senderFreedUpBalanceT2, senderFreedUpBalanceT1 - 3000, 'sender freed up balance should decrease by the value');
  //           })
  //
  //           it('does not change the senders assigned balance', async () => {
  //             let senderAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[1]);
  //             assert.equal(senderAssignedBalanceT2, senderAssignedBalanceT1, 'sender freed up balance should decrease by the value');
  //           })
  //
  //
  //           it('sets the recipients total balance to their active balance plus the token value', async () => {
  //             let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
  //             assert.equal(receiverTotalBalanceT2, receiverActiveBalanceT1 + 3000, 'recipient total balance should increase by the value');
  //           })
  //
  //           it('sets the recipients inactive balance to the token value', async () => {
  //             let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[2]);
  //             assert.equal(receiverInactiveBalanceT2, 3000, 'recipient inactive balance should increase by the value');
  //           })
  //
  //           it('updates the recipients inactive token update status to true', async () => {
  //             let newStatus = await mT.getMockCycleUpdateStatus.call(accounts[2]);
  //             assert.equal(newStatus, true, 'recipients inactive token cycle should be updated');
  //           })
  //
  //           it('does not change the recipients active balance', async () => {
  //             let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[2]);
  //             assert.equal(receiverActiveBalanceT2, receiverActiveBalanceT1, 'recipient active balance should not change');
  //           })
  //
  //           it('sets the receivers freed up balance to their total balance', async () => {
  //             let receiverFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[2]);
  //             let totalBalanceT2 = await parseWithArg(mT.balanceOf, accounts[2]);
  //             assert.equal(receiverFreedUpBalanceT2, totalBalanceT2, 'recipient freed up balance should be equal to recipient total balance');
  //           })
  //
  //           it('sets the recipients assigned balance to 0', async () => {
  //             let receiverAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[2]);
  //             assert.equal(receiverAssignedBalanceT2, 0, 'recipient freed up balance should be equal to recipient total balance');
  //           })
  //
  //           it('does not change totalSupply', async () => {
  //             let totalSupplyT2 = await parseMethod(getTotalSupply);
  //             assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
  //           })
  //
  //           it('does not change totalActiveSupply', async () => {
  //             let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
  //             assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
  //           })
  //
  //           it('does not change totalInactiveSupply', async () => {
  //             let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
  //             assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1, 'totalInactiveSupply should not change');
  //           })
  //
  //           it('does not effect total number of accounts', async () => {
  //             let totalAccounts = await parseMethod(mT.totalAccounts);
  //             assert.equal(totalAccounts, 2, 'total number of accounts should not change');
  //           })
  //         })
  //
  //         describe('when the receiver does not have an account', async () => {
  //           before(async () => {
  //             await mT.setMockCycleUpdateStatus(accounts[3], false);
  //             await mT.transferInactive(accounts[3], 3000, {from: accounts[1]});
  //           })
  //
  //           after(async () => {
  //             await resetBalances();
  //           })
  //
  //           //it sets the freedUp balance to the total balance
  //
  //           it('removes the token value from the senders total balance', async () => {
  //             let senderTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[1]);
  //             assert.equal(senderTotalBalanceT2, senderTotalBalanceT1 - 3000, 'sender total balance should decrease by the value');
  //           })
  //
  //           it('removes the token value from the senders inactive balance', async () => {
  //             let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
  //             assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1 - 3000, 'sender inactive balance should decrease by the value');
  //           })
  //
  //           it('does not change the senders active balance', async () => {
  //             let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
  //             assert.equal(senderActiveBalanceT2, senderActiveBalanceT1, 'sender active balance should not change');
  //           })
  //
  //           it('removes the value from the senders freed up balance', async () => {
  //             let senderFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[1]);
  //             assert.equal(senderFreedUpBalanceT2, senderFreedUpBalanceT1 - 3000, 'sender freed up balance should decrease by the value');
  //           })
  //
  //           it('does not change the senders assigned balance', async () => {
  //             let senderAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[1]);
  //             assert.equal(senderAssignedBalanceT2, senderAssignedBalanceT1, 'sender freed up balance should decrease by the value');
  //           })
  //
  //
  //           it('sets the recipients total balance to the value', async () => {
  //             let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[3]);
  //             assert.equal(receiverTotalBalanceT2, 3000, 'recipient total balance should equal the value transferred');
  //           })
  //
  //           it('sets the recipients inactive balance to the value', async () => {
  //             let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[3]);
  //             assert.equal(receiverInactiveBalanceT2, 3000, 'recipient inactive balance should be equal to the value transferred');
  //           })
  //
  //           it('updates the recipients inactive token update status to true', async () => {
  //             let newStatus = await mT.getMockCycleUpdateStatus.call(accounts[3]);
  //             assert.equal(newStatus, true, 'recipients inactive token cycle should be updated');
  //           })
  //
  //           it('sets the receivers active balance to 0', async () => {
  //             let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[3]);
  //             assert.equal(receiverActiveBalanceT2, 0, 'recipient active balance should not change');
  //           })
  //
  //           it('sets the recipients freed up balance to the value', async () => {
  //             let receiverFreedUpBalanceT2 = await parseWithArg(mT.freedUpBalanceOf, accounts[3]);
  //             assert.equal(receiverFreedUpBalanceT2, 3000, 'recipient freed up balance should be equal to the value transferred');
  //           })
  //
  //           it('sets the recipients assigned balance to 0', async () => {
  //             let receiverAssignedBalanceT2 = await parseWithArg(mT.assignedBalanceOf, accounts[3]);
  //             assert.equal(receiverAssignedBalanceT2, 0, 'recipient freed up balance should be 0');
  //           })
  //
  //           it('does not change totalSupply', async () => {
  //             let totalSupplyT2 = await parseMethod(getTotalSupply);
  //             assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
  //           })
  //
  //           it('does not change totalActiveSupply', async () => {
  //             let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
  //             assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
  //           })
  //
  //           it('does not change totalInactiveSupply', async () => {
  //             let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
  //             assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1, 'totalInactiveSupply should not change');
  //           })
  //
  //           it('increases the total number of accounts by one', async () => {
  //             let totalAccounts = await parseMethod(mT.totalAccounts);
  //             assert.equal(totalAccounts, 3, 'total number of accounts should increase by one');
  //           })
  //         })
  //       })
  //     })
  //
  //     describe('when sender cannot cover the value', async () => {
  //       after(async () => {
  //         await resetBalances();
  //       })
  //
  //       it('reverts', async () => {
  //         await exceptions.catchRevert(mT.transferInactive(accounts[2], 5000, {from: accounts[1]}));
  //       })
  //     })
  //   })
  //
  //   describe('when called by an account other than the owner', async () => {
  //     after(async () => {
  //       await resetBalances();
  //     })
  //
  //     it('reverts', async () => {
  //       await exceptions.catchRevert(mT.transferInactive(accounts[2], 3000, {from: accounts[0]}))
  //     })
  //   })
  // })
  //maybe something that tests that the struct changed
  // describe('resetInactiveTokenCycle', async () => {
  //   let mockInactiveTokenCycleT1;
  //
  //   before(async () => {
  //     mockInactiveTokenCycleT1 = await parseMethod(getMockInactiveTokenCycle);
  //     await mT.resetInactiveTokenCycle(accounts[2], {from: accounts[1]});
  //   })
  //
  //   after(async () => {
  //     await resetBalances();
  //     await mT.setMockInactiveTokenCycle(0);
  //   })
  //
  //   it('increments the inactive token cycle by 1', async () => {
  //     let cycle = await parseMethod(getMockInactiveTokenCycle);
  //     assert.equal(cycle, mockInactiveTokenCycleT1 + 1, 'inactive token cycle should increase by 1');
  //   })
  //
  //   it('sets the totalInactiveSupply to 0', async () => {
  //     let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
  //     assert.equal(totalInactiveSupplyT2, 0, 'totalInactiveSupply should be 0');
  //   })
  //
  //   it('decrements the totalSupply by the starting totalInactiveSupply', async () => {
  //     let totalSupplyT2 = await parseMethod(getTotalSupply);
  //     assert.equal(totalSupplyT2, totalSupplyT1 - totalInactiveSupplyT1, 'totalSupply should decrease by the starting totalInactiveSupply');
  //   })
  //
  //   it('does not affect totalActiveSupply', async () => {
  //     let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
  //     assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
  //   })
  //
  //   it('sets the senders inactive balance to 0', async () => {
  //     let inactiveBalance = await parseWithArg(getInactiveBalance, accounts[1]);
  //     assert.equal(inactiveBalance, 0, 'sender inactive balance should be 0');
  //   })
  //
  //   it('sets the developers inactive balance to 0', async () => {
  //     let inactiveBalance = await parseWithArg(getInactiveBalance, accounts[2]);
  //     assert.equal(inactiveBalance, 0, 'developer inactive balance should be 0');
  //   })
  //
  //   it('updates the sender with the current inactive token cycle', async () => {
  //     let status = await mT.getMockCycleUpdateStatus.call(accounts[1]);
  //     assert.equal(status, true, 'sender account not updated with the current inactive token cycle');
  //   })
  //
  //   it('updates the developer with the current inactive token cycle', async () => {
  //     let status = await mT.getMockCycleUpdateStatus.call(accounts[2]);
  //     assert.equal(status, true, 'developer account not updated with the current inactive token cycle');
  //   })
  // })

  describe('approve', async () => {
    before(async () => {
      await mT.approve(accounts[2], 3000, { from: accounts[1] });
    });

    it('sets the spenders allowance for the sender/owner', async () => {
      let afterAllowance = await mT.allowance(accounts[1], accounts[2]);
      assert.equal(afterAllowance, 3000, 'allowance not set');
    });
  });

  describe('increaseApproval', async () => {
    let initialAllowance;

    before(async () => {
      let bNAllowance = await mT.allowance(accounts[1], accounts[2]);
      initialAllowance = parseBN(bNAllowance);
      await mT.increaseApproval(accounts[2], 500, { from: accounts[1] });
    });

    it('increases the spenders allowance for the sender/owner', async () => {
      let afterAllowance = await mT.allowance(accounts[1], accounts[2]);
      assert.equal(afterAllowance, initialAllowance + 500, 'allowance not set');
    });
  });

  describe('decreaseApproval', async () => {
    let initialAllowance;

    before(async () => {
      let bNAllowance = await mT.allowance(accounts[1], accounts[2]);
      initialAllowance = parseBN(bNAllowance);
      await mT.decreaseApproval(accounts[2], 500, { from: accounts[1] });
    });

    it('decreases the spenders allowance for the sender/owner', async () => {
      let afterAllowance = await mT.allowance(accounts[1], accounts[2]);
      assert.equal(afterAllowance, initialAllowance - 500, 'allowance not set');
    });
  });

  describe('transferFrom', async () => {
    describe('when the sender is not allowed to spend the amount', async () => {
      after(async () => {
        await resetBalances();
      });

      it('reverts', async () => {
        exceptions.catchRevert(
          mT.transferFrom(accounts[1], accounts[2], 2000, { from: accounts[0] }),
        );
      });
    });

    describe('when the sender is allowed to spend the amount', async () => {
      describe('when the from address has enough active tokens to transfer', async () => {
        before(async () => {
          await mT.approve(accounts[0], 3000, { from: accounts[1] });
          await mT.transferFrom(accounts[1], accounts[2], 3000, { from: accounts[0] });
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

        // it('removes the token value from the from address active balance', async () => {
        //   let senderActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[1]);
        //   assert.equal(senderActiveBalanceT2, senderActiveBalanceT1 - 3000, 'from active balance should decrease by the value');
        // })
        //
        // it('does not change the from address inactive balance', async () => {
        //   let senderInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[1]);
        //   assert.equal(senderInactiveBalanceT2, senderInactiveBalanceT1, 'from address inactive balance should not change');
        // })

        it('adds the token value to the recipients total balance', async () => {
          let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
          assert.equal(
            receiverTotalBalanceT2,
            receiverTotalBalanceT1 + 3000,
            'recipient total balance should increase by the value',
          );
        });

        // it('adds the token value to the recipients active balance', async () => {
        //   let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[2]);
        //   assert.equal(receiverActiveBalanceT2, receiverActiveBalanceT1 + 3000, 'recipient active balance should increase by the value');
        // })
        //
        // it('does not change the recipients inactive balance', async () => {
        //   let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[2]);
        //   assert.equal(receiverInactiveBalanceT2, receiverInactiveBalanceT1, 'recipient inactive balance should not change');
        // })

        it('does not change totalSupply', async () => {
          let totalSupplyT2 = await parseMethod(getTotalSupply);
          assert.equal(totalSupplyT2, totalSupplyT1, 'totalSupply should not change');
        });

        // it('does not change totalActiveSupply', async () => {
        //   let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
        //   assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
        // })
        //
        // it('does not change totalInactiveSupply', async () => {
        //   let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
        //   assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1, 'totalInactiveSupply should not change');
        // })

        // it('adds the receiver to the investor list', async () => {
        //   let { firstAddress } = await stubUtil.callHistory(iL, 'addInvestor');
        //   assert.equal(firstAddress, accounts[2], 'vote credit should be removed from the sender');
        // })
        //
        // it('removes vote credit for the from address', async () => {
        //   let { firstAddress, firstUint } = await stubUtil.callHistory(iL, 'removeVoteCredit');
        //   assert.equal(firstAddress, accounts[1], 'vote credit should be removed from the from address');
        //   assert.equal(firstUint, 3000, 'vote credit removed should reflect the token value');
        // })
        //
        // it('adds vote credit with the receiver and the value', async () => {
        //   let { firstAddress, firstUint } = await stubUtil.callHistory(iL, 'addVoteCredit');
        //   assert.equal(firstAddress, accounts[2], 'vote credit not sent to the receiver');
        //   assert.equal(firstUint, 3000, 'votes credit added should reflect the token value');
        // })
      });

      describe('when the from address does not have enough active tokens to cover the transfer', async () => {
        before(async () => {
          await mT.approve(accounts[0], 5000, { from: accounts[1] });
        });

        after(async () => {
          await resetBalances();
        });

        it('reverts', async () => {
          exceptions.catchRevert(
            mT.transferFrom(accounts[1], accounts[2], 5000, { from: accounts[0] }),
          );
        });
      });
    });
  });

  describe('mint', async () => {
    describe('when called by the owner', async () => {
      before(async () => {
        await mT.mint(accounts[2], 3000, { from: accounts[1] });
      });

      after(async () => {
        resetBalances();
      });

      it('increases the totalSupply by the amount', async () => {
        let totalSupplyT2 = await parseMethod(getTotalSupply);
        assert.equal(
          totalSupplyT2,
          totalSupplyT1 + 3000,
          'totalSupply should increase by the amount',
        );
      });

      // it('increases the totalInactiveSupply by the amount', async () => {
      //   let totalInactiveSupplyT2 = await parseMethod(getTotalInactiveSupply);
      //   assert.equal(totalInactiveSupplyT2, totalInactiveSupplyT1 + 3000, 'totalInactiveSupply should increase by the amount');
      // })
      //
      // it('does not change the totalActiveSupply', async () => {
      //   let totalActiveSupplyT2 = await parseMethod(getTotalActiveSupply);
      //   assert.equal(totalActiveSupplyT2, totalActiveSupplyT1, 'totalActiveSupply should not change');
      // })

      it('increases the receivers total balance by the amount', async () => {
        let receiverTotalBalanceT2 = await parseWithArg(getTotalBalance, accounts[2]);
        assert.equal(
          receiverTotalBalanceT2,
          receiverTotalBalanceT1 + 3000,
          'receiver balance should increase by the amount',
        );
      });

      // it('increases the receivers inactive balance by the amount', async () => {
      //   let receiverInactiveBalanceT2 = await parseWithArg(getInactiveBalance, accounts[2]);
      //   assert.equal(receiverInactiveBalanceT2, receiverInactiveBalanceT1 + 3000, 'receiver inactive balance should increase by the amount');
      // })
      //
      // it('does not change the receivers active balanace', async () => {
      //   let receiverActiveBalanceT2 = await parseWithArg(getActiveBalance, accounts[2]);
      //   assert.equal(receiverActiveBalanceT2, receiverActiveBalanceT1, 'receiver active balance should not change');
      // })
    });

    describe('when called by an account other than the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(mT.mint(accounts[2], 3000, { from: accounts[0] }));
      });
    });
  });

  // describe('resetInactiveTokenCycle', async () => {
  //   before(async () => {
  //
  //   })
  // })
});

const mockT = async () => {
  mT = await TokenMock.new();
};

// const iLStub = async () => {
//   iL = await InvestorListStub.new();
// }

const dStub = async () => {
  d = await DividendsStub.new(mT.address, accounts[0]);
};

const setUp = async () => {
  // await iLStub();
  await mockT();
  await dStub();
  await resetBalances();
  await setValues();
  await mT.transferOwnership(accounts[1], { from: accounts[0] });
  await mT.initializeDividendWallet(d.address, { from: accounts[1] });
};

const resetBalances = async () => {
  await mT.resetSupply();
  await mT.initMockBalance(accounts[1], 4000, 3000, 2500);
  await mT.initMockBalance(accounts[2], 3000, 7000, 4000);
};

const setValues = async () => {
  totalSupplyT1 = await parseMethod(getTotalSupply);
  totalActiveSupplyT1 = await parseMethod(getTotalActiveSupply);
  totalInactiveSupplyT1 = await parseMethod(getTotalInactiveSupply);

  await mT.setMockCycleUpdateStatus(accounts[1], true);
  senderTotalBalanceT1 = await parseWithArg(getTotalBalance, accounts[1]);
  senderActiveBalanceT1 = await parseWithArg(getActiveBalance, accounts[1]);
  senderInactiveBalanceT1 = await parseWithArg(getInactiveBalance, accounts[1]);
  senderAssignedBalanceT1 = await parseWithArg(mT.assignedBalanceOf, accounts[1]);
  senderFreedUpBalanceT1 = await parseWithArg(mT.freedUpBalanceOf, accounts[1]);

  await mT.setMockCycleUpdateStatus(accounts[2], true);
  receiverTotalBalanceT1 = await parseWithArg(getTotalBalance, accounts[2]);
  receiverActiveBalanceT1 = await parseWithArg(getActiveBalance, accounts[2]);
  receiverInactiveBalanceT1 = await parseWithArg(getInactiveBalance, accounts[2]);
  receiverAssignedBalanceT1 = await parseWithArg(mT.assignedBalanceOf, accounts[2]);
  receiverFreedUpBalanceT1 = await parseWithArg(mT.freedUpBalanceOf, accounts[2]);
};

const getTotalBalance = async (account) => {
  return await mT.balanceOf(account);
};

const getActiveBalance = async (account) => {
  return await mT.activeBalanceOf(account);
};

const getInactiveBalance = async (account) => {
  return await mT.inactiveBalanceOf(account);
};

const getTotalSupply = async () => {
  return await mT.totalSupply();
};

const getTotalActiveSupply = async () => {
  return await mT.totalActiveSupply();
};

const getTotalInactiveSupply = async () => {
  return await mT.totalInactiveSupply();
};

const getMockInactiveTokenCycle = async () => {
  return await mT.getMockInactiveTokenCycle.call();
};

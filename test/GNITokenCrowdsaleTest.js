const GNITokenCrowdsaleMock = artifacts.require('GNITokenCrowdsaleMock');
const VotingTokenStub = artifacts.require('VotingTokenStub');
const ActiveTokenStub = artifacts.require('ActiveTokenStub');
const InactiveTokenStub = artifacts.require('InactiveTokenStub');
const ProjectLeaderTrackerStub = artifacts.require('ProjectLeaderTrackerStub');
const TokenPurchaseHelperStub = artifacts.require('TokenPurchaseHelperStub');
const ReimbursementsStub = artifacts.require('ReimbursementsStub');
const BigNumber = require('bignumber.js');
const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');
const { parseBN, parseMethod, weiBalanceOf } = require('./parseUtil');

let accounts;
let mockGTC;
let inactiveToken;
let lTStub;
let rStub;

let tokenPurchaseHelper;
let projectLeaderTracker;
let activation;

let defaultOpeningTime;
let defaultDoomsDay;

contract('GNITokenCrowdsale', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  // describe('pitchProject', async () => {
  //   let voteHash;
  //   let removeVoteHash;
  //   describe('when the crowdsale is open', async () => {
  //     let initialProjectCount;
  //     let initialTotalValuation;
  //     let mintCallData;
  //
  //     before(async () => {
  //       initialProjectCount = await parseMethod(getProjectCount);
  //       initialTotalValuation = await parseMethod(getTotalValuation);
  //
  //       await stubUtil.addMethod(inactiveToken, 'mint');
  //       voteHash = await web3.fromAscii('random');
  //       removeVoteHash = await web3.fromAscii('moreRandom');
  //
  //       await lTStub.transferOwnership(mockGTC.address);
  //       await mockGTC.pitchProject('mockProject', 1000000, 3000000, '345', '345', voteHash, removeVoteHash);
  //       mintCallData = await stubUtil.callHistory(inactiveToken, 'mint');
  //     })
  //
  //     after(async () => {
  //       await mockGTC.setStubProjectCount(0);
  //     })
  //
  //     it('mints developer tokens to the developer as a function of (rate * (valuation - capitalRequired))', async () => {
  //       let { firstAddress, firstUint } = mintCallData;
  //       assert.equal(firstAddress, accounts[1], 'developer tokens not minted to contract');
  //       assert.equal(firstUint, 100000000, 'incorrect number of developer tokens minted');
  //     })
  //
  //     it('mints investor tokens to the contract as a function of (rate * capitalRequired)', async () => {
  //       let { secondAddress, secondUint } = mintCallData;
  //       assert.equal(secondAddress, mockGTC.address, 'investor tokens not minted to contract');
  //       assert.equal(secondUint, 50000000, 'incorrect number of investor tokens minted');
  //     })
  //
  //     it('increases the totalValuation by the project valuation', async () => {
  //       let finalTotalValuation = await parseMethod(getTotalValuation);
  //       assert.equal(finalTotalValuation, initialTotalValuation + 3000000, 'valuation not updated properly');
  //     })
  //
  //     it('extends the doomsDay by 90 days from the current time', async () => {
  //       let finalDoomsDay = await parseMethod(getDoomsDay);
  //       let now = await getLatestBlockTime();
  //       assert.equal(finalDoomsDay, now + (90 * 1728000), 'doomsDay not extended properly');
  //     })
  //
  //     it('increments totalProjectCount by one', async () => {
  //       let finalProjectCount = await parseMethod(getProjectCount);
  //       assert.equal(finalProjectCount, initialProjectCount + 1, 'totalProjectCount should increment by 1');
  //     })
  //
  //     it('stores the project address by the order in which it was created', async () => {
  //       let address = await mockGTC.mockProjectById(4);
  //       assert(address, 'project address not stored');
  //     })
  //
  //     //it should create mappings for vote hashes
  //     it('stores a vote hash associated with the project', async () => {
  //       let address = await mockGTC.mockProjectById(4);
  //       let storedVoteHash = await mockGTC.viewMockVoteHash(address);
  //       let recoveredHash = web3.toAscii(storedVoteHash);
  //       assert(recoveredHash, 'voteHash should be stored asssociated with project');
  //     })
  //
  //     it('stores a remove vote hash associated with the project', async () => {
  //       let address = await mockGTC.mockProjectById(4);
  //       let storedRemoveVoteHash = await mockGTC.viewMockRemoveVoteHash(address);
  //       let recoveredHash = web3.toAscii(storedRemoveVoteHash);
  //       assert(recoveredHash, 'voteHash should be stored asssociated with project');
  //     })
  //     //checks that it creates a mapping of count to address
  //     // it('adds the new project address to projectAddrs array', async () => {
  //     //   let finalProjectCount = await parseMethod(getProjectCount);
  //     //   assert.equal(finalProjectCount, initialProjectCount + 1, 'project address not added to projectAddrs array');
  //     // })
  //   })
  //
  //   describe('when the crowdsale is not open', async () => {
  //     after(async () => {
  //       await mockGTC.setMockDoomsDay(defaultDoomsDay);
  //       await mockGTC.setMockReOpening(false);
  //     })
  //
  //     it('reverts when the crowdsale has not opened yet', async () => {
  //       await mockGTC.setMockOpening(defaultOpeningTime * 400);
  //       await exceptions.catchRevert(mockGTC.pitchProject('mockProject', 1000000, 3000000, '345', '345', voteHash, removeVoteHash));
  //     })
  //
  //     it('reverts after the crowdsale has closed and it cannot be reopened', async () => {
  //       await mockGTC.setMockReOpening(false);
  //       await mockGTC.setMockOpening(defaultOpeningTime);
  //       await mockGTC.setMockDoomsDay(defaultDoomsDay / 2);
  //       await exceptions.catchRevert(mockGTC.pitchProject('mockProject', 1000000, 3000000, '345', '345', voteHash, removeVoteHash));
  //     })
  //
  //     it('runs when the crowdsale can be reopened', async () => {
  //       await mockGTC.setMockReOpening(true);
  //       await mockGTC.setMockOpening(defaultOpeningTime);
  //       await mockGTC.setMockDoomsDay(defaultDoomsDay / 2);
  //       await mockGTC.pitchProject('mockProject', 1000000, 3000000, '345', '345', voteHash, removeVoteHash)
  //     })
  //   })
  // })

  describe('mintNewProjectTokensAndExtendDoomsDay', async () => {
    describe('when the crowdsale is open', async () => {
      let mintCallData;
      let returnValue;
      before(async () => {
        await stubUtil.addMethod(inactiveToken, 'mint');
        await stubUtil.addMethod(inactiveToken, 'mint');
        returnValue = await mockGTC.mintNewProjectTokensAndExtendDoomsDay.call(5000000, 3000000);
        await mockGTC.mintNewProjectTokensAndExtendDoomsDay(5000000, 3000000);
        mintCallData = await stubUtil.callHistory(inactiveToken, 'mint');
      });

      it('mints developer tokens to the developer as a function of (rate * (valuation - capitalRequired))', async () => {
        let { firstAddress, firstUint } = mintCallData;
        assert.equal(firstAddress, accounts[0], 'developer tokens not minted to contract');
        assert.equal(firstUint, 2000000, 'incorrect number of developer tokens minted');
      });

      it('mints investor tokens to the contract as a function of (rate * capitalRequired)', async () => {
        let { secondAddress, secondUint } = mintCallData;
        assert.equal(secondAddress, mockGTC.address, 'investor tokens not minted to contract');
        assert.equal(secondUint, 3000000, 'incorrect number of investor tokens minted');
      });

      it('extends the doomsDay by 90 days from the current time', async () => {
        let finalDoomsDay = await parseMethod(getDoomsDay);
        let now = await getLatestBlockTime();
        assert.equal(finalDoomsDay, now + 90 * 1728000, 'doomsDay not extended properly');
      });

      it('returns the number of tokens minted', async () => {
        assert.equal(
          parseBN(returnValue[0]),
          2000000,
          'should return the number of developer tokens minted',
        );
        assert.equal(
          parseBN(returnValue[1]),
          3000000,
          'should return the number of investor tokens minted',
        );
      });
    });
    describe('when the crowdsale is not open', async () => {
      after(async () => {
        await mockGTC.setMockDoomsDay(defaultDoomsDay);
      });

      it('reverts when the crowdsale has not opened yet', async () => {
        await mockGTC.setMockOpening(defaultOpeningTime * 400);
        await exceptions.catchRevert(
          mockGTC.mintNewProjectTokensAndExtendDoomsDay(5000000, 3000000),
        );
      });

      it('reverts after the crowdsale has closed', async () => {
        await mockGTC.setMockOpening(defaultOpeningTime);
        await mockGTC.setMockDoomsDay(defaultDoomsDay / 2);
        await exceptions.catchRevert(
          mockGTC.mintNewProjectTokensAndExtendDoomsDay(5000000, 3000000),
        );
      });
    });
  });

  describe('buyTokens', async () => {
    describe('when the crowdsale is open', async () => {
      let initialWeiRaised;
      let initialDoomsDay;

      before(async () => {
        initialWeiRaised = await parseMethod(getWeiRaised);
        initialDoomsDay = await parseMethod(getDoomsDay);
        await stubUtil.addMethod(inactiveToken, 'transfer');
        await stubUtil.addMethod(tokenPurchaseHelper, 'handleTokenPurchase');
        await mockGTC.buyTokens({ from: accounts[2], value: 500000 });
      });

      after(async () => {
        await stubUtil.resetMethod(inactiveToken, 'transfer');
        await stubUtil.resetMethod(tokenPurchaseHelper, 'handleTokenPurchase');
      });

      it('transfers inactive tokens from the contract to the beneficiary as a function of value * rate', async () => {
        let { firstAddress, firstUint } = await stubUtil.callHistory(inactiveToken, 'transfer');
        assert.equal(firstAddress, accounts[2], 'tokens not transfered to the correct beneficiary');
        assert.equal(firstUint, 500000, 'incorrect token amount transfered');
      });

      it('handles the token purchase', async () => {
        let { firstAddress, firstUint } = await stubUtil.callHistory(
          tokenPurchaseHelper,
          'handleTokenPurchase',
        );
        assert.equal(firstAddress, accounts[2], 'should handle the token purchase');
        assert.equal(firstUint, 500000, 'should handle the token purchase');
      });

      it('increases weiRaised by the purchase value', async () => {
        let finalWeiRaised = await parseMethod(getWeiRaised);
        assert.equal(
          finalWeiRaised,
          initialWeiRaised + 500000,
          'purchase value not added to weiRaised',
        );
      });

      // it('votes for the project indicated', async () => {
      //   let { firstAddress, firstUint } = await stubUtil.callHistory(projStub1, 'vote');
      //   assert.equal(firstAddress, accounts[2], 'the corrent project was not voted for');
      //   assert.equal(firstUint, 25000000, 'incorrect vote amount assigned to project');
      // })

      it('extends the doomsDay by 90 days from the current time', async () => {
        let finalDoomsDay = await parseMethod(getDoomsDay);
        let now = await getLatestBlockTime();
        assert.equal(finalDoomsDay, now + 90 * 1728000, 'doomsDay not extended properly');
      });

      //these should be for voting
      // it('considers the voted for project for leadership', async () => {
      //   let { firstUint } = await stubUtil.callHistory(mockGTC, 'trackProject');
      //   assert.equal(firstUint, 0, 'voted for project should be considered for leadership');
      // })
      //
      // it('attemps to activate the leading project', async () => {
      //   let { called } = await stubUtil.callHistory(mockGTC, 'attemptProjectActivation');
      //   assert.equal(called, true, 'project activation should be attempted');
      // })
    });

    describe('when the crowdsale is not open', async () => {
      after(async () => {
        await mockGTC.setMockDoomsDay(defaultDoomsDay);
      });

      it('reverts when the crowdsale has not opened yet', async () => {
        await mockGTC.setMockOpening(defaultOpeningTime * 400);
        await exceptions.catchRevert(mockGTC.buyTokens({ from: accounts[2], value: 500000 }));
      });

      it('reverts after the crowdsale has closed', async () => {
        await mockGTC.setMockOpening(defaultOpeningTime);
        await mockGTC.setMockDoomsDay(defaultDoomsDay / 2);
        await exceptions.catchRevert(mockGTC.buyTokens({ from: accounts[2], value: 500000 }));
      });
    });
  });

  describe('transferCapitalToDeveloper', async () => {
    describe('when the sender has access', async () => {
      describe('when there is enough weiRaised', async () => {
        let initialDeveloperWei;
        before(async () => {
          const addr = mockGTC.address;
          await web3.eth.sendTransaction({ from: accounts[1], to: addr, value: 7000000 });
          await mockGTC.setMockWeiRaised(8000000);
          const developerWei = await weiBalanceOf(accounts[0]);
          initialDeveloperWei = new BigNumber(developerWei.toString());
          await mockGTC.transferCapitalToDeveloper(7000000, { from: accounts[2] });
        });

        it('transfers the capital to the developer', async () => {
          let developerWei = await weiBalanceOf(accounts[0]);
          let finalDeveloperWei = new BigNumber(developerWei.toString());
          let expected = initialDeveloperWei.plus('7000000').decimalPlaces(0);
          assert(
            finalDeveloperWei.isEqualTo(expected),
            'capital required should be forwarded to the developer',
          );
        });

        it('decreases weiRaised by the capital required', async () => {
          let afterWei = await parseMethod(getWeiRaised);
          assert.equal(afterWei, 1000000, 'weiRaised not reduced by capitalRequired');
        });
      });
      describe('when there is not enough weiRaised', async () => {
        before(async () => {
          const addr = mockGTC.address;
          await web3.eth.sendTransaction({ from: accounts[1], to: addr, value: 7000000 });
          await mockGTC.setMockWeiRaised(6000000);
        });

        after(async () => {
          await mockGTC.setMockWeiRaised(8000000);
        });
        it('reverts', async () => {
          await exceptions.catchRevert(
            mockGTC.transferCapitalToDeveloper(7000000, { from: accounts[2] }),
          );
        });
      });
      describe('when the sender does not have access', async () => {
        it('reverts', async () => {
          await exceptions.catchRevert(
            mockGTC.transferCapitalToDeveloper(7000000, { from: accounts[0] }),
          );
        });
      });
    });
  });

  describe('reimburseFunds', async () => {
    describe('when the crowdsale has closed', async () => {
      before(async () => {
        await mockGTC.setMockDoomsDay(0);
        const addr = mockGTC.address;
        await web3.eth.sendTransaction({ from: accounts[1], to: addr, value: 1200000 });

        await mockGTC.setMockWeiRaised(1200000);

        await stubUtil.addMethod(rStub, 'recordReimbursement');
        await stubUtil.addMethod(inactiveToken, 'resetInactiveTokenCycle');
        await stubUtil.addMethod(projectLeaderTracker, 'reset');
        await mockGTC.reimburseFunds();
      });

      after(async () => {
        await mockGTC.setMockDoomsDay(defaultDoomsDay);
        await stubUtil.resetMethod(rStub, 'recordReimbursement');
        await stubUtil.resetMethod(inactiveToken, 'resetInactiveTokenCycle');
        await stubUtil.resetMethod(projectLeaderTracker, 'reset');
      });

      it('transfers weiRaised to reimbursements', async () => {
        let balance = await await weiBalanceOf(rStub.address);
        assert.equal(balance, 1200000, 'weiRaised not forwarded to reimbursements');
      });

      it('records reiumbursement transfer', async () => {
        let { called, firstUint } = await stubUtil.callHistory(rStub, 'recordReimbursement');
        assert.equal(called, true, 'reimbursement not recorded');
        assert.equal(firstUint, 1200000, 'reimbursement amount not recorded properly');
      });

      it('sets weiRaised to 0', async () => {
        let weiRaised = await mockGTC.weiRaised_.call();
        assert.equal(weiRaised, 0, 'weiRaised should be set to 0');
      });

      it('resets the inactive token cycle and resets the developers inactiveTokens', async () => {
        let { called } = await stubUtil.callHistory(inactiveToken, 'resetInactiveTokenCycle');
        assert.equal(called, true, 'inactive token cycle should be reset');
      });
    });

    describe('when the crowdsale is still open', async () => {
      before(async () => {
        await web3.eth.sendTransaction({ from: accounts[1], to: mockGTC.address, value: 1200000 });
        await mockGTC.setMockWeiRaised(1200000);
      });

      it('reverts', async () => {
        await exceptions.catchRevert(mockGTC.reimburseFunds());
      });
    });
  });

  // describe('transferVotes', async () => {
  //   before(async () => {
  //     await stubUtil.addMethod(projStub1, 'removeVotes');
  //     await stubUtil.addMethod(projStub2, 'vote');
  //
  //     await mockGTC.transferVotes(0, 1, 20000000, {from: accounts[2]});
  //   })
  //
  //   after(async () => {
  //     await stubUtil.resetMethod(projStub1, 'removeVotes');
  //     await stubUtil.resetMethod(projStub2, 'vote');
  //   })
  //
  //   it('removes votes from one project', async () => {
  //     let { firstAddress, firstUint } = await stubUtil.callHistory(projStub1, 'removeVotes');
  //     assert.equal(firstAddress, accounts[2], 'votes not removed from correct voter');
  //     assert.equal(firstUint, 20000000, 'incorrect vote amount transfered from project');
  //   })
  //
  //   it('votes for another project', async () => {
  //     let { firstAddress, firstUint } = await stubUtil.callHistory(projStub2, 'vote');
  //     assert.equal(firstAddress, accounts[2], 'votes not assigned for correct voter');
  //     assert.equal(firstUint, 20000000, 'incorrect vote amount transfered to project');
  //   })
  // })

  // describe('removeVotesFromProject_', async () => {
  //   before(async () => {
  //     await stubUtil.addMethod(projStub2, 'removeVotes');
  //     // await stubUtil.addMethod(iLStub, 'addVoteCredit');
  //     await stubUtil.addMethod(mockGTC, 'attemptProjectActivation');
  //     await stubUtil.addMethod(lTStub, 'trackProject');
  //     await mockGTC._removeVotesFromProject_(accounts[2], projStub2.address, 20000000);
  //   })
  //
  //   after(async () => {
  //     await stubUtil.resetMethod(projStub2, 'removeVotes');
  //     // await stubUtil.resetMethod(iLStub, 'addVoteCredit');
  //     await stubUtil.resetMethod(mockGTC, 'attemptProjectActivation');
  //     await stubUtil.resetMethod(lTStub, 'trackProject');
  //   })
  //
  //   it('removes the indicated amount of votes from a project', async () => {
  //     let { firstAddress, firstUint } = await stubUtil.callHistory(projStub2, 'removeVotes');
  //     assert.equal(firstAddress, accounts[2], 'votes not removed from correct voter');
  //     assert.equal(firstUint, 20000000, 'incorrect vote amount transfered from project');
  //   })
  //
  //   // it('assigns the inicated amount of vote credit to the sender', async () => {
  //   //   let { firstAddress, firstUint } = await stubUtil.callHistory(iLStub, 'addVoteCredit');
  //   //   assert.equal(firstAddress, accounts[2], 'votes not assigned for correct voter');
  //   //   assert.equal(firstUint, 20000000, 'incorrect vote credit amount assigned');
  //   // })
  //
  //   it('considers the project for leadership', async () => {
  //     let { called, firstAddress } = await stubUtil.callHistory(lTStub, 'trackProject');
  //     assert.equal(called, true, 'project voted for should be considered for leadership');
  //     assert.equal(firstAddress, projStub2.address, 'project voted for should be considered for leadership');
  //   })
  //
  //   it('attempts to activate a project', async () => {
  //     let { called } = await stubUtil.callHistory(mockGTC, 'activateProject');
  //     assert.equal(called, true, 'project activation should be attempted');
  //   })
  // })
  //
  // describe('removeVotesFromProjectByAccount', async () => {
  //   describe('when the project is not open', async () => {
  //     before(async () => {
  //       await stubUtil.addMethod(mockGTC, 'removeVotesFromProject_');
  //       await projStub2.setMockVotesOf(accounts[2], 5000);
  //       await projStub2.setStubOpenStatus(false);
  //       await mockGTC.removeVotesFromProjectByAccount(accounts[2], projStub2.address);
  //     })
  //
  //     after(async () => {
  //       await stubUtil.resetMethod(mockGTC, 'removeVotesFromProject_');
  //     })
  //
  //     it('adds all votes that the account dedicated to the project to the accounts vote credit', async () => {
  //       let { firstAddress, secondAddress, firstUint } = await stubUtil.callHistory(mockGTC, 'removeVotesFromProject_');
  //       assert.equal(firstAddress, accounts[2], 'vote credit not added to the correct account');
  //       assert.equal(secondAddress, projStub2.address, 'votes not removed from the correct project');
  //       assert.equal(firstUint, 5000, 'incorrect vote credit amount assigned');
  //     })
  //   })
  //
  //   describe('when the project is active', async () => {
  //     before(async () => {
  //       await stubUtil.addMethod(mockGTC, 'removeVotesFromProject_');
  //       await projStub1.setMockVotesOf(accounts[2], 5000);
  //       await projStub1.setStubOpenStatus(true);
  //       await projStub1.setStubActiveStatus(true);
  //       await mockGTC.removeVotesFromProjectByAccount(accounts[2], projStub2.address);
  //     })
  //
  //     after(async () => {
  //       await stubUtil.resetMethod(mockGTC, 'removeVotesFromProject_');
  //     })
  //
  //     it('adds all votes that the account dedicated to the project to the accounts vote credit', async () => {
  //       let { firstAddress, secondAddress, firstUint } = await stubUtil.callHistory(mockGTC, 'removeVotesFromProject_');
  //       assert.equal(firstAddress, accounts[2], 'vote credit not added to the correct account');
  //       assert.equal(secondAddress, projStub2.address, 'votes not removed from the correct project');
  //       assert.equal(firstUint, 5000, 'incorrect vote credit amount assigned');
  //     })
  //   })
  //
  //   describe('when the project is open and not active', async () => {
  //     before(async () => {
  //       await projStub2.setStubOpenStatus(true);
  //       await projStub2.setStubActiveStatus(false);
  //     })
  //
  //     after(async () => {
  //       await stubUtil.resetMethod(mockGTC, 'removeVotesFromProject_');
  //     })
  //
  //     it('reverts', async () => {
  //       await exceptions.catchRevert(mockGTC.removeVotesFromProjectByAccount(accounts[2], 0));
  //     })
  //   })
  // })
  //
  // //we will test out sending unsigned/incorrectly signed messages on the frontend
  // describe('voteForProject', async () => {
  //   before(async () => {
  //     await stubUtil.addMethod(projStub3, 'vote');
  //     // await stubUtil.addMethod(iLStub, 'removeVoteCredit');
  //     await stubUtil.addMethod(mockGTC, 'authenticateVoter');
  //     await stubUtil.addMethod(mockGTC, 'activateProject');
  //     await stubUtil.addMethod(mockGTC, 'authenticateVoter');
  //     await stubUtil.addMethod(lTStub, 'trackProject');
  //     const hash = await web3.fromAscii('random');
  //     await mockGTC.setMockVoteHash(projStub3.address, hash);
  //     await mockGTC.voteForProject(projStub3.address, accounts[2], 20000000, hash, {from: accounts[1]});
  //   })
  //
  //   after(async () => {
  //     await stubUtil.resetMethod(projStub3, 'vote');
  //     // await stubUtil.resetMethod(iLStub, 'removeVoteCredit');
  //     await stubUtil.resetMethod(lTStub, 'trackProject');
  //     await stubUtil.resetMethod(mockGTC, 'authenticateVoter');
  //     await stubUtil.resetMethod(mockGTC, 'activateProject');
  //   })
  //
  //   it('authenticates the voter', async () => {
  //     let { firstAddress } = await stubUtil.callHistory(mockGTC, 'authenticateVoter');
  //     // console.log('firstBytes', firstBytes);
  //     // console.log('firstBytes32', secondBytes);
  //     assert.equal(firstAddress, accounts[2], 'authentication should be passed the voter address');
  //   })
  //
  //   // it('removes the indicated amount of votes from the senders vote credit', async () => {
  //   //   let { firstAddress, firstUint } = await stubUtil.callHistory(iLStub, 'removeVoteCredit');
  //   //   assert.equal(firstAddress, accounts[2], 'votes credit not removed for the correct voter');
  //   //   assert.equal(firstUint, 20000000, 'incorrect vote credit amount removed');
  //   // })
  //
  //   it('votes for the project indicated', async () => {
  //     let { firstAddress, firstUint } = await stubUtil.callHistory(projStub3, 'vote');
  //     assert.equal(firstAddress, accounts[2], 'the corrent project was not voted for');
  //     assert.equal(firstUint, 20000000, 'incorrect vote amount assigned to project');
  //   })
  //
  //   it('considers the project for leadership', async () => {
  //     let { called, firstAddress } = await stubUtil.callHistory(lTStub, 'trackProject');
  //     assert.equal(called, true, 'project voted for should be considered for leadership');
  //     assert.equal(firstAddress, projStub3.address, 'project voted for should be considered for leadership');
  //   })
  //
  //   it('attempts to activate a project', async () => {
  //     let { called } = await stubUtil.callHistory(mockGTC, 'activateProject');
  //     assert.equal(called, true, 'project activation should be attempted');
  //   })
  // })
  // describe('activateProject', async () => {
  //   before(async () => {
  //     await mockGTC.setMockTentativeLeader(projStub1.address, 7000000);
  //
  //     await stubUtil.addMethod(projStub1, 'activate');
  //     await stubUtil.addMethod(inactiveToken, 'increasePendingActivations');
  //     await mockGTC.setStubProjectCount(3);
  //   })
  //
  //   describe('when there is not enough weiRaised to cover the project', async () => {
  //     let initialDeveloperWei;
  //     let beforeWeiRaised;
  //     before(async () => {
  //       await mockGTC.setMockWeiRaised(500);
  //       await projStub1.setStubOpenStatus(true);
  //       await mockGTC.setMockConfirmedLeaderStatus(true);
  //       initialDeveloperWei = await weiBalanceOf(accounts[1]);
  //       beforeWeiRaised = await parseMethod(getWeiRaised);
  //       await mockGTC.activateProject_();
  //     })
  //
  //     it('does not activate the project', async () => {
  //       let { called } = await stubUtil.callHistory(projStub1, 'activate');
  //       assert.equal(called, false, 'project should not be activated');
  //     })
  //
  //     it('does not forward funds to the developer', async () => {
  //       let finalDeveloperWei = await weiBalanceOf(accounts[1]);
  //       assert.equal(finalDeveloperWei, initialDeveloperWei, 'funds should not be forwarded to the developer');
  //     })
  //
  //     it('does not affect weiRaised', async () => {
  //       let afterWei = await parseMethod(getWeiRaised);
  //       assert.equal(afterWei, beforeWeiRaised, 'weiRaised not reduced by capitalRequired');
  //     })
  //
  //     it('does not affect inactiveProjectCount', async () => {
  //       let afterInactiveProjectCount = await await mockGTC.inactiveProjectCount();
  //       assert.equal(afterInactiveProjectCount, 3, 'inactiveProjectCount should not change');
  //     })
  //
  //     it('does not affect pending token activations', async () => {
  //       let { called } = await stubUtil.callHistory(inactiveToken, 'increasePendingActivations');
  //       assert.equal(called, false, 'pending token activations should not change');
  //     })
  //   })
  //
  //   describe('when the tentative leader has not been confirmed', async () => {
  //     let initialDeveloperWei;
  //     let beforeWeiRaised;
  //     before(async () => {
  //       await mockGTC.setMockWeiRaised(8000000);
  //       await projStub1.setStubOpenStatus(true);
  //       await mockGTC.setMockConfirmedLeaderStatus(false);
  //       initialDeveloperWei = await weiBalanceOf(accounts[1]);
  //       beforeWeiRaised = await parseMethod(getWeiRaised);
  //       await mockGTC.attemptProjectActivation_();
  //     })
  //
  //     it('does not activate the project', async () => {
  //       let { called } = await stubUtil.callHistory(projStub1, 'activate');
  //       assert.equal(called, false, 'project should not be activated');
  //     })
  //
  //     it('does not forward funds to the developer', async () => {
  //       let finalDeveloperWei = await weiBalanceOf(accounts[1]);
  //       assert.equal(finalDeveloperWei, initialDeveloperWei, 'funds should not be forwarded to the developer');
  //     })
  //
  //     it('does not affect weiRaised', async () => {
  //       let afterWei = await parseMethod(getWeiRaised);
  //       assert.equal(afterWei, beforeWeiRaised, 'weiRaised not reduced by capitalRequired');
  //     })
  //
  //     it('does not affect inactiveProjectCount', async () => {
  //       let afterInactiveProjectCount = await await mockGTC.inactiveProjectCount();
  //       assert.equal(afterInactiveProjectCount, 3, 'inactiveProjectCount should not change');
  //     })
  //
  //     it('does not affect pending token activations', async () => {
  //       let { called } = await stubUtil.callHistory(inactiveToken, 'increasePendingActivations');
  //       assert.equal(called, false, 'pending token activations should not change');
  //     })
  //   })
  //
  //   describe('when the tentative leader has closed', async () => {
  //     let initialDeveloperWei;
  //     let beforeWeiRaised;
  //     before(async () => {
  //       await mockGTC.setMockWeiRaised(8000000);
  //       await projStub1.setStubOpenStatus(false);
  //       await mockGTC.setMockConfirmedLeaderStatus(true);
  //       initialDeveloperWei = await weiBalanceOf(accounts[1]);
  //       beforeWeiRaised = await parseMethod(getWeiRaised);
  //       await mockGTC.attemptProjectActivation_();
  //     })
  //
  //     it('does not activate the project', async () => {
  //       let { called } = await stubUtil.callHistory(projStub1, 'activate');
  //       assert.equal(called, false, 'project should not be activated');
  //     })
  //
  //     it('does not forward funds to the developer', async () => {
  //       let finalDeveloperWei = await weiBalanceOf(accounts[1]);
  //       assert.equal(finalDeveloperWei, initialDeveloperWei, 'funds should not be forwarded to the developer');
  //     })
  //
  //     it('does not affect weiRaised', async () => {
  //       let afterWei = await parseMethod(getWeiRaised);
  //       assert.equal(afterWei, beforeWeiRaised, 'weiRaised not reduced by capitalRequired');
  //     })
  //
  //     it('does not affect inactiveProjectCount', async () => {
  //       let afterInactiveProjectCount = await await mockGTC.inactiveProjectCount();
  //       assert.equal(afterInactiveProjectCount, 3, 'inactiveProjectCount should not change');
  //     })
  //
  //     it('does not affect pending token activations', async () => {
  //       let { called } = await stubUtil.callHistory(inactiveToken, 'increasePendingActivations');
  //       assert.equal(called, false, 'pending token activations should not change');
  //     })
  //   })
  //
  //   describe('when a project can be activated', async () => {
  //     let initialDeveloperWei;
  //     let beforeWeiRaised;
  //     before(async () => {
  //       await mockGTC.receiveMockWei({value: 8000000, from: accounts[2]});
  //       await mockGTC.setMockWeiRaised(8000000);
  //       await projStub1.setStubOpenStatus(true);
  //       await mockGTC.setMockConfirmedLeaderStatus(true);
  //       developerWei = await weiBalanceOf(accounts[1]);
  //       initialDeveloperWei = new BigNumber(developerWei.toString());
  //       beforeWeiRaised = await parseMethod(getWeiRaised);
  //       await mockGTC.attemptProjectActivation_();
  //     })
  //
  //     after(async () => {
  //       await stubUtil.resetMethod(projStub1, 'activate');
  //       await stubUtil.resetMethod(inactiveToken, 'increasePendingActivations');
  //       await mockGTC.setStubProjectCount(3);
  //     })
  //
  //     it('activates the project', async () => {
  //       let { called } = await stubUtil.callHistory(projStub1, 'activate');
  //       assert.equal(called, true, 'project should be activated');
  //     })
  //
  //     it('forwards capital required to the developer', async () => {
  //       let developerWei = await weiBalanceOf(accounts[1]);
  //       let finalDeveloperWei = new BigNumber(developerWei.toString());
  //       let expected = initialDeveloperWei.plus('7000000').decimalPlaces(0);
  //       assert(finalDeveloperWei.isEqualTo(expected), 'capital required should be forwarded to the developer');
  //     })
  //
  //     it('decreases weiRaised by the capital required', async () => {
  //       let afterWei = await parseMethod(getWeiRaised);
  //         assert.equal(afterWei, beforeWeiRaised - 7000000, 'weiRaised not reduced by capitalRequired');
  //     })
  //
  //     it('decreases the inactiveProjectCount by one', async () => {
  //       let afterInactiveProjectCount = await await mockGTC.inactiveProjectCount();
  //       assert.equal(afterInactiveProjectCount, 2, 'inactiveProjectCount should decrease by one');
  //     })
  //
  //     it('increases pending token activations by the amount of tokens associated with the project', async () => {
  //       let { firstUint, called } = await stubUtil.callHistory(inactiveToken, 'increasePendingActivations');
  //       assert.equal(called, true, 'pending token activations should be increased');
  //       assert.equal(firstUint, 20000000, 'pending activations should be increases by the number of tokens associated with the activated project');
  //     })
  //   })
});

const setUp = async () => {
  const votingToken = await VotingTokenStub.new();
  const activeToken = await ActiveTokenStub.new(votingToken.address);
  inactiveToken = await InactiveTokenStub.new(votingToken.address, activeToken.address);
  rStub = await ReimbursementsStub.new(inactiveToken.address);
  projectLeaderTracker = await ProjectLeaderTrackerStub.new();
  tokenPurchaseHelper = await TokenPurchaseHelperStub.new();
  await initMock();
};

const initMock = async () => {
  defaultOpeningTime = await getLatestBlockTime();
  defaultDoomsDay = defaultOpeningTime + 86400 * 240;
  //possibly reverting because of race conditions with the linked library? I think thats the only thing that changed...
  mockGTC = await GNITokenCrowdsaleMock.new(
    defaultOpeningTime,
    defaultDoomsDay,
    1,
    accounts[0],
    inactiveToken.address,
    rStub.address,
  );
  await mockGTC.addCoAmendment(tokenPurchaseHelper.address);
  await mockGTC.addCoAmendment(projectLeaderTracker.address);
  await mockGTC.addCoAmendment(accounts[2]);
};

// const initProjectStubs = async () => {
//   projStub1 = await ProjectStub.new(
//     'project1', accounts[1], accounts[2],
//     4000000, 2000000, 200000000,
//     100000000, '340', '340', 75000000
//   )
//
//   await mockGTC.addMockProject(projStub1.address);
//
//   projStub2 = await ProjectStub.new(
//     'project2', accounts[1], accounts[2],
//     3000000, 1000000, 150000000,
//     50000000, '340', '340', 50000000
//   )
//
//   await mockGTC.addMockProject(projStub2.address);
//
//   projStub3 = await ProjectStub.new(
//     'project3', accounts[1], accounts[2],
//     4000000, 2000000, 200000000,
//     100000000, '340', '340', 75000000
//   );
//
//   await mockGTC.addMockProject(projStub3.address);
// }

// const initIL = async () => {
//   iLStub = await InvestorListStub.new();
// }

// const initToken = async () => {
//   inactiveToken = await InactiveTokenStub.new(iLStub.address);
// }
//
// const initLeaderBoard = async () => {
//   lTStub = await ProjectLeaderTrackerStub.new();
// }
//
// const initReimbursements = async () => {
//   rStub = await ReimbursementsStub.new(inactiveToken.address);
// }
//
// const getProjectCount = async () => {
//   return await mockGTC.mockProjectCount.call();
// }
//
// const getTotalValuation = async () => {
//   return await mockGTC.mockValuation.call();
// }

const getDoomsDay = async () => {
  return await mockGTC.mockDoomsDay.call();
};

const getWeiRaised = async () => {
  return await mockGTC.weiRaised_.call();
};

const getLatestBlockTime = async () => {
  let time = await web3.eth.getBlock('latest');
  return time.timestamp;
};

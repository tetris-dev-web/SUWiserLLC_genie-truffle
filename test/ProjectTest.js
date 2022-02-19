const ProjectMock = artifacts.require('ProjectMock');
const DividendsStub = artifacts.require('DividendsStub');
const TokenStub = artifacts.require('TokenStub');
const InvestorListStub = artifacts.require('InvestorListStub');

const exceptions = require('./exceptions');
const { parseBN } = require('./parseUtil');

let accounts;
let mP;
let dStub;

let beforeVotes;
let beforeTotalVotes;
let beforeClosingTime;

contract('Project', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  describe('votesOf', async () => {
    it('returns the voters votes', async () => {
      let votes = await mP.votesOf(accounts[1]);
      assert.equal(votes, 2000000, 'vote count of the voter not returned');
    });
  });

  describe('open', async () => {
    after(async () => {
      await mP.changeClosingTime(beforeClosingTime);
    });

    it('returns true when open', async () => {
      let open = await mP.open();
      assert.equal(open, true, 'should return true when the project is open');
    });

    it('returns true when closed', async () => {
      await mP.changeClosingTime(0);
      let open = await mP.open();
      assert.equal(open, false, 'should return false when the project is closed');
    });
  });

  describe('totalVotes_', async () => {
    after(async () => {
      await removeMockVoter(accounts[2]);
    });

    it('returns the total number of votes for the project', async () => {
      await addMockVoter(accounts[2], 1000000);
      let votes = await mP.totalVotes_();
      assert.equal(votes, 3000000, 'total number of votes not returned');
    });
  });

  describe('closingTime_', async () => {
    after(async () => {
      await mP.changeClosingTime(beforeClosingTime);
    });

    it('returns the projects closing time', async () => {
      await mP.changeClosingTime(2000);
      let closingTime = await mP.closingTime_();
      assert.equal(closingTime, 2000, 'closing time not returned');
    });
  });

  describe('developerTokens', async () => {
    it('returns the number of developer tokens for the project', async () => {
      let dTokens = await mP.developerTokens_();
      assert.equal(dTokens, 40000000, 'projects developer token amount not returned');
    });
  });

  describe('investorTokens', async () => {
    it('returns the number of investor tokens for the project', async () => {
      let iTokens = await mP.investorTokens_();
      assert.equal(iTokens, 10000000, 'projects investor token amount not returned');
    });
  });

  describe('capitalRequired_', async () => {
    it('returns the capital required for the project', async () => {
      let capital = await mP.capitalRequired_();
      assert.equal(capital, 1000000, 'capital required for the project not returned');
    });
  });

  describe('addManager', async () => {
    it('adds the address as a manager when the sender is the developer or a manager', async () => {
      let before = await mP.checkManagerStatus(accounts[2]);
      await mP.addManager(accounts[2], { from: accounts[0] });
      let after = await mP.checkManagerStatus(accounts[2]);
      assert.equal(before, false, 'address should not be a manager before it is added');
      assert.equal(after, true, 'developer should be able to add a manager');

      before = await mP.checkManagerStatus(accounts[3]);
      await mP.addManager(accounts[3], { from: accounts[2] });
      after = await mP.checkManagerStatus(accounts[3]);
      assert.equal(before, false, 'address should not be a manager before it is added');
      assert.equal(after, true, 'manager should be able to add a manager');
    });

    it('reverts when the sender is not the developer or a manager', async () => {
      await exceptions.catchRevert(mP.addManager(accounts[1], { from: accounts[1] }));
    });
  });

  describe('deposit', async () => {
    it('adds the wei value to the dividend wallet', async () => {
      let s1 = await web3.eth.getBalance(dStub.address);
      let before = Number(s1);
      await mP.deposit({ value: 3000, from: accounts[1] });
      let s2 = await web3.eth.getBalance(dStub.address);
      let after = Number(s2);
      assert.equal(after, before + 3000, 'wei not deposited to dividend wallet');
    });
  });

  describe('vote', async () => {
    describe('when the sender is the owner', async () => {
      before(async () => {
        await mP.vote(accounts[1], 1000000);
      });

      after(async () => {
        await mP.removeMockVoter(accounts[1]);
        await mP.changeClosingTime(beforeClosingTime);
      });

      it('adds the voters votes by the vote amount', async () => {
        let bN = await mP.checkVoteAmount(accounts[1]);
        let afterVotes = parseBN(bN);
        assert.equal(afterVotes, beforeVotes + 1000000, 'votes not added to the voter');
      });

      it('adds the totalVotes by the vote amount', async () => {
        let bN = await mP.totalVotes_();
        let afterTotalVotes = parseBN(bN);
        assert.equal(afterTotalVotes, beforeTotalVotes + 1000000, 'votes not added to totalVotes');
      });

      it('extends the closing time by 43200', async () => {
        let bN = await mP.closingTime_();
        let afterClosingTime = parseBN(bN);
        assert.equal(afterClosingTime, beforeClosingTime + 43200, 'closingTime not extended');
      });
    });

    describe('when the sender is not the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(mP.vote(accounts[1], 1000000, { from: accounts[1] }));
      });
    });
  });

  describe('removeVotes', async () => {
    describe('when the sender is the owner', async () => {
      before(async () => {
        await addMockVoter(accounts[1], 2000000);
        await mP.removeVotes(accounts[1], 1000000);
      });

      it('decreases the voters votes by the vote amount', async () => {
        let bN = await mP.checkVoteAmount(accounts[1]);
        let afterVotes = parseBN(bN);
        assert.equal(afterVotes, beforeVotes - 1000000, 'votes not removed from the voter');
      });

      it('decreases the totalVotes by the vote amount', async () => {
        let bN2 = await mP.totalVotes_();
        let afterTotalVotes = parseBN(bN2);
        assert.equal(
          afterTotalVotes,
          beforeTotalVotes - 1000000,
          'votes not removed from totalVotes',
        );
      });

      it('diminishes the closing time by 43200', async () => {
        let bN2 = await mP.closingTime_();
        let afterClosingTime = parseBN(bN2);
        assert.equal(afterClosingTime, beforeClosingTime - 43200, 'closingTime not diminished');
      });

      it('reverts if the voteAmount is greater than the totalVotes', async () => {
        await addMockVoter(accounts[2], 3000000);
        await exceptions.catchRevert(mP.removeVotes(accounts[1], 6000000));
      });

      it('reverts if the voteAmount is greater than the voters votes', async () => {
        await addMockVoter(accounts[2], 3000000);
        await exceptions.catchRevert(mP.removeVotes(accounts[1], 3000000));
      });
    });

    describe('when the sender is not the owner', async () => {
      before(async () => {
        await addMockVoter(accounts[1], 2000000);
      });

      it('reverts', async () => {
        await exceptions.catchRevert(mP.removeVotes(accounts[1], 1000000, { from: accounts[1] }));
      });
    });
  });

  describe('activate', async () => {
    describe('when the sender is not the owner', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(mP.activate({ from: accounts[1] }));
      });
    });

    describe('when the sender is the owner', async () => {
      it('activates the project', async () => {
        let beforeOpenStatus = await mP.active_();
        await mP.activate();
        let afterOpenStatus = await mP.active_();
        assert.equal(beforeOpenStatus, false, 'project should not be active before activation');
        assert.equal(afterOpenStatus, true, 'project was not activated');
      });
    });
  });
});

//we may need to make the dividendWallet a contract to test this properly
const setUp = async () => {
  await initDStub();
  mP = await mockP({
    name: 'project1',
    developer: accounts[0],
    dividendWallet: dStub.address,
    valuation: 5000000,
    capitalRequired: 1000000,
    developerTokens: 40000000,
    investorTokens: 10000000,
    lat: '340',
    lng: '340',
  });
  await addMockVoter(accounts[1], 2000000);
  await recordVoteValues();
};

const initDStub = async () => {
  let i = await InvestorListStub.new();
  let t = await TokenStub.new(i.address);
  dStub = await DividendsStub.new(t.address, accounts[1]);
};

const recordVoteValues = async () => {
  let votesBN = await mP.checkVoteAmount(accounts[1]);
  beforeVotes = parseBN(votesBN);

  let totalVotesBN = await mP.totalVotes_();
  beforeTotalVotes = parseBN(totalVotesBN);

  let closingBN = await mP.closingTime_();
  beforeClosingTime = parseBN(closingBN);
};

const mockP = async (params) => {
  let {
    name,
    developer,
    dividendWallet,
    valuation,
    capitalRequired,
    developerTokens,
    investorTokens,
    lat,
    lng,
  } = params;

  return await ProjectMock.new(
    name,
    developer,
    dividendWallet,
    valuation,
    capitalRequired,
    developerTokens,
    investorTokens,
    lat,
    lng,
  );
};

const removeMockVoter = async (account) => {
  await mP.removeMockVoter(account);
};

const addMockVoter = async (account, votes) => {
  await mP.initMockVoter(account, votes);
};

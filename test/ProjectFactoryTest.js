const ProjectFactroyMock = artifacts.require('ProjectFactoryMock');
const GNITokenCrowdsaleStub = artifacts.require('GNITokenCrowdsaleStub');
const ProjectFactoryHelperStub = artifacts.require('ProjectFactoryHelperStub');
const InactiveTokenStub = artifacts.require('InactiveTokenStub');
const ActiveTokenStub = artifacts.require('ActiveTokenStub');
const VotingTokenStub = artifacts.require('VotingTokenStub');
const ProjectLeaderTrackerStub = artifacts.require('ProjectLeaderTrackerStub');
const ActivationStub = artifacts.require('Activation');
const VotingStub = artifacts.require('VotingStub');
const Project = artifacts.require('Project');
const ProjectStub = artifacts.require('ProjectStub');
const ProjectFactoryHelper = artifacts.require('ProjectFactoryHelper');

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');

let pF;
let cS;
let pFH;
let accounts;

let projectAddr;

let activation;
let voting;
let projectLeaderTracker;

contract('ProjectFactory', async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  });

  describe('createProject', async () => {
    describe('when the sender is the developer', async () => {
      let totalProjectCountT1;
      before(async () => {
        totalProjectCountT1 = await pF.totalProjectCount.call();
        await stubUtil.addMethod(cS, 'mintNewProjectTokensAndExtendDoomsDay');
        await stubUtil.addMethod(pFH, 'handleNewProject');
        await pF.createProject('information', 5000000, 2000000, 'cashflow', { from: accounts[0] });
      });

      it('mints new tokens and extend the crowdsale doomsday', async () => {
        const { firstUint, secondUint } = await stubUtil.callHistory(
          cS,
          'mintNewProjectTokensAndExtendDoomsDay',
        );
        assert.equal(firstUint, 5000000, 'should mint new tokens based on capital required');
        assert.equal(secondUint, 2000000, 'should mint new tokens based on valuation');
      });

      it('stores the projectAddr', async () => {
        projectAddr = await pF.projectById(1);
        assert(projectAddr, 'should store the project address');
      });

      it('creates a new project', async () => {
        assert(Project.at(projectAddr), 'project should exist');
      });

      it('increments the totalProjectCount by one', async () => {
        const totalProjectCountT2 = await pF.totalProjectCount.call();
        assert.equal(
          Number(totalProjectCountT2),
          Number(totalProjectCountT1) + 1,
          'should increase totalProjectCount by one',
        );
      });

      it('handles a new project', async () => {
        const { firstAddress } = await stubUtil.callHistory(pFH, 'handleNewProject');
        assert.equal(
          firstAddress,
          projectAddr,
          'should perform handle new project functionality by the project address',
        );
      });
    });
    describe('when the sender is not the developer', async () => {
      it('reverts', async () => {
        await exceptions.catchRevert(
          pF.createProject('information', 5000000, 2000000, 'cashflow', { from: accounts[1] }),
        );
      });
    });
  });
});

const setUp = async () => {
  const votingToken = await VotingTokenStub.new();
  const activeToken = await ActiveTokenStub.new(votingToken.address);
  const inactiveToken = await InactiveTokenStub.new(votingToken.address, activeToken.address);
  projectLeaderTracker = await ProjectLeaderTrackerStub.new();
  activation = await ActivationStub.new(inactiveToken.address, projectLeaderTracker.address);
  voting = await VotingStub.new(
    votingToken.address,
    projectLeaderTracker.address,
    activation.address,
  );
  pFH = await ProjectFactoryHelperStub.new(
    activation.address,
    voting.address,
    projectLeaderTracker.address,
  );
  await initCrowdsale(inactiveToken);
  pF = await ProjectFactroyMock.new(pFH.address, cS.address, accounts[0], accounts[2]);
};

const initCrowdsale = async (inactiveToken) => {
  const openingTime = await getLatestBlockTime();
  const doomsDay = openingTime + 86400 * 240;

  cS = await GNITokenCrowdsaleStub.new(
    openingTime,
    doomsDay,
    1,
    accounts[0],
    inactiveToken.address,
    accounts[1],
  );
};

const getLatestBlockTime = async () => {
  let time = await web3.eth.getBlock('latest');
  return time.timestamp;
};

const VotingMock = artifacts.require("VotingMock");
const VotingTokenStub = artifacts.require("VotingTokenStub");
const ProjectLeaderTrackerStub = artifacts.require("ProjectLeaderTrackerStub");
const ActiveTokenStub = artifacts.require("ActiveTokenStub");
const InactiveTokenStub = artifacts.require("InactiveTokenStub");
const ActivationStub = artifacts.require("ActivationStub");
const GNITokenCrowdsaleStub = artifacts.require("GNITokenCrowdsaleStub");
const ProjectStub = artifacts.require("ProjectStub");

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');

let votingToken;
let projectLeaderTracker;
let activation;
let voting;
let crowdsale;
let project;

let accounts;

contract("Voting", async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  })

  describe("voteForProject", async () => {
    before(async () => {
      await stubUtil.addMethod(project, "vote");
      await stubUtil.addMethod(votingToken, "assign");
      await stubUtil.addMethod(crowdsale, "extendDoomsDay");
      await stubUtil.addMethod(projectLeaderTracker, "trackProject");
      await stubUtil.addMethod(activation, "tryActivateProject");
      await voting.voteForProject(project.address, 50000, {from: accounts[1]});
    })

    after(async () => {
      await stubUtil.resetMethod(project, "vote");
      await stubUtil.resetMethod(votingToken, "assign");
      await stubUtil.resetMethod(crowdsale, "extendDoomsDay");
      await stubUtil.resetMethod(projectLeaderTracker, "trackProject");
      await stubUtil.resetMethod(activation, "tryActivateProject");
    })

    it("votes for the project", async () => {
      let { firstAddress, firstUint } = await stubUtil.callHistory(project, "vote");
      assert.equal(firstAddress, accounts[1], "should vote on behalf of the sender");
      assert.equal(firstUint, 50000, "should vote with the indicated amount");
    })

    it("assigns vote tokens", async () => {
      let { firstAddress, firstUint } = await stubUtil.callHistory(votingToken, "assign");
      assert.equal(firstAddress, accounts[1], "should assign tokens on behalf of the sender");
      assert.equal(firstUint, 50000, "should assign tokens with the indicated amount");
    })

    it("extends the doomsDay by six days", async () => {
      let { firstUint } = await stubUtil.callHistory(crowdsale, "extendDoomsDay");
      assert.equal(firstUint, 6, "it should extend the doomsDay by 6 days");
    })

    it("tracks the project", async () => {
      let { firstAddress } = await stubUtil.callHistory(projectLeaderTracker, "trackProject");
      assert.equal(firstAddress, project.address, "it should track the project voted for");
    })

    it("trys to activate a project", async () => {
      let { called } = await stubUtil.callHistory(activation, "tryActivateProject");
      assert(called, "it should try to activate a project");
    })
  })

  describe("voteAgainstProject", async () => {
    before(async () => {
      await stubUtil.addMethod(project, "voteAgainst");
      await stubUtil.addMethod(votingToken, "freeUp");
      await stubUtil.addMethod(crowdsale, "reduceDoomsDay");
      await stubUtil.addMethod(projectLeaderTracker, "trackProject");
      await stubUtil.addMethod(activation, "tryActivateProject");
      await voting.voteAgainstProject(project.address, 50000, {from: accounts[1]});
    })

    after(async () => {
      await stubUtil.resetMethod(project, "voteAgainst");
      await stubUtil.resetMethod(votingToken, "freeUp");
      await stubUtil.resetMethod(crowdsale, "reduceDoomsDay");
      await stubUtil.resetMethod(projectLeaderTracker, "trackProject");
      await stubUtil.resetMethod(activation, "tryActivateProject");
    })

    it("votes against the project", async () => {
      let { firstAddress, firstUint } = await stubUtil.callHistory(project, "voteAgainst");
      assert.equal(firstAddress, accounts[1], "should vote on behalf of the sender");
      assert.equal(firstUint, 50000, "should vote with the indicated amount");
    })

    it("frees up vote tokens", async () => {
      let { firstAddress, firstUint } = await stubUtil.callHistory(votingToken, "freeUp");
      assert.equal(firstAddress, accounts[1], "should assign tokens on behalf of the sender");
      assert.equal(firstUint, 50000, "should assign tokens with the indicated amount");
    })

    it("reduces the doomsDay by six days", async () => {
      let { firstUint } = await stubUtil.callHistory(crowdsale, "reduceDoomsDay");
      assert.equal(firstUint, 6, "it should extend the doomsDay by 6 days");
    })

    it("tracks the project", async () => {
      let { firstAddress } = await stubUtil.callHistory(projectLeaderTracker, "trackProject");
      assert.equal(firstAddress, project.address, "it should track the project voted for");
    })

    it("trys to activate a project", async () => {
      let { called } = await stubUtil.callHistory(activation, "tryActivateProject");
      assert(called, "it should try to activate a project");
    })
  })

  describe("removeVotesFromIneligibleProject", async () => {
    before(async () => {
      await stubUtil.addMethod(project, "removeVotes");
      await stubUtil.addMethod(votingToken, "freeUp");
      await stubUtil.addMethod(crowdsale, "reduceDoomsDay");
      await stubUtil.addMethod(projectLeaderTracker, "trackProject");
      await stubUtil.addMethod(activation, "tryActivateProject");
      await project.setMockVotesOf(accounts[1], 4000);
      await voting.removeVotesFromIneligibleProject(accounts[1], project.address);
    })

    after(async () => {
      await stubUtil.resetMethod(project, "removeVotes");
      await stubUtil.resetMethod(votingToken, "freeUp");
      await stubUtil.resetMethod(crowdsale, "reduceDoomsDay");
      await stubUtil.resetMethod(projectLeaderTracker, "trackProject");
      await stubUtil.resetMethod(activation, "tryActivateProject");
    })

    it("removes votes from the project", async () => {
      let { firstAddress, firstUint } = await stubUtil.callHistory(project, "removeVotes");
      assert.equal(firstAddress, accounts[1], "should vote on behalf of the sender");
      assert.equal(firstUint, 4000, "should remove the accounts votes from the project");
    })

    it("frees up vote tokens", async () => {
      let { firstAddress, firstUint } = await stubUtil.callHistory(votingToken, "freeUp");
      assert.equal(firstAddress, accounts[1], "should assign tokens on behalf of the sender");
      assert.equal(firstUint, 4000, "should assign tokens with the indicated amount");
    })

    it("reduces the doomsDay by six days", async () => {
      let { firstUint } = await stubUtil.callHistory(crowdsale, "reduceDoomsDay");
      assert.equal(firstUint, 6, "it should extend the doomsDay by 6 days");
    })

    it("tracks the project", async () => {
      let { firstAddress } = await stubUtil.callHistory(projectLeaderTracker, "trackProject");
      assert.equal(firstAddress, project.address, "it should track the project voted for");
    })

    it("trys to activate a project", async () => {
      let { called } = await stubUtil.callHistory(activation, "tryActivateProject");
      assert(called, "it should try to activate a project");
    })
  })
})

const setUp = async () => {
  projectLeaderTracker = await ProjectLeaderTrackerStub.new();
  votingToken = await VotingTokenStub.new();
  let activeToken = await ActiveTokenStub.new(votingToken.address);
  let inactiveToken = await InactiveTokenStub.new(votingToken.address, activeToken.address);
  activation = await ActivationStub.new(inactiveToken.address, projectLeaderTracker.address);
  voting = await VotingMock.new(votingToken.address, projectLeaderTracker.address, activation.address);
  project = await ProjectStub.new(
    'information',
    accounts[0],
    3000000,
    1700000,
    3000000,
    1700000,
    'cashflow',
    2,
    accounts[1]
  );

  const openingTime = await getLatestBlockTime();
  const doomsDay = openingTime + 86400 * 240;

  crowdsale = await GNITokenCrowdsaleStub.new(
        openingTime,
        doomsDay,
        1,
        accounts[0],
        inactiveToken.address,
        accounts[1]
      );

  voting.setCrowdsale(crowdsale.address);
}

const getLatestBlockTime = async () => {
  let time = await web3.eth.getBlock('latest');
  return time.timestamp;
};

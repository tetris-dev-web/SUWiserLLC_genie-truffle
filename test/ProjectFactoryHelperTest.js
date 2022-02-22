const ProjectFactoryHelper = artifacts.require("ProjectFactoryHelper");
const InactiveTokenStub = artifacts.require("InactiveTokenStub");
const ActiveTokenStub = artifacts.require("ActiveTokenStub");
const VotingTokenStub = artifacts.require("VotingTokenStub");
const ProjectLeaderTrackerStub = artifacts.require("ProjectLeaderTrackerStub")
const ActivationStub = artifacts.require("ActivationStub");
const VotingStub = artifacts.require("VotingStub");
const ProjectStub = artifacts.require("ProjectStub");

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');

let projectFactoryHelper;
let projectLeaderTracker;
let activation;
let voting;
let accounts;

contract("ProjectFactoryHelper", async (_accounts) => {
  console.log("Hellllo")
  accounts = _accounts;

  before(async () => {
    console.log("beforeeee")
    await setUp();
    console.log("before")
  })
//test when not sent by owner
  describe("handleNewProject", async () => {
    describe("when the project has capitalRequired", async () => {
      let project;
      before(async () => {
        console.log("inner before")
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
        )

        await stubUtil.addMethod(project, "transferOwnership");
        await stubUtil.addMethod(project, "transferPrimary");
        await stubUtil.addMethod(projectLeaderTracker, "handleProjectPitch");
        await stubUtil.addMethod(activation, "activateProject");
        await projectFactoryHelper.handleNewProject(project.address, {from: accounts[0]});
      })

      after(async () => {
        await stubUtil.resetMethod(project, "transferOwnership");
        await stubUtil.resetMethod(project, "transferPrimary");
        await stubUtil.resetMethod(projectLeaderTracker, "handleProjectPitch");
        await stubUtil.resetMethod(activation, "activateProject");
      })

      it("transfers ownership to the voting contract", async () => {
        let { firstAddress } = await stubUtil.callHistory(project, "transferOwnership");
        assert.equal(firstAddress, voting.address, "should transfer ownership to the voting contract");
      })

      it("transfers primary to the activation contract", async () => {
        let { firstAddress } = await stubUtil.callHistory(project, "transferPrimary");
        assert.equal(firstAddress, activation.address, "should transfer primary to the activation contract");
      })

      it("records the new project in the project leader tracker", async () => {
        let { called } = await stubUtil.callHistory(projectLeaderTracker, "handleProjectPitch");
        assert(called, "should record that a new projet was pitched in the project leader tracker");
      })

      it("does not activate the project", async () => {
        let { called } = await stubUtil.callHistory(activation, "activateProject");
        assert(!called, "should not activate a project when capital is required");
      })
    })
    describe("when there is no capitalRequired", async () => {
      let project2;
      before(async () => {
         project2 = await ProjectStub.new(
           'more information',
           accounts[0],
           2000000,
           0,
           2000000,
           0,
           'cashflow',
           2,
           accounts[1]
         )

         await projectFactoryHelper.handleNewProject(project2.address);
       })
       it("transfers ownership to the voting contract", async () => {
         let { firstAddress } = await stubUtil.callHistory(project2, "transferOwnership");
         assert.equal(firstAddress, voting.address, "should transfer ownership to the voting contract");
       })

       it("transfers primary to the activation contract", async () => {
         let { firstAddress } = await stubUtil.callHistory(project2, "transferPrimary");
         assert.equal(firstAddress, activation.address, "should transfer primary to the activation contract");
       })

       it("records the new project in the project leader tracker", async () => {
         let { called } = await stubUtil.callHistory(projectLeaderTracker, "handleProjectPitch");
         assert(called, "should record that a new projet was pitched in the project leader tracker");
       })

       it("activates the project", async () => {
         let { firstAddress, firstUint } = await stubUtil.callHistory(activation, "activateProject");
         assert.equal(firstAddress, project2.address, "should activate the new project");
         assert.equal(firstUint, 0, "should activate the new project");
       })
    })
  })
})

const setUp = async () => {
  const votingToken = await VotingTokenStub.new();
  const activeToken = await ActiveTokenStub.new(votingToken.address);
  const inactiveToken = await InactiveTokenStub.new(votingToken.address, activeToken.address);
  projectLeaderTracker = await ProjectLeaderTrackerStub.new();
  activation = await ActivationStub.new(inactiveToken.address, projectLeaderTracker.address);
  voting = await VotingStub.new(votingToken.address, projectLeaderTracker.address, activation.address);
  projectFactoryHelper = await ProjectFactoryHelper.new(activation.address, voting.address, projectLeaderTracker.address);
};

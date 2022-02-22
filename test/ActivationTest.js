const VotingTokenStub = artifacts.require("VotingTokenStub");
const ActiveTokenStub = artifacts.require("ActiveTokenStub");
const InactiveTokenStub = artifacts.require("InactiveTokenStub");
const ProjectLeaderTrackerStub = artifacts.require("ProjectLeaderTrackerStub")
const GNITokenCrowdsaleStub = artifacts.require("GNITokenCrowdsaleStub");
const ProjectStub = artifacts.require("ProjectStub");
const ActivationMock = artifacts.require("ActivationMock");

const exceptions = require('./exceptions');
const stubUtil = require('./stubUtil');

let accounts;

let project;
let activation;
let crowdsale;
let inactiveToken;
let projectLeaderTracker;

contract("Activation", async (_accounts) => {
  accounts = _accounts;

  before(async () => {
    await setUp();
  })

  describe("tryActivateProject", async () => {
    describe("when there is a confirmed leader", async () => {
      before(async () => {
        await projectLeaderTracker.setTentativeLeader(project.address, true);
        await stubUtil.addMethod(activation, "activateProject");
      })

      describe("when there is enough capial to activate the project", async () => {
        before(async () => {
          await crowdsale.setWeiRaised(2000000);
          const addr = crowdsale.address
          await web3.eth.sendTransaction({from: accounts[1], to: addr, value: 2000000});
        })
        describe("when the project is still open", async () => {
          before(async () => {
            await project.setStubOpenStatus(true);
            await activation.tryActivateProject();
          })

          after(async () => {
            await crowdsale.setWeiRaised(2000000);
            const addr = crowdsale.address
            await web3.eth.sendTransaction({from: accounts[1], to: addr, value: 1700000});
            await stubUtil.resetMethod(activation, "activateProject");
          })

          it("activates the project", async () => {
            let { firstAddress, firstUint } = await stubUtil.callHistory(activation, "activateProject");
            assert.equal(firstAddress, project.address, "leading project should be activated");
            assert.equal(firstUint, 1700000, "should pass leading project captial required to activate project");
          })
        })
        describe("when the project has closed", async () => {
          before(async () => {
            await project.setStubOpenStatus(false);
          })

          after(async () => {
            project.setStubOpenStatus(true);
          })

          it("reverts", async () => {
            await exceptions.catchRevert(activation.tryActivateProject());
          })
        })
      })
      describe("when there is not enough capital to activate the project", async () => {
        before(async () => {
          await crowdsale.setWeiRaised(1600000);
        })

        after(async () => {
          crowdsale.setWeiRaised(2000000);
        })

        it("reverts", async () => {
          await exceptions.catchRevert(activation.tryActivateProject());
        })
      })
    })
    describe("when there is not a confirmed leader", async () => {
      before (async () => {
        await projectLeaderTracker.setTentativeLeader(project.address, false);
      })

      after(async () => {
        await projectLeaderTracker.setTentativeLeader(project.address, true);
      })
      it('reverts', async () => {
        await exceptions.catchRevert(activation.tryActivateProject());
      })
    })
  })

  describe("activateProject", async () => {
    describe("when the sender is the project factory", async () => {
      before(async () => {
        await activation.activateProject(project.address, 1700000);
      })

      it("activates the project", async () => {
        let { firstAddress, firstUint } = await stubUtil.callHistory(activation, "activateProject");
        assert.equal(firstAddress, project.address, "leading project should be activated");
        assert.equal(firstUint, 1700000, "should pass leading project captial required to activate project");
      })
    })
    describe("when sender is not the project factory", async () => {
      it("reverts", async () => {
        await exceptions.catchRevert(activation.activateProject(project.address, 1700000, {from: accounts[1]}));
      })
    })
  })

  describe("_activateProject", async () => {
    before(async () => {
      await stubUtil.addMethod(project, 'activate');
      await stubUtil.addMethod(projectLeaderTracker, 'handleProjectActivation');
      await stubUtil.addMethod(inactiveToken, 'increasePendingActivations');
      await stubUtil.addMethod(crowdsale, 'transferCapitalToDeveloper');
      await activation._activateProject_(project.address, 1700000);
    })

    it("activates the project", async () => {
      let { called } = await stubUtil.callHistory(project, 'activate');
      assert(called, "should activate the project");
    })

    it("handles the project activation in the projectLeaderTracker", async () => {
      let { called } = await stubUtil.callHistory(projectLeaderTracker, 'handleProjectActivation');
      assert(called, "should handle project activation in the projectLeaderTracker");
    })

    it("increases pending token activations", async () => {
      let { firstUint } = await stubUtil.callHistory(inactiveToken, 'increasePendingActivations');
      assert.equal(firstUint, 20000000, "should increase pending active tokens according to the tokens associated witht the activated project");
    })

    it("transfers capitalRequired to the developer", async () => {
      let { firstUint } = await stubUtil.callHistory(crowdsale, 'transferCapitalToDeveloper');
      assert.equal(firstUint, 1700000, "should transfer the capital required to the developer");
    })
  })
})

const setUp = async () => {
  const votingToken = await VotingTokenStub.new();
  const activeToken = await ActiveTokenStub.new(votingToken.address);
  inactiveToken = await InactiveTokenStub.new(votingToken.address, activeToken.address);
  crowdsale = await initCrowdsale();
  projectLeaderTracker = await ProjectLeaderTrackerStub.new();
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
  activation = await ActivationMock.new(inactiveToken.address, projectLeaderTracker.address);
  activation.setCrowdsale(crowdsale.address);
}

const initCrowdsale = async () => {
  const openingTime = await getLatestBlockTime();
  const doomsDay = openingTime + 86400 * 240;

  return await GNITokenCrowdsaleStub.new(
        openingTime,
        doomsDay,
        1,
        accounts[0],
        inactiveToken.address,
        accounts[1]
      );
};

const getLatestBlockTime = async () => {
  let time = await web3.eth.getBlock('latest');
  return time.timestamp;
};

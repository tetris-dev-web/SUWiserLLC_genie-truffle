const InactiveToken = artifacts.require("InactiveToken");
const ActiveToken = artifacts.require("ActiveToken");
const VotingToken = artifacts.require("VotingToken");
const GNITokenCrowdsale = artifacts.require("GNITokenCrowdsale");
const SeedableCrowdsale = artifacts.require("SeedableCrowdsale");
const GNITokenCrowdsaleMock = artifacts.require("GNITokenCrowdsaleMock");
const TokenPurchaseHelper = artifacts.require("TokenPurchaseHelper");
const Dividends = artifacts.require("Dividends");
const Reimbursements = artifacts.require("Reimbursements");
const ProjectFactory = artifacts.require("ProjectFactory");
const ProjectFactoryHelper = artifacts.require("ProjectFactoryHelper");
const ProjectLeaderTracker = artifacts.require("ProjectLeaderTracker");
const Voting = artifacts.require("Voting");
const Activation = artifacts.require("Activation");
const Project = artifacts.require("Project");
const { seed } = require('../seeds');

let activeTokenInstance;
let inactiveTokenInstance;
let votingTokenInstance;
let votingInstance;
let crowdsaleInstance;
let activationInstance;
let projectLeaderTrackerInst;
let projectFactoryInst;
let projectFactoryHelper;
let tokenPurchaseHelper;

module.exports = function (deployer, network, accounts) {
  console.log("NETWORK", network)
    const rate = 1;
    const developer = accounts[0];

    return deployer
        .then(() => {
          return deployer.deploy(
            ProjectLeaderTracker
          )
        })
        .then(() => {
          return deployer.deploy(
            VotingToken
          )
        })
        .then(() => {
          return deployer.deploy(
            ActiveToken,
            VotingToken.address
          )
        })
        .then(() => {
          return deployer.deploy(
            InactiveToken,
            VotingToken.address,
            ActiveToken.address
          )
        })
        .then(() => {
          return deployer.deploy(
            Dividends,
            ActiveToken.address
          );
        })
        .then(() => {
          return deployer.deploy(
            Reimbursements,
            InactiveToken.address
          )
        })
        .then(() => {
          return deployer.deploy(
            Activation,
            InactiveToken.address,
            ProjectLeaderTracker.address
          )
        })

        .then(() => {
          return deployer.deploy(
            Voting,
            VotingToken.address,
            ProjectLeaderTracker.address,
            Activation.address
          );
        })
        .then(() => { // establish start time variable
            return new Promise((resolve, reject) => {
                web3.eth.getBlock('latest', (err, time) => {
                    if (err) reject();
                    const openingTime = time.timestamp + 50;
                    resolve(openingTime);
                })
            })
        })
        .then((openingTime) => {
          const doomsDay = openingTime + 86400 * 240; // 240 days
          // const votingAddr = network === 'ropsten' ? SeedableVoting.address : Voting.address
          if (network === 'ropsten' || network === "development") {
            return deployer.deploy(
                SeedableCrowdsale,
                openingTime,
                doomsDay,
                rate,
                developer,
                InactiveToken.address,
                Reimbursements.address
                // votingAddr,
                // Activation.address
            );
          }
            return deployer.deploy(
                GNITokenCrowdsale,
                openingTime,
                doomsDay,
                rate,
                developer,
                InactiveToken.address,
                Reimbursements.address
            );
        })
        .then(() => {
          return deployer.deploy(
            TokenPurchaseHelper
          )
        })
        .then(() => {
          return network === 'ropsten' ?  SeedableCrowdsale.at(SeedableCrowdsale.address) : GNITokenCrowdsale.at(GNITokenCrowdsale.address);
        })
        .then(_crowdsaleInstance => {
          crowdsaleInstance = _crowdsaleInstance
          return crowdsaleInstance.addCoAmendment(TokenPurchaseHelper.address);
        })
        .then(() => {
          return crowdsaleInstance.addCoAmendment(ProjectLeaderTracker.address);
        })
        .then(() => {
          return crowdsaleInstance.addCoAmendment(Activation.address);
        })
        .then(() => {
          return crowdsaleInstance.addCoAmendment(Voting.address);
        })
        .then(() => {
          crowdsaleInstance.stopAddingCoAmendments();
        })
        .then(() => {
          return deployer.deploy(
            ProjectFactoryHelper,
            Activation.address,
            Voting.address,
            ProjectLeaderTracker.address
          );
        })
        .then(() => {
          return deployer.deploy(
            ProjectFactory,
            ProjectFactoryHelper.address,
            crowdsaleInstance.address,
            developer,
            Dividends.address
          );
        })
         //organize around seeding, ownership designation and contract instanciation / contract references
        //activation and voting will deploy after crowdsale
        .then(() => {
          return TokenPurchaseHelper.at(TokenPurchaseHelper.address);
        })
        .then((_tokenPurchaseHelper) => {
          tokenPurchaseHelper = _tokenPurchaseHelper;
          return tokenPurchaseHelper.transferOwnership(crowdsaleInstance.address);
        })
        .then(() => {
          return ProjectFactory.at(ProjectFactory.address);
        })
        .then(_projectFactoryInst => {
          projectFactoryInst = _projectFactoryInst;
          return projectFactoryInst.transferCrowdsaleKey(crowdsaleInstance.address);
        })
        .then(() => {
          return projectFactoryHelper = ProjectFactoryHelper.at(ProjectFactoryHelper.address);
        })
        .then(() => {
          return projectFactoryHelper.transferOwnership(projectFactoryInst.address);
        })
        .then(() => {
          return crowdsaleInstance.transferProjectFactoryKey(projectFactoryInst.address);
        })
        .then(() => {
          return ActiveToken.at(ActiveToken.address);
        })
        .then(_activeTokenInstance => {
          activeTokenInstance = _activeTokenInstance;
          return activeTokenInstance.setDividendWallet(Dividends.address);
        })
        .then(() => {
          return activeTokenInstance.setMinter(InactiveToken.address);
        })
        .then(() => {
          // return network === 'ropsten' ? SeedableVoting.at(SeedableVoting.address) : Voting.at(Voting.address);
          return Voting.at(Voting.address);
        })
        .then(_votingInstance => {
          votingInstance = _votingInstance;
          return votingInstance.setCrowdsale(crowdsaleInstance.address);
        })
        .then(() => {
          return ProjectLeaderTracker.at(ProjectLeaderTracker.address);
        })
        .then(_projectLeaderTrackerInst => {
          projectLeaderTrackerInst = _projectLeaderTrackerInst;
          return projectLeaderTrackerInst.transferCrowdsaleKey(projectFactoryHelper.address);
        })
        .then(() => {
          console.log("pfh", projectFactoryHelper.address)
          return projectLeaderTrackerInst.transferProjectFactoryKey(projectFactoryHelper.address);
        })
        .then(() => {
          return Activation.at(Activation.address)
        })
        .then(_activationInstance => {
          activationInstance = _activationInstance;
          return activationInstance.setCrowdsale(crowdsaleInstance.address);
        })
        .then(() => {
          return activationInstance.transferProjectFactoryKey(projectFactoryHelper.address);
        })
        .then(() => {
          return projectLeaderTrackerInst.transferActivationKey(activationInstance.address)
        })
        .then(() => {
          console.log("getting inactive token inst")
          return InactiveToken.at(InactiveToken.address);
        })
        .then(_inactiveTokenInstance => {
          console.log("setting inactive token inst")
          return inactiveTokenInstance = _inactiveTokenInstance;
        })
        .then(() => {
          console.log("setting inactive token crowdsale key")
          return inactiveTokenInstance.transferCrowdsaleKey(crowdsaleInstance.address);
        })
        .then(() => {
          console.log("setting inactive token activation key")
          return inactiveTokenInstance.transferActivationKey(activationInstance.address);
        })
        .then(() => {
          console.log("getting voting token inst")
          return VotingToken.at(VotingToken.address);
        })
        .then(_votingTokenInstace => {
          console.log("setting voting token inst")
          votingTokenInstance = _votingTokenInstace;
          return votingTokenInstance.transferVotingKey(Voting.address);
        })
        .then(() => {
          console.log("setting voting token active token")
          return votingTokenInstance.setActiveToken(activeTokenInstance.address);
        })
        .then(() => {
          console.log("setting voting token inactive token")
          return votingTokenInstance.setInactiveToken(inactiveTokenInstance.address);
        })
        .then(() => {
          console.log("getting reimbursements")
          return Reimbursements.at(Reimbursements.address);
        })
        .then(reimbursementsInst => {
          console.log("setting reimbursements")
          return reimbursementsInst.transferCrowdsaleKey(crowdsaleInstance.address);
        })
        .then(() => {
          if (network === 'ropsten' || network === "development" ) {
            console.log("WE MADE IT!!!");
            // console.log("voting", votingInstance)
            return seed(crowdsaleInstance, projectFactoryInst, inactiveTokenInstance, votingInstance, Project, developer, accounts[1], accounts[2]);
          }
        })

};
// .then(() => {
//   investorListInst = InvestorList.at(InvestorList.address);
//   return investorListInst.transferOwnership(GNITokenCrowdsale.address);
// })
// .then(() => {
//   return investorListInst.transferPrimary(Token.address);
// })
// console.log('DEVELOPER', developer);
// console.log('OPENING TIME', openingTime);
// console.log('DOOMS DAY', doomsDay);
// console.log('RATE', rate);
// console.log('DIVIDENDS', Dividends.address);
// console.log("TOKEN", Token.address);
// console.log("INVESTOR LIST", InvestorList.address);

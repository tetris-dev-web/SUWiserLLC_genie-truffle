const ProjectFactory = artifacts.require("ProjectFactory");
const InactiveToken = artifacts.require("InactiveToken");
const SeedableCrowdsale = artifacts.require("SeedableCrowdsale");
const Voting = artifacts.require("Voting");
const { getProjectAddresses } = require('./util');


module.exports = async () => {
  const createTokenPurchases = async () => {
    const createTokenPurchase = async (address, weiAmount) => {
      await crowdsale.seedTokens({from: address, value: weiAmount});
    }
    
    await createTokenPurchase(account, 200);
    console.log('purchase 1 complete')
    await createTokenPurchase(account, 200);
    console.log('purchase 2 complete')
    await createTokenPurchase(account, 300);
    console.log('purchase 2 complete')
    await createTokenPurchase(account, 500);
    console.log('purchase 2 complete')
    await createTokenPurchase(account, 200);
    console.log('purchase 2 complete')

  }

  const createVotes = async () => {
    const castVote = async (projectAddress, voteAmount) => {
      await voting.voteForProject(projectAddress, voteAmount, {from: account});
    }

    await castVote(projAddrs[1], 50);
    console.log('vote 1 complete')
    await castVote(projAddrs[2], 70);
    await castVote(projAddrs[3], 70);
    await castVote(projAddrs[4], 30);
    await castVote(projAddrs[5], 30);
    await castVote(projAddrs[6], 20);
    await castVote(projAddrs[7], 60);
    await castVote(projAddrs[8], 80);
    await castVote(projAddrs[9], 40);
    console.log('vote 9 complete');
  }

  const account = web3.currentProvider.addresses[0];
  const projectFactory = await ProjectFactory.deployed();
  const token = await InactiveToken.deployed();
  const crowdsale = await SeedableCrowdsale.deployed();
  const voting = await Voting.deployed();

  const projAddrs = await getProjectAddresses(projectFactory);
  console.log("PROJECT ADDRESSES:", projAddrs);
  await createTokenPurchases();
  console.log("BUYS COMPLETE")
  await createVotes();
  console.log("VOTES COMPLETE")
  return null;
}

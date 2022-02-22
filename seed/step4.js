const Project = artifacts.require("Project");
const ProjectFactory = artifacts.require("ProjectFactory");
const { getProjectAddresses } = require('./util');

module.exports = async () => {
  const createCashFlows = async () => {
    const project = await Project.at(projAddrs[2]);
    await project.deposit({from: developer, value: 50000})
    console.log('deposit 1 complete')
    await project.deposit({from: developer, value: 40000})
    console.log('deposit 2 complete')
    await project.deposit({from: developer, value: 30000})
    console.log('deposit 3 complete')
    await project.deposit({from: developer, value: 60000})
    console.log('deposit 4 complete')
    await project.deposit({from: developer, value: 20000})
    console.log('deposit 5 complete')
  }

  const developer = web3.currentProvider.addresses[0];
  const projectFactory = await ProjectFactory.deployed();
  const projAddrs = await getProjectAddresses(projectFactory);
  await createCashFlows();
  return null;
}

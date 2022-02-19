const getProjectAddresses = async (projectFactory) => {
  const totalProjectCount = await projectFactory.totalProjectCount();
  const pendingAddrs = [];

  for (let i = 1; i <= totalProjectCount; i++) {
    const pendingAddr = projectFactory.projectById(i);
    pendingAddrs.push(pendingAddr);
  }

  return Promise.all(pendingAddrs);
};

module.exports = {
  getProjectAddresses,
};

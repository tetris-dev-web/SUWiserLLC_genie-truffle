const ProjectFactory = artifacts.require('ProjectFactory');
const { sampleCashflow } = require('./sampleCashflow/sampleCashflow');
// const projectFactory = await ProjectFactory.deployed();

//for creating projects as the developer

// integrate second model and business plan for Genus

module.exports = async () => {
  const developer = web3.currentProvider.addresses[0];
  const projectFactory = await ProjectFactory.deployed();

  const createProjects = async () => {
    const createProject = async (title, capitalRequired, valuation, lat, lng, id) => {
      const description =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
      const busLink = 'https://drive.google.com/open?id=1zxY4cZcdaAMpinQpdZmTb8Zy2i9dh2iZ';
      const model_id = '7syizSLPN60';
      const projectInfo = JSON.stringify({
        title,
        description,
        busLink,
        model_id,
        lat,
        lng,
      });
      const cashflow = JSON.stringify(sampleCashflow);

      await projectFactory.createProject(projectInfo, valuation, capitalRequired, cashflow, {
        from: developer,
      });

      return await projectFactory.projectById.call(id);
    };

    // values in wei

    const projAddr1 = await createProject('HamInn', 0, 700, '40.818001', '-74.0060', 1);
    console.log('p1', projAddr1);
    // console.log(Project.at(projAddr1))
    const projAddr2 = await createProject('PR Beach Villa', 250, 400, '18.3128', '-65.0060', 2);
    const projAddr3 = await createProject('Co-op in Goergia', 180, 350, '41.7128', '44.7060', 3);
    const projAddr4 = await createProject(
      'Penn Student Housing',
      300,
      800,
      '39.970031',
      '-75.168550',
      4,
    );
    console.log('p4', projAddr4);
    const projAddr5 = await createProject(
      "Steven's Business Incubator",
      400,
      1000,
      '40.618001',
      '-74.1060',
      5,
    );
    const projAddr6 = await createProject("Liam's Lounge", 600, 800, '-23.18001', '-46.1060', 6);
    const projAddr7 = await createProject(
      'Philly Artist Loft',
      500,
      700,
      '39.960031',
      '-75.128550',
      7,
    );
    const projAddr8 = await createProject("Kyle's Kale Farm", 300, 700, '40.918001', '-74.1060', 8);
    const projAddr9 = await createProject(
      'Columbia Generator',
      500,
      800,
      '40.638001',
      '-74.1060',
      9,
    );
    const projAddr10 = await createProject(
      'Brazil Fitness Complex',
      500,
      800,
      '-23.18001',
      '-46.4060',
      10,
    );
  };

  await createProjects();
  return null;
};

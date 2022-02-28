const { web3, dotenv } = require('../server/chain_connection/web3_configuration');

const seed = async (
  _crowdsale,
  _projectFactory,
  _token,
  _voting,
  _projectContract,
  _developer,
  _account1,
  _account2,
) => {
  const crowdsale = _crowdsale;
  const projectFactory = _projectFactory;
  const token = _token;
  const voting = _voting;
  const developer = _developer;
  const account1 = _account1; //add ether to these to differentiate
  const account2 = _account2;

  let projAddr1;
  let projAddr2;
  let projAddr3;
  let projAddr4;
  let projAddr5;
  let projAddr6;

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

    projAddr1 = await createProject('HamInn', 0, 900, '40.7128', '-74.0060', 1);
    console.log('p1', projAddr1);
    // console.log(Project.at(projAddr1))
    projAddr2 = await createProject("Matt's Mansion", 200, 800, '40.7128', '-74.0060', 2);
    console.log('p2', projAddr2);
    projAddr3 = await createProject("Steven's Skyscraper", 400, 1000, '41.9028', '12.4964', 3);
    console.log('p3', projAddr3);
    projAddr4 = await createProject("Liam's Lounge", 600, 800, '31.2304', '121.4737', 4);
    console.log('p4', projAddr4);
    projAddr5 = await createProject("Ryan's Rooftop", 500, 700, '5.6037', '-0.1870', 5);
    console.log('p5', projAddr5);
    projAddr6 = await createProject("Kyle's Kale Farm", 300, 700, '41.9028', '12.4964', 6);
    console.log('p6', projAddr6);
  };

  const createTokenPurchases = async () => {
    const createTokenPurchase = async (address, weiAmount) => {
      await crowdsale.seedTokens({ from: address, value: weiAmount });
    };

    await createTokenPurchase(developer, 200);
    await createTokenPurchase(developer, 100);
    await createTokenPurchase(developer, 100);
    await createTokenPurchase(developer, 100);
  };

  const createVotes = async () => {
    const castVote = async (projectAddress, voteAmount) => {
      await voting.voteForProject(projectAddress, voteAmount, { from: developer });
    };

    await castVote(projAddr2, 50);
    await castVote(projAddr3, 70);
    await castVote(projAddr5, 50);
    await castVote(projAddr6, 60);
    await castVote(projAddr4, 40);
  };

  const activateTokens = async () => {
    await token.activatePending(developer);
  };

  const createCashFlows = async () => {
    const project = await _projectContract.at(projAddr3);
    await project.deposit({ from: developer, value: 50000 });
    await project.deposit({ from: developer, value: 40000 });
    await project.deposit({ from: developer, value: 30000 });
    await project.deposit({ from: developer, value: 60000 });
    await project.deposit({ from: developer, value: 20000 });
  };

  await createProjects();
  console.log('PITCHES COMPLETE');
  await createTokenPurchases();
  console.log('BUYS COMPLETE');
  await createVotes();
  console.log('VOTES COMPLETE');
  await activateTokens();
  console.log('TOKENS ACTIVATED');
  await createCashFlows();
};

const sampleCashflow = {
  1: {
    cashFlow: -50000,
    isActuals: true,
  },
  2: {
    cashFlow: -40018,
    isActuals: true,
  },
  3: {
    cashFlow: -16857,
    isActuals: true,
  },
  4: {
    cashFlow: -2915,
    isActuals: true,
  },
  5: {
    cashFlow: -20325,
    isActuals: true,
  },
  6: {
    cashFlow: 7864,
    isActuals: true,
  },
  7: {
    cashFlow: 25360,
    isActuals: true,
  },
  8: {
    cashFlow: 28107,
    isActuals: true,
  },
  9: {
    cashFlow: 28942,
    isActuals: false,
  },
  10: {
    cashFlow: 28696,
    isActuals: false,
  },
  11: {
    cashFlow: 29356,
    isActuals: false,
  },
  12: {
    cashFlow: 28854,
    isActuals: false,
  },
  13: {
    cashFlow: 28588,
    isActuals: false,
  },
  14: {
    cashFlow: 30781,
    isActuals: false,
  },
  15: {
    cashFlow: 29081,
    isActuals: false,
  },
  16: {
    cashFlow: 31887,
    isActuals: false,
  },
  17: {
    cashFlow: 51887,
    isActuals: false,
  },
  18: {
    cashFlow: 71887,
    isActuals: false,
  },
  19: {
    cashFlow: 30339,
    isActuals: false,
  },
  20: {
    cashFlow: 30718,
    isActuals: false,
  },
  21: {
    cashFlow: 31102,
    isActuals: false,
  },
  22: {
    cashFlow: 31491,
    isActuals: false,
  },
  23: {
    cashFlow: 31885,
    isActuals: false,
  },
  24: {
    cashFlow: 32283,
    isActuals: false,
  },
  25: {
    cashFlow: 32687,
    isActuals: false,
  },
  26: {
    cashFlow: 33096,
    isActuals: false,
  },
  27: {
    cashFlow: 33509,
    isActuals: false,
  },
  28: {
    cashFlow: 33928,
    isActuals: false,
  },
};

module.exports = {
  seed,
};

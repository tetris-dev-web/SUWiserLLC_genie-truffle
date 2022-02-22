var dotenv = require('dotenv');
dotenv.config();

const Web3 = require('web3');
const web3 = new Web3("https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);

module.exports = {
  web3,
  dotenv
};

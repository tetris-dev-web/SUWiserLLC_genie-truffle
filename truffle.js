/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();

let privateKeys = [];
if (process.env.DEPLOY_ENV == 'ganache') {
  privateKeys = [
    process.env.PRIVATE_KEY_GANACHE,
    process.env.PRIVATE_KEY_GANACHE1,
    process.env.PRIVATE_KEY_GANACHE2
  ]
} else {
  privateKeys = [
    process.env.PRIVATE_KEY,
    process.env.PRIVATE_KEY1,
    process.env.PRIVATE_KEY2
  ]
}

//
// var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  compilers: {
    solc: {
      version: "0.4.25"
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gasLimit: 10000000
    },
    //developer
    ropsten: {
       provider: () => new HDWalletProvider(privateKeys, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY, 0),
       network_id: 3,
       gas: 4500000,
       gasPrice: 10000000000
    },
    //investors
    seedInvestor1: {
      provider: () => new HDWalletProvider(privateKeys, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY, 1),
      network_id: 3,
      gas: 4500000,
      gasPrice: 10000000000
    },
    seedInvestor2: {
      provider: () => new HDWalletProvider(privateKeys, "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY, 2),
      network_id: 3,
      gas: 4500000,
      gasPrice: 10000000000
    },
    solc: {
      optimizer: {
          enabled: true,
          runs: 200,
      },
    }
  },

};

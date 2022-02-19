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
const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();
// Jubin
const privateKeys = [process.env.PRIVATE_KEY4, process.env.PRIVATE_KEY5, process.env.PRIVATE_KEY3];

// Serge
// const privateKeys = ['1ac9ad9dbcfc704ce14e49824d8bfb845cf22e13e5271e2aea45629639ce29e3', '13f7bb9ea9054234f445553206d391da43bdef7ad4e03a4b416645e8b0d687de'];

// Ganache
// const privateKeys = ['95d2cf2ef892f30be777528c98cab397453d7db5a959260398599c2a70238122', '310948eca043f98d74599bc4dfc66f482db88901e011e8b69df3816e0a889621', 'c449e9780ad827c750ecb94ad6e552b950be5f682171d77ed1f41218a1f140b5'];

module.exports = {
  networks: {
		development: {
			host: "127.0.0.1",
			port: 7545,
			network_id: "5777",
			gas: 4600000
		},
    ropsten: {
      provider: () => {
        return new HDWalletProvider(
          privateKeys,
          "https://ropsten.infura.io/v3/" + process.env.INFURA_PROJECT_ID,
          0,
          1
        );
      },
      network_id: 3, // Ropsten's id
      gas: 4500000, // Ropsten has a lower block limit than mainnet
      gasPrice: 10000000000,      
      skipDryRun: true
    }
  },
  plugins: [
    'truffle-contract-size'
  ]  
};
// module.exports = {
//   // See <http://truffleframework.com/docs/advanced/configuration>
//   // to customize your Truffle configuration!

//   compilers: {
//     solc: {
//       version: '0.4.25',
//     },
//   },
//   networks: {
//     development: {
//       host: 'localhost',
//       port: 8545,
//       network_id: '*', // Match any network id
//       gasLimit: 10000000,
//     },
//     //developer
//     ropsten: {
//       provider: () =>
//         new HDWalletProvider(
//           privateKeys,
//           'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY,
//           0,
//         ),
//       network_id: 3,
//       gas: 4500000,
//       gasPrice: 10000000000,
//     },
//     //investors
//     seedInvestor1: {
//       provider: () =>
//         new HDWalletProvider(
//           privateKeys,
//           'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY,
//           1,
//         ),
//       network_id: 3,
//       gas: 4500000,
//       gasPrice: 10000000000,
//     },
//     seedInvestor2: {
//       provider: () =>
//         new HDWalletProvider(
//           privateKeys,
//           'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY,
//           2,
//         ),
//       network_id: 3,
//       gas: 4500000,
//       gasPrice: 10000000000,
//     },
//     solc: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//     },
//   },
// };

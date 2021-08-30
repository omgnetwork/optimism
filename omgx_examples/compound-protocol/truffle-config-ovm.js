require('dotenv').config();
const env = process.env;
const deployerPrivateKey = env.deployerPrivateKey
const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  contracts_build_directory: './build-ovm',
  networks: {
    local_l2: {
      provider: function () {
        return new HDWalletProvider({
          privateKeys: [deployerPrivateKey],
          providerOrUrl: 'http://127.0.0.1:8545',
        })
      },
      network_id: 31338,
      host: '127.0.0.1',
      port: 8545,
      gasPrice: 15000000,
      gas: 803900000,
    },
    boba_rinkeby: {
      provider: function () {
        return new HDWalletProvider({
          privateKeys: [deployerPrivateKey],
          providerOrUrl: 'https://rinkeby.boba.network',
        })
      },
      network_id: 28,
      host: 'https://rinkeby.boba.network',
      gasPrice: 15000000,
      gas: 156170127,
    },
  },
  compilers: {
    solc: {
      version: 'node_modules/@eth-optimism/solc',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1,
        },
      },
    },
  },
}
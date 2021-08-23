

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const env = process.env;
const mnemonicPhrase = env.mnemonic;


module.exports = {
  contracts_build_directory: './build-ovm',
  networks: {
    optimism: {
      provider: function () {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonicPhrase,
          },
          providerOrUrl: 'http://127.0.0.1:8545',
        })
      },
      network_id: 28,
      host: '127.0.0.1',
      port: 8545,
      gasPrice: 15000000,
      gas: 54190000,
    },
    omgx_rinkeby: {
      provider: function () {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonicPhrase,
          },
          providerOrUrl:env.L2_NODE_WEB3_URL,
        })
      },
      network_id: 28,
      host: env.L2_NODE_WEB3_URL,
      gasPrice: 15000000,
      gas: 8000000,
    },
  },
  compilers: {
    solc: {
      version: '../../node_modules/@eth-optimism/solc',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1,
        },
      },
    },
  },
}

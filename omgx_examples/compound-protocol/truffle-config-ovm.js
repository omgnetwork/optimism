const mnemonicPhrase =
  'test test test test test test test test test test test junk'
const HDWalletProvider = require('@truffle/hdwallet-provider')

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
      gas: 803900000,
    },
    omgx_rinkeby: {
      provider: function () {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonicPhrase,
          },
          providerOrUrl: 'http://rinkeby.boba.network',
        })
      },
      network_id: 28,
      host: 'rinkeby.boba.network',
      gasPrice: 0,
      gas: 54180127,
    },
    L1: {
      provider: function () {
        return new HDWalletProvider({
          mnemonic: {
            phrase: mnemonicPhrase,
          },
          providerOrUrl: 'http://127.0.0.1:9545',
        })
      },
      network_id: 31337,
      host: '127.0.0.1',
      port: 9545,
      gasPrice: 15000000,
      gas: 803900000,
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

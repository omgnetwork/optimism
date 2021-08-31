/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require("@truffle/hdwallet-provider");

require('dotenv').config();

const env = process.env;

const pk_0 = env.pk_0
const pk_1 = env.pk_1
const pk_2 = env.pk_2

console.log(env)

module.exports = {

  contracts_build_directory: ".build-ovm",

  networks: {
    local_l2: {
      provider: function () {
        return new HDWalletProvider({
          privateKeys: [ pk_0, pk_1, pk_2 ],
          providerOrUrl: 'http://127.0.0.1:8545',
        })
      },
      network_id: 31338,
      host: '127.0.0.1',
      port: 8545,
      gasPrice: 15000000,
      gas: 50000000,
    },
    rinkeby_l2: {
      provider: function () {
        return new HDWalletProvider({
          privateKeys: [ pk_0, pk_1, pk_2 ],
          providerOrUrl: 'https://rinkeby.boba.network',
          //start at address_index 0 and load all three addresses
          addressIndex: 0,
          numberOfAddresses: 1
        })
      },
      network_id: 28,
      host: 'https://rinkeby.boba.network',
      gasPrice: 15000000,
      gas: 156170127,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: 'node_modules/@eth-optimism/solc',
      settings: {
        optimizer: {
          enabled: true,
          runs: 1
        },
      }
    }
  }

}

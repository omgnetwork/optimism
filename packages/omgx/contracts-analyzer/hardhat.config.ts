import { HardhatUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@eth-optimism/hardhat-ovm'

const config: HardhatUserConfig = {
  mocha: {
    timeout: 60000,
  },
  networks: {
    omgx: {
      url: 'http://localhost:8545',
      // This sets the gas price to 0 for all transactions on L2. We do this
      // because account balances are not automatically initiated with an ETH
      // balance.
      gasPrice: 0,
      ovm: true,
    },
    rinkeby: {
      url: "https://rinkeby.omgx.network",
      chainId: 28,
      gasPrice: 0,
      ovm: true,
    },
    local: {
      url: "http://localhost:8545",
      chainId: 28,
      gasPrice: 0,
      ovm: true,
      accounts: {
        mnemonic:"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
      }
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
          }
        }
      },
    ],

  },
  ovm: {
    solcVersion: '0.6.12',
  },
}

export default config



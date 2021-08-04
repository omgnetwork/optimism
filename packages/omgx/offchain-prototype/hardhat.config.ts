import { HardhatUserConfig } from 'hardhat/types'

// Hardhat plugins
import '@nomiclabs/hardhat-ethers'
import '@eth-optimism/hardhat-ovm'

const config: HardhatUserConfig = {
  mocha: {
    timeout: 300000,
  },
  networks: {
    omgx: {
      url: 'http://localhost:8545',
      ovm: true,
    },
    l1: {
      url: 'http://localhost:9545',
      ovm: false,
   },
  },
  solidity: '0.7.6',
  ovm: {
    solcVersion: '0.7.6',
  },
}

export default config

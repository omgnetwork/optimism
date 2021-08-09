import { HardhatUserConfig } from 'hardhat/types'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@eth-optimism/hardhat-ovm'
import './tasks/deploy'
require('dotenv').config

const config: HardhatUserConfig = {
  mocha: {
    timeout: 300000,
  },
  networks: {
    optimism: {
      url: 'https://integration.omgx.network:8081',
      gasPrice: 1000000008,
      saveDeployments: false,
      ovm: true,
      // gas: 9000000000,
      accounts: ['0x72d4661f26f9c837d179558ef6b079d021cd0f91cc0ac557870eec14ac12783e']
    },
    localhost: {
      url: "https://integration.omgx.network:8081",
      allowUnlimitedContractSize: true,
      gasPrice: 1000000008,
      timeout: 1800000,
      // gas: 9000000000,
      accounts: ['0x72d4661f26f9c837d179558ef6b079d021cd0f91cc0ac557870eec14ac12783e'],
      ovm: true
    },
  },
  solidity: '0.7.6',
  ovm: {
    solcVersion: '0.7.6',
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}

export default config
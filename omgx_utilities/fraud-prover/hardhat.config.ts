import { HardhatUserConfig } from 'hardhat/types'

// Hardhat plugins
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import '@typechain/hardhat'
import '@eth-optimism/hardhat-ovm'

const config: HardhatUserConfig = {
  mocha: {
    timeout: 300000,
  },
  networks: {
    omgx: {
      url: 'http://localhost:8545', //never is actually used - set by the .env
      accounts: [
        "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1", 
        "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd", 
        "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd"
        //this last one evaluates to 
        //0xbDA5747bFD65F08deb54cb465eB87D40e51B197E
        //which is set in the docer-compose as the fraud_submitter
      ],
      // This sets the gas price to 0 for all transactions on L2. We do this
      // because account balances are not automatically initiated with an ETH
      // balance.
      gasPrice: 0,
      ovm: true,
    },
  },
  solidity: '0.7.6',
  ovm: {
    solcVersion: '0.7.6',
  },
}

export default config
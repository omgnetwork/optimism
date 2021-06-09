- [The Contracts Analyzer](#the-contract-analyzer)
  * [Prerequisites](#prerequisites)
  * [Setting Up](#setting-up)
  * [Add Contracts](#add-contracts)
  * [Notes](#notes)
  * [Deploying Contracts to local test system or to OMGX Rinkeby](#deploying-contracts-to-local-test-system-or-to-omgx-rinkeby)
  * [Test](#test)

# The Contracts Analyzer

This repo is used to analyze contracts written for L1, as a starting point for evaluating potential code changes needed to deploy them to L2.

## Prerequisites

Please make sure you've installed:

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable)

## Setting Up

Please clone and cd to [this repository](https://github.com/enyalabs/contracts-analyzer):

```bash

git clone https://github.com/enyalabs/omgx_contracts-analyzer.git
cd omgx_contracts-analyzer

```

Set up the project by running:

```bash

yarn install

```

## Add Contracts

Copy your contracts into `/contracts` and run:

```bash

yarn build #build the smart contracts with optimistic solc
yarn analyze

```

You will probably have to `yarn add` multiple packages, and change/update pragmas, such as, to `pragma solidity 0.6.12;`

## Notes

The code compliles the contracts, which will typically provide extensive debug information and warnings/errors, and also checks for contract size and inline assembly. The second contract size check is superfluous, since the compiler already does that.

## Deploying Contracts to local test system or to OMGX Rinkeby

First, provide your Infura key, if needed, in `scripts/deployRinkeby.js`:

```javascript

//Update these to fit your deployment
const network = 'rinkeby';
const deployPrivateKey = "0x754fde3f5e60ef2c7649061e06957c29017fe21032a8017132c0078e37f6193a"

...

let deployConfig = {
  local: {
    l1RpcUrl: 'http://localhost:9545/',
    l2RpcUrl: 'http://localhost:8545',
    l1MessengerAddress: '0xA6404B184Ad3f6F41b6472f02ba45f25C6A66d49',
    l1ETHAddress: '0x4F53A01556Dc6f120db9a1b4caE786D5f0b5792C',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007',
    l2ETHAddress: '0x4200000000000000000000000000000000000006',
  },
  rinkeby: {
    l1RpcUrl: 'https://rinkeby.infura.io/v3/YOUR_INFURA_KEY_HERE', //CHANGE HERE
    l2RpcUrl: 'http://3.85.224.26:8545',
    l1MessengerAddress: '0x07A5992d8bE8c271B3baa5320975b6E8d8816e34',
    l1ETHAddress: '0xBa67f68C956178CB7fd1c882f9B882487Fa28898',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007',
    l2ETHAddress: '0x4200000000000000000000000000000000000006',
  }
}

```

Then, deploy:

```bash

yarn deploy:local #may need additional configuration in /scripts/deployLocal.js
  # or...
yarn deploy:rinkeby #may need additional configuration in /scripts/deployRinkeby.js

```

## Test

Create a `.env` file in the root directory of this project. Add environment-specific variables on new lines in the form of `NAME=VALUE`, for example, 

```
NETWORK = http://localhost:8545
TEST_PRIVATE_KEY_1 = 0xd2ab07f7c10ac88d5f86f1b4c1035d5195e81f27dbe62ad65e59cbf88205629b
TEST_PRIVATE_KEY_2 = 0x754fde3f5e60ef2c7649061e06957c29017fe21032a8017132c0078e37f6193a
TEST_PRIVATE_KEY_3 = 0xea8b000efb33c49d819e8d6452f681eed55cdf7de47d655887fc0e318906f2e7
TEST_PRIVATE_KEY_4 = 0x5b1c2653250e5c580dcb4e51c2944455e144c57ebd6a0645bd359d2e69ca0f0c
TEST_PRIVATE_KEY_5 = 0xea8b000efb33c49d819e8d6452f681eed55cdf7de47d655887fc0e318906f2e7
```

# OMGX Smart Contracts


## 0. Fully Automatic contract deployment and serving

This spins up the entire stack, with all contracts deployed, and all the right things needed for the wallet to function, and for development work on the wallet.

```bash

$ cd ops 
$ ./up_local.sh

```

**Note - please provide syntax for setting the .env variables (BUILD: 1, DAEMON: 1)**

To get the contract addresses:

```bash

curl http://127.0.0.1:8078/addresses.json | jq
curl http://127.0.0.1:8080/addresses.json | jq

```

## 2. Manual Deployment and Testing

* Spin up the base local L1/L2:

```

$ cd ops
$ docker-compose up -V

```

Create a `.env` file in the root directory of the contracts folder. Add environment-specific variables on new lines in the form of `NAME=VALUE`. Examples are given in the `.env.example` file. Just pick which net you want to work on and copy either the "Rinkeby" _or_ the "Local" envs to your `.env`.

```bash

# Local
NODE_ENV=local
L1_NODE_WEB3_URL=http://localhost:9545
L2_NODE_WEB3_URL=http://localhost:8545
ETH1_ADDRESS_RESOLVER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
TEST_PRIVATE_KEY_1=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
TEST_PRIVATE_KEY_2=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
TEST_PRIVATE_KEY_3=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
TARGET_GAS_LIMIT=9000000000
CHAIN_ID=28

```

Now, build and deploy all the needed contracts:

```bash

$ yarn build
$ yarn deploy

```

You will now see this, if everything worked correctly:

```bash

% yarn deploy
yarn run v1.22.10
$ ts-node "./bin/deploy.ts"
Starting wallet deploy...
ADDRESS_MANAGER_ADDRESS was set to 0x5FbDB2315678afecb367f032d93F642f64180aa3
Nothing to compile
Deploying...
🌕 L2LiquidityPool deployed to: 0xbdEd0D2bf404bdcBa897a74E6657f1f12e5C6fb6
🌕 L1LiquidityPool deployed to: 0x2910E325cf29dd912E3476B61ef12F49cb931096
⭐️ L1 LP initialized: 0x38b958f812d3c039a4516d504f4158288157e20288e2035d5bfa22676785de31
⭐️ L2 LP initialized: 0x0eb0870b2b03415da4b3d8d52085b4db8c3435e43660ba98e7dbe33005edde32
L1 and L2 pools have registered ETH and OETH
🌕 L2TokenPool deployed to: 0x93C7a6D00849c44Ef3E92E95DCEFfccd447909Ae
!!! L2TokenPool was not registered because L2ERC20 was not deployed
🌕 AtomicSwap deployed to: 0x71a9d115E322467147391c4a71D85F8e1cA623EF
🌕 L1 Message deployed to: 0x71a9d115E322467147391c4a71D85F8e1cA623EF
🌕 L2 Message deployed to: 0x78e6B135B2A7f63b281C80e2ff639Eed32E2a81b
⭐️ L1 Message initialized: 0xfa1a5083bebaeb39c41390a75181a27467516ba0c92788fbdf85b0710c45004f
⭐️ L2 Message initialized: 0x16cbfe8b4c095b15c13173346896c8a15f5c100195181f8dcd96e3b544f8dd87
✨ Done in 5.10s.

```

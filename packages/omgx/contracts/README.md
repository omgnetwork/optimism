# OMGX Web Wallet, Related Smart Contracts, and Integration Tests

## New Wallet contract changes

There is now a completely different system for spinning up the system and contracts needed for the wallet.

* Spin up the test system and deploy all the right wallet contracts:

```bash
- name: Bring the stack up + OMGX
working-directory: ./ops
env:
  BUILD: 1
  DAEMON: 1
run: ./up_local.sh
```

NOTE - the `up_local.sh` taps into ethereumoptimism dockers, be advised.

To get the contract addresses:

```bash
curl http://127.0.0.1:8078/addresses.json | jq
curl http://127.0.0.1:8080/addresses.json | jq
```

**ALERT - the old testing system and the documention below are currently broken, but are being fixed.**

# Working Steps for local setup.
## 1. Set up the repo

At the top level (`/optimism`), run `yarn` and `yarn build`.

```bash
$ git clone git@github.com:omgnetwork/optimism.git
$ cd optimism
$ yarn
$ yarn build
```

## 2. Spin up OMGX

```bash

$ cd /ops
$ DAEMON=0 BUILD=1 ./up_local.sh

```

 Or, Spin up the test system and deploy all the right wallet contracts:

```bash

$ cd ops
$ docker-compose -f docker-compose.yml -f docker-compose-omgx-services.yml up

```

## 3. Basic Setup and Configuration - Contracts

Next, open a *second* terminal window and navigate to the wallet folder:

```bash
$ cd /optimism/packages/omgx/wallet
```

Create a `.env` file in the root directory `/optimism/packages/omgx/wallet` of this wallet project. 
Add environment-specific variables on new lines in the form of `NAME=VALUE`.
Examples are given in the `.env.example` file. 
Just pick which net you want to work on and copy either the "Rinkeby" _or_ the "Local" envs to your `.env`.
Or, use below env params. Now, build and deploy all the needed contracts from wallet:

```bash

$ yarn build
$ yarn deploy

=======
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

You will now be able to fetch contract addresses using curl (if you ran the network with the up_local.sh script):
```
curl http://127.0.0.1:8078/addresses.json
```

You can run the wallet tests using `omgx_integration_tests` docker compose entry.

```
cd ops/
docker-compose -f docker-compose-omgx.yml -f docker-compose-omgx-services.yml run omgx_integration_tests
```

or if you set the above environment variables, `yarn test:integration` works too.

## 4. Firing up the wallet

The web wallet is a react front end that makes it easy to see your balances, transfer funds, and build on for your own uses. The code is deliberately basic, to make it easy for you to repurpose it for your own needs. 
It's a work in progress - for example, we are adding some basic support for NFTs and an interface for people to contribute to the conjoined liquidity pools that live on the L1 and L2.

Now navigate to child wallet folder

```bash
$ cd /optimism/packages/omgx/contracts/wallet
```

First create `.env` file and provide your Infura and Etherscan keys: along with below environment parameters

```bash
REACT_APP_INFURA_ID=
REACT_APP_ETHERSCAN_API=
REACT_APP_POLL_INTERVAL=20000
SKIP_PREFLIGHT_CHECK=true
```

Then,

```bash
$ yarn start
```

At that point, the wallet will start when you run `$ yarn start`. You can interact with the wallet at `http://localhost:3000.`

Install metamask by following the instruction on login page connect it with metamask so you can access the wallet.

# Common Wallet Setup Problems

**Wallet does not show balances** Did you set the correct ChainIDs in the custom RPC in MetaMask? Please make sure the ChainIDs are correct (Rinkeby = 4, OMGX L2 = 28, local hardhat L1 = 31337).

**I checked that and the wallet still does not show balances** Did you generate a `.env` and provide your `REACT_APP_INFURA_ID` and `REACT_APP_ETHERSCAN_API`?

### Integration Tests

Note that the integration tests also set up parts of the system that the web wallet will need to work, such as liquidity pools and bridge contracts.

```bash

$ yarn build  #builds the contracts
$ yarn deploy #if needed. this will test/deploy the contracts and write their addresses to /deployments/addresses.json
              #you do not need to deploy onto Rinkeby (unless you really want to) since all the needed contracts are already deployed and tested

```

The information generated during the deploy (e.g the `/deployment/local/addresses.json`) is used by the web wallet to set things up correctly. 
**The full test suite includes some very slow transactions such as withdrawals, which can take 100 seconds to complete. Please be patient.**

### 3. Wallet Specific Smart Contracts

These contracts instantiate a simple swap on/off system for fast entry/exit, as well as some basics such as support for atomic swaps.

### 3.1 L1liquidityPool.sol

The Layer 1 liquidity pool accepts ERC20 and ETH. `L1liquidityPool.sol` charges a convenience fee to the user for quickly getting on to the L2.

**L1->L2**: When users **deposit into this contract**, then (1) the pool size grows and (2) corresponding funds are sent to them on the L2 side.

**L2->L1**: When users **deposit into the corresponding L2 contract**, then (1) the pool size shrinks and (2) corresponding tokens are sent to them at their L1 wallet (minus the fee).

#### Known Gaps/Problems

- [ ] The contract owner can't currently get funds back out of the liquidy pool. This is a bug/feature, depending.
- [ ] Need system to allow _others_ to add liquidity and pay them for their liquidity.

#### Initial values

* _l2LiquidityPoolAddress_. The address of the Layer 2 liquidity pool
* _l1messenger_. The address of the Layer 1 messenger
* _l2ETHAddress_. The address of the oWETH contract on the L2
* _fee_. The convenience fee. The data type of `_fee` is `uint256`. If the fee is 3%, then `_fee` is 3.

#### Events

* `ownerAddERC20Liquidity_EVENT`. The contract owner just added funds to the liquidity pool.
* `clientDepositL1_EVENT`. A user just deposited tokens to the pool. `clientDepositL1` sends a message to L2, which triggers an L2 contract to send funds to the user's L2 wallet.
* `clientPayL1_EVENT`. A user deposited tokens into the system on the L2 side, which then called `clientPayL1` to send the tokens to the user's L1 account. `clientPayL1` can only be accessed by a contract on the L2 side.
* `ownerRecoverFee_EVENT`. The contract owner just withdrew fees.

#### Functions

* `init`. Can only be accessed by the contract owner. The owner can update the `_fee`.
* `receive`. This handles ETH. If called by the contract owner, it allows ETH to be deposited into the ETH pool. For other callers, it also sends a message to the `L2liquidityPool` smart contract on L2, which then sends oWETH to the sender.
* `ownerAddERC20Liquidity`. Used by the owner to provide liquidity into an ERC20 pool. Unlike a normal deposit, it doesn't send a message to L2.
* ` balanceOf` returns the balance of ERC20 or ETH of this contract. The default address of ETH is `address(0)`.
* ` feeBalanceOf` returns the fee balance of ERC20 or ETH of this contract.
* ` clientDepositL1` Users call this function to deposit tokens. After receiving the deposit, the contract sends a cross-domain message to L2. The `L2liquidityPool` sends the corresponding tokens to the user.
* ` clientPayL1` This cross-chain function can only be accessed `onlyFromCrossDomainAccount`. It can't be accessed by any users. When the layer 2 liquidity pool receives tokens and sends a message to L1, `clientPayL1` sends the token to the user and charges a convenience fee.
* ` ownerRecoverFee` can only be accessed by the contract owner. The contract owner can withdraw fees as they accumulate.

### 3.2 L2liquidityPool.sol

Just like the contract for L1, but with changes e.g. to deal with the fact that the L2 does not have native ETH.

### 3.3 Deploy Liquidity Pools

If you are working on a local testnet, please deploy **L2LiquidityPool.sol** first, then use the address of **L2LiquidityPool** as the parameter for deploying the **L1Liquidity**. See **/test/a_setup.spec.ts** to see the whole process.

```javascript

L2LiquidityPool = await Factory__L2LiquidityPool.deploy(
  env.watcher.l2.messengerAddress,
)
await L2LiquidityPool.deployTransaction.wait()

L1LiquidityPool = await Factory__L1LiquidityPool.deploy(
  L2LiquidityPool.address,
  env.watcher.l1.messengerAddress,
  env.L2ETHGateway.address,
  3 //this is the 3% fee
)
await L1LiquidityPool.deployTransaction.wait()

const L2LiquidityPoolTX = await L2LiquidityPool.init(L1LiquidityPool.address, "3")
await L2LiquidityPoolTX.wait()
console.log(' L2 LP initialized:',L2LiquidityPoolTX.hash);

```

### 3.4 AtomicSwap

Used to swap ERC20 tokens.

#### Functions

* `open` creates **Swap** struct, which contains the information of the buyer and sender.
* `close` closes the swap. It swaps the ERC20 tokens of the sender and the buyer.
* `expire` sets the status of the swap to be **EXPIRED**.
* `check` returns the **Swap** construct.

### 3.5 ERC721Mock aka NFTs

This contract sets up a very rudimentary interface to the @OpenZeppelin ERC721 contracts. Used to set up a very basic NFT system where the owner can mint NFTs and send them to others, who can then see their NFTs. Have a look at Alice's NFTs.

### MetaMask Settings

On the MetaMask side, some set up is needed.

1. Add your two test accounts to MetaMask (through **MetaMask>Import Account**). In the test code, PK_1 is the `Bob` account, and PK_2 is the `Alice`  account.

2. You also need to point Metamask at the correct chain.
  * For work on Rinkeby L1, chose **MetaMask>Networks>Rinkeby Test Network**.
  * For work on the OMGX Rinkeby L2, chose **MetaMask>Networks>Custom RPC** and enter `https://rinkeby.omgx.network/` with a ChainID of 28.
  * For work on a local L1, chose **MetaMask>Networks>Custom RPC** and enter `http://localhost:9545` with a ChainID of 31337.
  * For work on a local OMGX L2, chose **MetaMask>Networks>Custom RPC** and enter `http://localhost:8545` with a ChainID of 28.

*NOTE* You might have to reset MetaMask when you re-start the local network. The reset button is in **MetaMask>Settings>Advanced>Reset Account**.

### Wallet Use and Supported Functions

1. Open the MetaMask browser extension and select the chain you want to work on.

2. On the top right of the wallet landing page, select either `local` or `rinkeby`. You will then be taken to your account page. Here you can see your balances and move tokens from L1 to L2, and back, for example.

# Regenesis

The regenesis means that we upgrade the OMGX network by regenerating the genesis block. During the regenesis, the state dump of the latest block is generated (including all user's nonces, token balances, contract code, and contract storage) and a new chain is spun up from this latest state sump. Since the new chain is started from the new genesis block, we have to remove all transaction history and logs. The transaction history and logs will be inaccessible from the new chain except under extreme circumstances.

## Upcoming

### 2.0.0 - L2 upgradeablity

* Rinkeby -- 08/04/2021

  Upgrade the gas contract and add the fee vault contract

## What will happen on the Regenesis day?

The regenesis process takes up to 6 hours. All deposits will be halted and the L2 endpoint will become private! **DON'T** deposit your funds to **L1StandardTokenBridge** and **L1LiquidityPool** during the regenesis process! We will accept new transactions again once the regenesis is done.

## How does a Regenesis affect tooling?

Since we start from the block #0 after the regenesis, the Graph will have to re-sync their hosted service and users will have to redeploy all of their subgraphs. [blockexplorer](https://blockexplorer.rinkeby.omgx.network/?network=OmgX) won't maintain the transaction history before the regenesis.

## How do we make a Regenesis?

> This part is for someone who understands the optimism infrastructure.

### Step 0: make the L2 endpoint private

The L2 endpoint can only be accessed from specific ip addresses.

### Step 1: speed up the pending transactions from L2 to L1

The genesis redeploys all L1 contracts, so there is no way to relay those messages to L1 after the regenesis. Speeding up the transactions requires us to deploy a new **OVM_L1CrossDomainMessenger** to bypass the 7-day waiting period first. 

Deploying a new **OVM_L1CrossDomainMessenger** via:

```bash
cd packages/omgx/regenesis
yarn build:contracts
yarn deploy
```

After deploying the **OVM_L1CrossDomainMessenger** contract, run the modified message relayer via:

```bash
yarn build
yarn start
```

The modified message relayer scans all the messages that are supposed to be relayed on L1 contract and makes sure that all messages are relayed to L1 contracts.

### Step 2: redeploy contracts

The regenesis means that we will redeploy the L1 contracts. However, we don't redeploy the following contracts: **Lib_AddressManager**, **Proxy__OVM_L1CrossDomainMessenger**, **Proxy__OVM_L1StandardBridge** and **Proxy__OVM_L1CrossDomainMessengerFast**. The address of **Lib_AddressManager** is stored in the proxy contracts, we have to keep both proxy contracts and address manager contract. Removing the rest `.json` files in `packages/contracts/deployments/..` and deploying the new contracts via:

```bash
yarn deploy
```

### Step 3: take a state dump of the latest block

The L2 chain data is stored in EC2 and ECS. Copy the L2 chain data to your local directory first, then run 

```bash
geth dump LATEST_BLOCK_NUMBER --datadir DATADIRCTOTY > packages/contracts/dist/dump/state-dump.regenesis.json
```

Migrate the latest state dump data into our genesis block json file via:

```bash
yarn build:dump
yarn build:regenesis
```

### Step 4: fire up a new chain using the new `state-dump.latest.json`

## Note

The regenesis process is very **dangerous!** **DON'T touch it if you don't understand what you are doing.**


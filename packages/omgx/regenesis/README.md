# Regenesis

The regenesis means that we upgrade the OMGX network by regenerating the genesis block. During the regenesis, the state dump of the latest block is generated (including all user's nonces, token balances, contract code, and contract storage) and a new chain is spun up from this latest state sump. Since the new chain is started from the new genesis block, we have to remove all transaction history and logs. The transaction history and logs will be inaccessible from the new chain except under extreme circumstances.

## Upcoming

### 2.0.0 - L2 upgradeablity [Done]

* Rinkeby -- 08/04/2021

  Upgrade the gas contract and add the fee vault contract
  
  ```js
  {
    "AddressManager": "0x4e57A993D14FF6f2BCA23d9B174faA9c7AdC4A5A",
    "OVM_CanonicalTransactionChain": "0x0027cDa16D83D08978012c224181c6AED363511d",
    "OVM_ChainStorageContainer-CTC-batches": "0x9BfFeFEcbEC3dd539DF633E0866c038D4F28CF16",
    "OVM_ChainStorageContainer-CTC-queue": "0x578778B1D677ded84706646eEb11Ea85079f7bf5",
    "OVM_ChainStorageContainer-SCC-batches": "0x5379688588024A4E0c20f359241eD7A3D81AFB8f",
    "OVM_ExecutionManager": "0xA407cf34159190d84BfC6675bbFd81BAF3a81Bb3",
    "OVM_FraudVerifier": "0x06BE1fDdA4d709f92B825F19879f4299947295A7",
    "OVM_L1CrossDomainMessenger": "0x37c82b55A507085787A17A3a24158C0Aa646f4A3",
    "OVM_SafetyChecker": "0x44c95B39F4530eAc622Cdad372bD6CF3A144a92f",
    "OVM_StateCommitmentChain": "0x4621811E837633022E4F4ABadAaE8a4F301C5D1C",
    "OVM_StateManagerFactory": "0xD78bc1f70cbbD236D2185daA6e1191B26677FF77",
    "OVM_StateTransitionerFactory": "0xe9b231835Ec4C34E57E27770350FA4111Dd899cd",
    "OVM_BondManager": "0xFE182AE17F06e024a1a81E4DE79205c527020436",
    "OVM_Sequencer": "0xE48E5b731FAAb955d147FA954cba19d93Dc03529",
    "Deployer": "0x122816e7A7AeB40601d0aC0DCAA8402F7aa4cDfA",
    "Proxy__OVM_L1CrossDomainMessenger": "0xF10EEfC14eB5b7885Ea9F7A631a21c7a82cf5D76",
    "Proxy__OVM_L1StandardBridge": "0xDe085C82536A06b40D20654c2AbA342F2abD7077"
  }
  ```

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

The regenesis means that we will redeploy the L1 contracts. However, we don't redeploy the following contracts: **Proxy__OVM_L1CrossDomainMessenger**, **Proxy__OVM_L1StandardBridge** and **Proxy__OVM_L1CrossDomainMessengerFast**. Remove the deployment files of these three proxy contracts in `packages/contracts/deploy/..` and  result files in `packages/contracts/deployments`, then deploy the new contracts via:

```bash
yarn deploy
```

After deploying the new contracts, PLEASE register the those addresses in the first `Lib_AddressManager` contract. The `Lib_AddressManager` of the Rinkeby is `0x93A96D6A5beb1F661cf052722A1424CDDA3e9418`. Therefore, the proxy contracts can work correctly.

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


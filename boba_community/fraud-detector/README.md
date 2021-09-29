- [Fraud Detector](#fraud-detector)
  * [0. Concepts](#0-concepts)
  * [1. Errors and State Root Mismatches in the Boba Mainnet](#1-errors-and-state-root-mismatches-in-the-boba-mainnet)
  * [2. What do when you discover a state root mismatch](#2-what-do-when-you-discover-a-state-root-mismatch)
  * [3. STEP 1: Running a local system with Verifier and Data Transport Layer (DTL)](#3-step-1--running-a-local-system-with-verifier-and-data-transport-layer--dtl-)
  * [4. STEP 2: Running the Fraud Detector](#4-step-2--running-the-fraud-detector)
  * [5. FAQ](#5-faq)

# Fraud Detector

An executable fraud detector and docker script for running a *Verifier*, a *DTL* (data transport layer), and a *fraud-detector* service.

## 0. Concepts

This repo allows you to: 

1. Run your own Boba geth L2 on your computer. In this case, the geth L2 will run in its `Verifier` mode. In `Verifier` mode, the geth 
will sync from L1 and uses the transaction data from the L1 contracts to compute what the state roots should be, *if the operator is honest*.

2. A separate service, the *fraud-detector*, can then be used to discover potential fraud. Briefly, the fraud detection steps consist of 
requesting a state root from Boba Mainnet L1 and requesting a state root from *your* 
Verifier. If those state roots match, then, the operator has been honest. If they do not match, then, that **might** be due to fraud, or, could also 
indicate indexing or timestamp errors, or chain configuration errors.

The central idea is that if two systems looks at the same transactions, then they should generate the same state roots. If they don't, then there is a problem somewhere. Fundamentally, the security of rollups has little to do with math or cryptography - rather, security arises from publicly depositing transactions and their state roots (in this case into the Boba L1 contracts), and then, **having many independent people check those data for possible discrepancies**.

## 1. Errors and State Root Mismatches in the Boba Mainnet

* For the first 10 blocks, the chainID was set (incorrectly) to 28 rather than 288. Therefore, the EIP155 signatures fail for those blocks, and the Verifier cannot sync those blocks. This has been addressed by setting the L1_MAINNET_DEPLOYMENT_BLOCK to 10 blocks past the zero block. 

* There is one state root mismatch at L2 block 155, arising from a two second discrepancy in a timestamp, that was ultimately caused by a too-small setting for the number of confirmations (DATA_TRANSPORT_LAYER__CONFIRMATIONS). This value was therefore increased to 4. The 2 second block 155 timestamp discrepancy has been addressed in a custom docker image (`omgx/data-transport-layer:rc1.0-surgery`). 

## 2. What do when you discover a state root mismatch

Congratulations! The security of the L2 depends on community monitoring of the operator's actions. If you have discovered a state root mismatch, please file a GitHub issue (https://github.com/omgnetwork/optimism/issues). We should have a good response / clarification for you quickly. In the future, with the Boba governance token, additional mechanisms will be developed to incentivize and reward community monitoring of the Boba L2.  

## 3. STEP 1: Running a local system with Verifier and Data Transport Layer (DTL)

**Requirements**: you will need a command line, Docker, and yarn.

**Open a terminal window**. Create a `.env` file from the provided example (`env.example`) and paste in your Infura key. You can get a free Infura key at https://infura.io. Your `.env` should then look like this (except that you will be using your Infura key):

```bash

L1_NODE_WEB3_URL=https://mainnet.infura.io/v3/123456789012345678901234567890
VERIFIER_WEB3_URL=http://localhost:8547
ADDRESS_MANAGER_ADDRESS=0x8376ac6C3f73a25Dd994E0b0669ca7ee0C02F089
L1_MAINNET_DEPLOYMENT_BLOCK=13011896

```

Then, start the Verifier and DTL by:

```bash

$ ./up_local.sh

```

The L2 will spin up and begin to sync with the Boba L1. **NOTE: the sync process can take ~2 hours to complete**. During the syncing process, you will see the Verifier gradually catch up with the Boba L2:

```bash

data_transport_layer_1  | {"level":30,"time":1632868364830,"method":"GET","url":"/eth/syncing?backend=l1","elapsed":0,"msg":"Served HTTP Request"}
geth_l2_1               | INFO [09-28|22:32:44.831] Still syncing                            index=9 tip=2706
data_transport_layer_1  | {"level":30,"time":1632868374830,"method":"GET","url":"/eth/syncing?backend=l1","elapsed":1,"msg":"Served HTTP Request"}
geth_l2_1               | INFO [09-28|22:32:54.831] Still syncing                            index=11 tip=2706

```

When your Verifier has caught up with the Boba L2, then you will see it fetching transactions: 

```bash

data_transport_layer_1  | {"level":30,"time":1632875212812,"method":"GET","url":"/batch/transaction/latest","elapsed":1,"msg":"Served HTTP Request"}
geth_l2_1               | INFO [09-29|00:26:52.813] Set L2 Gas Price                         gasprice=0

```

At this point, you are ready to look for fraud....

## 4. STEP 2: Running the Fraud Detector

**Open a second terminal**. Make sure dependencies are installed, everything is built, and the system is started:

```bash

yarn
yarn build
yarn start 

```

First, the fraud detector will cache relevant events from the chain and then verify each state root based on state roots that you are calculating locally, with your Verifier. After caching older chain data, which should take at most 30 minutes, the fraud detector will then verify each state root:

```bash

Last good SCC batch at L1: 13312534
Next operator L2 block to verify: {
  L2block: 2472,
  L1block: 13312534,
  batchRoot: '0x9a000d9a78e311683de5ca760205c50ceb75a9f3ff560abe16d7eafe208281e7',
  batchSize: 1,
  batchIndex: 1052,
  prevTotalElements: 2472,
  extraData: '0x000000000000000000000000000000000000000000000000000000006152ad08000000000000000000000000c5ad6db2a5fdb53c1838184e0a6cd2ba06c0239b',
  stateRoot: '0x9a000d9a78e311683de5ca760205c50ceb75a9f3ff560abe16d7eafe208281e7'
}
{"level":30,"time":1632808270129,"L2_block":2472,"operatorSR":"0x9a000d9a78e311683de5ca760205c50ceb75a9f3ff560abe16d7eafe208281e7","verifierSR":"0x9a000d9a78e311683de5ca760205c50ceb75a9f3ff560abe16d7eafe208281e7","msg":"State root MATCH - verified ✓"}

***********************************************************
State root MATCH - verified ✓ L2 Block number 2472
***********************************************************

```

## 5. FAQ

* If the fraud-detector says that it is `Unable to connect to L2 Verifier` then this means that the Verifier has not yet synced completely (or is not running at all). Give the Verifier a few more hours to catch with the Boba L2, and then, when the Verifier has completed its sync-up and you start the fraud detector, it should be able to successfully connect to your Verifier. 

* Errors like this are due to Infura sometimes being flaky. Just try again (`yarn start`). 

```bash
Error: missing response (requestBody="{\"method\":\"eth_getTransactionByHash\",\"params\":[\"0x58eb0d3d4412405e41f752f6131c09a2576ede33154d855c1d69265e47889979\"],\"id\":643,\"jsonrpc\":\"2.0\"}", requestMethod="POST", serverError={"errno":-60,"code":"ETIMEDOUT","syscall":"connect","address":"34.228.88.167","port":443}, url="https://mainnet.infura.io/v3/11111111111111111111111", code=SERVER_ERROR, version=web/5.4.0)
```

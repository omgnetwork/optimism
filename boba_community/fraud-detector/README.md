# Fraud Detector

Contains an executable fraud detector and docker scipts for running a Verifier and a DTL (data transport layer). 

This repo allows you to: 

1. Run an L2 in Verifier mode, pointed at the Boba L1 Mainnet contracts.
2. Check state roots in the boba L1 contracxts, via ground truth that you are calculting locally.

## 1. FIRST TERMINAL WINDOW: Running a local system with Verifier and Data Transport Layer (DTL)

**Open a terminal window** and make sure dependencies are installed and everything is built - just run `yarn`. Then, add your Infura key to the `docker-detect.yml`:

```bash

version: "3.4"

x-var: &L1_NODE_WEB3_URL
  L1_NODE_WEB3_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

x-var: &DATA_TRANSPORT_LAYER__L1_RPC_ENDPOINT
  DATA_TRANSPORT_LAYER__L1_RPC_ENDPOINT=https://mainnet.infura.io/v3/YOUR_INFURA_KEY

```

Then, run:

```bash

$ ./up_local.sh

```

At this point you will have the *Verifier* and the *DTL (Data Transport Layer)* running on your computer. These services will take a while (~hours) to sync with the Boba L1 contracts.

## 2. SECOND TERMINAL WINDOW: Running the Fraud Detector

**Open a second terminal** and create a `.env` based on the `env.example`. You will have to paste in your Infura key again. Then,

```bash

yarn build
yarn start 

```

First, the fraud detector will cache relevant events from the chain and then verify each state root based on state roots that you are calculating locally, with your *Verifier* service. 

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

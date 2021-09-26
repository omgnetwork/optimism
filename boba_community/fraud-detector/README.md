# Fraud Prover

Contains an executable fraud prover. This repo allows you to:

1. Generate a `fraud-prover` docker image
2. Run that docker and the associated L2 in Verifier mode, pointed at a local system.
3. Inject fraudulant state roots to debug/improve the `fraud-prover`.

## 1. FIRST TERMINAL WINDOW: Building & Running a local system with Verifier and Fraud Prover

**Open a terminal window** and make sure dependencies are installed and everything is built - just run `yarn` and `yarn build` in the top directory (`/optimsm`). Then spin up the entire system:

```bash

cd ops

# build all the needed services
docker-compose -f docker-compose-fraud.yml build

# this configures the Verifier and DTL to focus on L1, and also, sets the fraud_address
docker-compose -f docker-compose-fraud.yml up -V
# FYI - Need to re-init volumes so that the system comes up cleanly - this is what the `-V` does.
# Otherwise the batch-submitter will get confused 

```

At this point you will have the *L1*, *L2*, the *Verifier*, the *data_transport_layer*, the *batch_submitter*, the *message_relayer*, the *deployer*, and the *fraud_prover* all running and talking to one another. So far so good. 

## 2. SECOND TERMINAL WINDOW: Injecting Fraudulant State Roots

**Open a second terminal** and then:

```bash


cd omgx_utilities
yarn
yarn build:fraud
yarn deploy 

```

```bash

  Fraud Prover Testing System Setup
    ✓ should give the initial supply to the creator's address
    ✓ should transfer from Bob to Alice, triggering the batch submitter to submit a batch (185ms)
    ✓ should transfer from Bob to Fraud, and from Fraud to Alice (140ms)


  3 passing (980ms)

```

To avoid complications, please don't `yarn deploy` twice. You will see a contract compile for OVM and get deployed on the OVM. Running `yarn deploy` triggers the batch submitter to inject a bad state root - this takes place when *Mr. Fraud* transfers some funds to Alice. This is all set up via the `docker-compose-fraud.yaml`, which sets:

```bash

#this is the address that will trigger the batch_submitter to inject fake state roots
FRAUD_SUBMISSION_ADDRESS="0xbda5747bfd65f08deb54cb465eb87d40e51b197e"

```

Any transactions from the `Fraud` wallet will cause the `batch_submitter` to submit a bad state root (`0xbad1bad1......`) instead of the correct state root.

```bash
batch_submitter_1    | 
{"level":40,"time":1624654055526,"name":"oe:batch_submitter:state_chain",
"from":"0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
"fraudSubmissionAddress":"0xbda5747bfd65f08deb54cb465eb87d40e51b197e",
"msg":"Found transaction; FSA set to"}
batch_submitter_1    | 
{"level":40,"time":1624654055526,"name":"oe:batch_submitter:state_chain",
"txHash":"0xe4c19a37b005c18a9d70a47d79a5fb5e5c26b5de0cde34ce355a6ba693964e12",
"fraudSubmissionAddress":"0xbda5747bfd65f08deb54cb465eb87d40e51b197e",
"msg":"Found transaction from fraud submission address"}
batch_submitter_1    | 
{"level":40,"time":1624654055528,"name":"oe:batch_submitter:state_chain",
"from":"0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
"fraudSubmissionAddress":"no fraud","msg":"Found transaction; FSA set to"}
````

At this point, you are all set to run the `fraud-prover`:

```bash

yarn build
yarn start

```

The fraud prover will find the fraudulent state root: 

```

Here are the L1 nextBatchStateRoots for this header: [
  '0x30ecc50be31488b9550d4c07933e6eba5d9ae7a183833b79e049075c28b9bc3c',
  '0xa706919acb4420c74434ec13247b4a7f480c038a7b7a09a1ef4a7b589f9670ba',
  '0xa3fa402184ae96c20b3ff9230d3bc5f24150145b63534446852a14b3e1e217ce',
  '0x6b02de3dd168224a0f0d10ca1150b44bdbdb5c7854ca79b959bb7190778e38c2',
  '0x69cb6f1a956f2807bcc9e4f0f474e020cae1ae17f0493bfc1535bfc5a3aee4b3',
  '0x806a9975643621374122145a114a12ac2d6e69dbdb1e2a1f0aa2ca65b1d24a40',
  '0xbad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1'
]
Checking state root for mismatch 21
{"level":30,"time":1624910071611,"msg":"State root MATCH - all good ✓"}
Checking state root for mismatch 22
{"level":30,"time":1624910071613,"msg":"State root MATCH - all good ✓"}
Checking state root for mismatch 23
{"level":30,"time":1624910071616,"msg":"State root MATCH - all good ✓"}
Checking state root for mismatch 24
{"level":30,"time":1624910071619,"msg":"State root MATCH - all good ✓"}
Checking state root for mismatch 25
{"level":30,"time":1624910071622,"msg":"State root MATCH - all good ✓"}
Checking state root for mismatch 26
{"level":30,"time":1624910071624,"msg":"State root MATCH - all good ✓"}
Checking state root for mismatch 27
{"level":30,"time":1624910071626,"msg":"State root MISMATCH"}
{"level":30,"time":1624910071626,"l1StateRoot":"0xbad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1bad1","msg":"L1 State Root"}
{"level":30,"time":1624910071626,"l2VStateRoot":"0x56f5a6479269667ef1f9ae4e05f519b00c58516e99ab351a88b7e6a47f4d4e9c","msg":"L2 State Root"}
{"level":30,"time":1624910071626,"index":27,"msg":"Returning index of the mismatch"}
{"level":30,"time":1624910071627,"fraudulentStateRootIndex":27,"msg":"Found a mismatched state root"}
{"level":30,"time":1624910071627,"msg":"Getting fraud proof data for this index"}
{"level":30,"time":1624910071627,"msg":"Getting pre-state root inclusion proof..."}

```

and then, prove account states and slots (condensed log):

```bash

{"level":30,"time":1624910072332,"msg":"Loading fraud proof contracts..."}
{"level":30,"time":1624910072332,"msg":"Loading the state transitioner..."}
{"level":30,"time":1624910072383,"stateTransitionerAddress":"0x4F57F9239eFCBf43e5920f579D03B3849C588396","msg":"State transitioner"}
{"level":30,"time":1624910072393,"stateManagerAddress":"0xf0D7de80A1C242fA3C738b083C422d65c6c7ABF1","msg":"stateManagerAddress..."}
{"level":30,"time":1624910072425,"stateManagerAddress":"0xf0D7de80A1C242fA3C738b083C422d65c6c7ABF1","msg":"State manager"}
{"level":30,"time":1624910072436,"msg":"Fraud proof is now in the PRE_EXECUTION phase."}
{"level":30,"time":1624910072436,"msg":"PEP: Proving account states..."}
{"level":30,"time":1624910072436,"address":"0x4200000000000000000000000000000000000007","msg":"Attempting to prove account state"}
{"level":30,"time":1624910072451,"msg":"Need to deploy a copy of the account first..."}
{"level":30,"time":1624910072512,"msg":"Deployed a copy of the account, attempting proof..."}
{"level":30,"time":1624910072512,"msg":"OVM_StateTransitioner.proveContractState..."}
{"level":30,"time":1624910072916,"msg":"Account state proven."}

...

{"level":30,"time":1624910074719,"msg":"PEP: Proving storage slot states..."}
{"level":30,"time":1624910074719,"address":"0x4200000000000000000000000000000000000008","key":"0xde24ca96c4b0b6ed2c73bb46c1053b6edd9470cda80c625493502cc81a3ccfa7","value":"0x4200000000000000000000000000000000000000","msg":"Attempting to prove slot."}
{"level":30,"time":1624910075002,"msg":"Slot value proven."}

...

{"level":30,"time":1624910080439,"msg":"Executing transaction..."}
{"level":30,"time":1624910080513,"msg":"Transaction successfully executed."}

```

at this point, the `PRE-EXECUTION` phase should be complete. This is as far as we have gotten - occasionally there are gas related issues, which lead to things like `VM Exception while processing transaction: revert Not enough gas to execute transaction deterministically`. The run-gas-limit is set in the `.env` at `RUN_GAS_LIMIT=95000000`.

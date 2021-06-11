# Fraud Prover

Contains an executable fraud prover. This repo allows you to:

1. Generate a fraud prover Docker
2. Run that docker and the associated L2 in Verifier mode, pointed at a local OMGX.
3. Inject fraudulant state roots to debug the currently non-operational fraud-prover.

## 1. FIRST TERMINAL WINDOW: Building & Running a local system with Verifier and Fraud Prover

Make sure dependencies are installed and everything is built - just run `yarn` and `yarn build` in the top directory  (/optimsm). Then spin up the entire system with the L2, the Verifier, and the Fraud Prover:

```bash

#OUTDATED ./up_local.sh #to spin up and verify a local OMGX
#insted, use...

docker-compose up --scale verifier=1 --build --detach

```

At this point you will have the *L1*, *L2*, the *Verifier*, the *data_transport_layer*, the *batch_submitter*, *the *message_relayer*, the *deployer*, and the *fraud_prover* all running and talking to one another. So far so good. 

## 2. SECOND TERMINAL WINDOW: Injecting Fraudulant State Roots

The `docker-compose.yaml` sets:

```bash

#this is the address that will trigger the batch_submitter to inject fake state roots
FRAUD_SUBMISSION_ADDRESS="0xbda5747bfd65f08deb54cb465eb87d40e51b197e"

```

/*

# HARDHAT ACCOUNTS:

Standard usage - careful re. duplication

# DEPLOYER_PRIVATE_KEY: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
# SEQUENCER_PRIVATE_KEY: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
# RELAYER_PRIVATE_KEY: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

# # a funded hardhat account used for the relayer - duplicates the one used for the Relayer.... 
# L1_WALLET_KEY: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

Accounts used for the wallet, typically - should hcange those?

# ETH1_ADDRESS_RESOLVER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
# TEST_PRIVATE_KEY_1=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# TEST_PRIVATE_KEY_2=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
# TEST_PRIVATE_KEY_3=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Acconut used to submit fraudulent state roots

# Account #17: 0xbda5747bfd65f08deb54cb465eb87d40e51b197e (10000 ETH)
# Private Key: 0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd

yarn run v1.22.5
$ hardhat node
Started HTTP and WebSocket JSON-RPC server at http://0.0.0.0:8545/
Accounts
========
Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Account #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Account #3: 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Account #4: 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 (10000 ETH)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
Account #5: 0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc (10000 ETH)
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
Account #6: 0x976ea74026e726554db657fa54763abd0c3a0aa9 (10000 ETH)
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
Account #7: 0x14dc79964da2c08b23698b3d3cc7ca32193d9955 (10000 ETH)
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
Account #8: 0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f (10000 ETH)
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
Account #9: 0xa0ee7a142d267c1f36714e4a8f75612f20a79720 (10000 ETH)
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6
Account #10: 0xbcd4042de499d14e55001ccbb24a551f3b954096 (10000 ETH)
Private Key: 0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897
Account #11: 0x71be63f3384f5fb98995898a86b02fb2426c5788 (10000 ETH)
Private Key: 0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82
Account #12: 0xfabb0ac9d68b0b445fb7357272ff202c5651694a (10000 ETH)
Private Key: 0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1
Account #13: 0x1cbd3b2770909d4e10f157cabc84c7264073c9ec (10000 ETH)
Private Key: 0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd
Account #14: 0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097 (10000 ETH)
Private Key: 0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa
Account #15: 0xcd3b766ccdd6ae721141f452c550ca635964ce71 (10000 ETH)
Private Key: 0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61
Account #16: 0x2546bcd3c84621e976d8185a91a922ae77ecec30 (10000 ETH)
Private Key: 0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0

**Account #17: 0xbda5747bfd65f08deb54cb465eb87d40e51b197e (10000 ETH)
Private Key: 0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd**

Account #18: 0xdd2fd4581271e230360230f9337d5c0430bf44c0 (10000 ETH)

*/



Any transactions fron this wallet will cause the `batch_submitter` to submit a bad state root (`0xbad1bad1......`) instead of the correct state root. Normnally, the batch submitter only does this once, but we patched the batch submitter to allow many fraudulant transaction to be submitted. **Open a second terminal** and then:

```bash

yarn build:fraud
yarn deploy 

```

You will see a few contracts get deployed, and you will see *Mr. Fraud* transferring some funds to Alice. Running `yarn deploy` **does** trigger the batch submitter to inject a bad state root, but then, the system reverts, proably due to indexing and other issues. Note that hardhat needs a `.env` for the deploy - see the `example.env` for working settings.

```bash
#expected terminal output

  System setup
L1ERC20 deployed to: 0x196A1b2750D9d39ECcC7667455DdF1b8d5D65696
L2DepositedERC20 deployed to: 0x3e4CFaa8730092552d9425575E49bB542e329981
L1ERC20Gateway deployed to: 0x60ba97F7cE0CD19Df71bAd0C3BE9400541f6548E
L2 ERC20 initialized: 0x2b4793dfe3a8241d776cacd604904c30601f7a895debc59ff66bef1b187d3899
 Bob Depositing L1 ERC20 to L2...
 On L1, Bob has: BigNumber { _hex: '0x204fce5e3e25026110000000', _isBigNumber: true }
 On L2, Bob has: BigNumber { _hex: '0x00', _isBigNumber: true }
 On L1, Bob now has: BigNumber { _hex: '0x204fce561c79f51cfb680000', _isBigNumber: true }
 On L2, Bob now has: BigNumber { _hex: '0x0821ab0d4414980000', _isBigNumber: true }
    ✓ Bob Approve and Deposit ERC20 from L1 to L2 (5233ms)
    ✓ should transfer ERC20 token to Alice and Fraud (4166ms)
 On L2, Alice has: 10000000000000000000
 On L2, Fraud has: 10000000000000000000
 On L2, Alice now has: 7000000000000000000
 On L2, Fraud now has: 13000000000000000000
    ✓ should transfer ERC20 token from Alice to Fraud (4119ms)
 On L2, Bob has: 130000000000000000000
 On L2, Fraud has: 13000000000000000000
 On L2, Bob now has: 131000000000000000000
 On L2, Fraud now has: 12000000000000000000
    ✓ should transfer ERC20 token from Fraud to Bob and commit fraud (4123ms)

```

## 3. THIRD TERMINAL WINDOW: Running a local Fraud Prover for rapid debugging purposes

First, *terminate the dockerized fraud-prover service* and then `yarn build` and `yarn start` a fraud-prover from your command line - this makes it much easier and faster to debug, since you get better debug and console.log output, and its easier to make code changes and see what happens. This fraud-prover will also use whatever you set in the .env (which should match of couse with what all the dockerized services are getting from the `docker-compose-local.env.yaml`)

```bash

yarn build
yarn start

```

## CURRENTLY BROKEN AT One of three places - Lib_MerkleTree.sol, OVM_FraudVerifier.sol, or "makeStateTrie for this proof"

If you do all of the above, while using the standard contracts, you will get stuck at *EITHER*:

```bash
# this is in Lib_MerkleTree.sol

require(
  _siblings.length == _ceilLog2(_totalLeaves),
  "Lib_MerkleTree: Total siblings does not correctly correspond to total leaves."
);

```

*OR* you will get through that but then revert at `VM Exception while processing transaction: revert Pre-state root global index must equal to the transaction root global index`:

```bash
# this is in OVM_FraudVerifier.sol

line 134

require (
    _preStateRootBatchHeader.prevTotalElements + _preStateRootProof.index + 1 == _transactionBatchHeader.prevTotalElements + _transactionProof.index,
    "Pre-state root global index must equal to the transaction root global index."
);

```

*OR* you will get stuck at `_makeStateTrie for this proof`. There are also assorted and sundy other ways for this to fail, mostly relating to out of bounds access to various arrays, most notably, in the transactions.

## 4. Generating the Fraud Prover Docker 

To build the Docker:

```bash

docker build . --file Dockerfile.fraud-prover --tag omgx/fraud-prover:latest
docker push omgx/fraud-prover:latest

```

## NOT UPDATED 5. Configuration

All configuration is done via environment variables. See below for more information.

## NOT UPDATED 6. Testing & linting

- See lint errors with `yarn lint`; auto-fix with `yarn lint --fix`

## NOT UPDATED 7. Envs (Need to reconcile with the below - ToDo)

| Environment Variable   | Required? | Default Value         | Description            |
| -----------            | --------- | -------------         | -----------           |
| `L1_WALLET_KEY`        | Yes       | N/A                   | Private key for an account on Layer 1 (Ethereum) to be used to submit fraud proof transactions. |
| `L2_NODE_WEB3_URL`     | No        | http://localhost:9545 | HTTP endpoint for a Layer 2 (Optimism) Verifier node.  |
| `L1_NODE_WEB3_URL`     | No        | http://localhost:8545 | HTTP endpoint for a Layer 1 (Ethereum) node.      |
| `RELAY_GAS_LIMIT`      | No        | 9,000,000             | Maximum amount of gas to provide to fraud proof transactions (except for the "transaction execution" step). |
| `RUN_GAS_LIMIT`        | No        | 9,000,000             | Maximum amount of gas to provide to the "transaction execution" step. |
| `POLLING_INTERVAL`     | No        | 5,000                 | Time (in milliseconds) to wait while polling for new transactions. |
| `L2_BLOCK_OFFSET`      | No        | 1                     | Offset between the `CanonicalTransactionChain` contract on Layer 1 and the blocks on Layer 2. Currently defaults to 1, but will likely be removed as soon as possible. |
| `L1_BLOCK_FINALITY`    | No        | 0                     | Number of Layer 1 blocks to wait before considering a given event. |
| `L1_START_OFFSET`      | No        | 0                     | Layer 1 block number to start scanning for transactions from. |
| `FROM_L2_TRANSACTION_INDEX` | No        | 0                     | Layer 2 block number to start scanning for transactions from. |

## NOT UPDATED 8. Local testing

The fraud prover will first connect to the relevant chains and then look for mismatched state roots. Note that the *Fraud Prover* does not connect to the *Sequencer*, rather, it connects to the *Verifier*, and the Verifier in turn is looking at the L1. Assuming _your sequencer is not fraudulant_, the standard Fraud Prover output looks like this:

```

{"level":30,"time":1619122304289,"msg":"Looking for mismatched state roots..."}
{"level":30,"time":1619122304295,"nextAttemptInS":5,"msg":"Did not find any mismatched state roots"}
{"level":30,"time":1619122309301,"msg":"Looking for mismatched state roots..."}
{"level":30,"time":1619122309306,"nextAttemptInS":5,"msg":"Did not find any mismatched state roots"}
{"level":30,"time":1619122314311,"msg":"Looking for mismatched state roots..."}

```

When you spin up your local test system some small changes to the generic `local.env.yaml` and `local.yaml` may be needed. Also, you will have to provide two extra files, `wait-for-l1-and-l2.sh`. For your testing conveniance, there is also a `Dockerfile.fraud_prover`.

### local.yaml Settings

Add to your `local.yaml`
```bash
#all the usual things here (L2, Batch submitter, Message Relay, Hardhat, Deployer), but then...

  verifier:
    image: omgx/go-ethereum
    volumes:
      - verifier:/root/.ethereum:rw
    ports:
      - 8045:8045
      - 8046:8046

  fraud_prover:
    image: omgx/fraud-prover:latest

volumes:

  geth:

  verifier:
```

### local.env.yaml Settings

Add to your `local.env.yaml`

```bash

x-var: &L1_NODE_WEB3_URL
  L1_NODE_WEB3_URL=http://l1_chain:9545

x-var: &DEPLOYER_HTTP
  DEPLOYER_HTTP=http://deployer:8080

x-var: &ADDRESS_MANAGER_ADDRESS
  ADDRESS_MANAGER_ADDRESS=0xYOUR_ADDRESS_MANAGER_HERE

services:

#all the usual things here (L2, Batch submitter, Message Relay, Hardhat, Deployer), but then...

  verifier:
    environment:
      - *DEPLOYER_HTTP
      - *L1_NODE_WEB3_URL
      - ROLLUP_VERIFIER_ENABLE=true
      - ETH1_SYNC_SERVICE_ENABLE=true
      - ETH1_CTC_DEPLOYMENT_HEIGHT=8
      - ETH1_CONFIRMATION_DEPTH=0
      - ROLLUP_CLIENT_HTTP=http://data_transport_layer:7878
      - ROLLUP_POLL_INTERVAL_FLAG=3s
      - USING_OVM=true
      - CHAIN_ID=420
      - NETWORK_ID=420
      - DEV=true
      - DATADIR=/root/.ethereum
      - RPC_ENABLE=true
      - RPC_ADDR=verifier
      - RPC_CORS_DOMAIN=*
      - RPC_VHOSTS=*
      - RPC_PORT=8045
      - WS=true
      - WS_ADDR=0.0.0.0
      - IPC_DISABLE=true
      - TARGET_GAS_LIMIT=9000000
      - RPC_API=eth,net,rollup,web3
      - WS_API=eth,net,rollup,web3
      - WS_ORIGINS=*
      - GASPRICE=0
      - NO_USB=true
      - GCMODE=archive
      - NO_DISCOVER=true
      - ROLLUP_STATE_DUMP_PATH=http://deployer:8080/state-dump.latest.json
      - RETRIES=60

  fraud_prover:
    environment:
      - NO_TIMEOUT=true
      - *L1_NODE_WEB3_URL
      - *ADDRESS_MANAGER_ADDRESS
      - L2_NODE_WEB3_URL=http://verifier:8045
      - L1_WALLET_KEY=0xYOUR_FP_WALLET_KEY_HERE
      - POLLING_INTERVAL=5000
      - RUN_GAS_LIMIT=8999999
      - RELAY_GAS_LIMIT=8999999
      - FROM_L2_TRANSACTION_INDEX=0
      - L2_BLOCK_OFFSET=1
      - L1_START_OFFSET=8
      - RETRIES=60

```

### Fraud Prover spinup wait-for-l1-and-l2.sh

```bash

#!/bin/bash

# Copyright Optimism PBC 2020
# MIT License
# github.com/ethereum-optimism

cmd="$@"
JSON='{"jsonrpc":"2.0","id":0,"method":"net_version","params":[]}'

RETRIES=${RETRIES:-50}
until $(curl --silent --fail \
    --output /dev/null \
    -H "Content-Type: application/json" \
    --data "$JSON" "$L1_NODE_WEB3_URL"); do
  sleep 1
  echo "Will wait $((RETRIES--)) more times for $L1_NODE_WEB3_URL to be up..."

  if [ "$RETRIES" -lt 0 ]; then
    echo "Timeout waiting for layer one node at $L1_NODE_WEB3_URL"
    exit 1
  fi
done
echo "Connected to L1 Node at $L1_NODE_WEB3_URL"

RETRIES=${RETRIES:-50}
until $(curl --silent --fail \
    --output /dev/null \
    -H "Content-Type: application/json" \
    --data "$JSON" "$L2_NODE_WEB3_URL"); do
  sleep 1
  echo "Will wait $((RETRIES--)) more times for $L2_NODE_WEB3_URL to be up..."

  if [ "$RETRIES" -lt 0 ]; then
    echo "Timeout waiting for layer two node at $L2_NODE_WEB3_URL"
    exit 1
  fi
done
echo "Connected to L2 Verifier Node at $L2_NODE_WEB3_URL"

if [ ! -z "$DEPLOYER_HTTP" ]; then
    RETRIES=${RETRIES:-50}
    until $(curl --silent --fail \
        --output /dev/null \
        "$DEPLOYER_HTTP/addresses.json"); do
      sleep 1
      echo "Will wait $((RETRIES--)) more times for $DEPLOYER_HTTP to be up..."

      if [ "$RETRIES" -lt 0 ]; then
        echo "Timeout waiting for contract deployment"
        exit 1
      fi
    done
    echo "Contracts are deployed"
    ADDRESS_MANAGER_ADDRESS=$(curl --silent $DEPLOYER_HTTP/addresses.json | jq -r .AddressManager)
    exec env \
        ADDRESS_MANAGER_ADDRESS=$ADDRESS_MANAGER_ADDRESS \
        L1_BLOCK_OFFSET=$L1_BLOCK_OFFSET \
        $cmd
else
    exec $cmd
fi

```

### Fraud Prover Dockerfile.fraud_prover

```

FROM node:14-buster as base

RUN apt-get update && apt-get install -y bash curl jq

FROM base as build

RUN apt-get update && apt-get install -y bash git python build-essential

ADD . /opt/fraud-prover

RUN cd /opt/fraud-prover yarn install yarn build

FROM base

RUN apt-get update && apt-get install -y bash curl jq

COPY --from=build /opt/fraud-prover /opt/fraud-prover

COPY wait-for-l1-and-l2.sh /opt/
RUN chmod +x /opt/wait-for-l1-and-l2.sh
RUN chmod +x /opt/fraud-prover/exec/run.js
RUN ln -s /opt/fraud-prover/exec/run.js /usr/local/bin/

ENTRYPOINT ["/opt/wait-for-l1-and-l2.sh", "run.js"]

```

# Watcher API

> Mainnet Endpoint: https://api-watcher.mainnet.boba.network/
> Rinkeby Endpoint: https://api-watcher.rinkeby.boba.network/

## Methods

### Layer 1

#### get.l1.transactions

**Request Body**

```js
{
  address: "ACCOUNT",
  from: "NUMBER",
  to: "NUMBER"
}
```

**Response Body**

```js
[
  {
    hash: "TRANSACTION_HASH",
    blockNumber: "BLOCK_NUMBER",
    from: "FROM_ACCOUNT",
    to: "TO_ACCOUNT",
    timestamp: "BLOCK_TIMESTAMP",
    contractName: "CONTRACT_NAME", // L1StandardBridge or L1LiquidityPool
    contractAddress: "CONTRACT_ADDRESS", // Contract address
    activity: "ACTIVITY" // event names (ETHDepositInitiated, ERC20DepositInitiated, ClientDepositL1, etc.)
    depositL2: "DEPOSIT_L2", // True or False
    crossDomainMessage: {
      crossDomainMessage: "CROSS_DOMAIN_MESSAGE", // whether the transaction sent cross domain message
      crossDomainMessageFinalize: "CROSS_DOMAIN_MESSAGE_FINALIZED", // whether the cross domain message is finalized on L1
      crossDomainMessageSendTime: "CROSS_DOMAIN_MESSAGE_FINALIZED_TIME", // when the cross domain message is finalized
      crossDomainMessageEstimateFinalizedTime: "ESTIMATE_CROSS_DOMAIN_MESSAGE_FINALIZED_TIME",
      fastDeposit: "FAST_DEPOSIT", // Whether the message is using the liquidity pool
      l2Hash: "L2_HASH", // L2 hash of the cross domain message
      l2BlockNumber: "L2_BLOCK_NUMBER",
      l2BlockHash: "L2_BLOCK_HASH",
      l2From: "L2_FROM",
      l2To: "L2_TO"
    },
    deposit: {
      depositSender: "DEPOSIT_SENDER", // The address of L1 token sender
      depositTo: "DEPOSIT_RECEIVER", // The address of L2 token receiver
      depositToken: "DEPOSIT_TOKEN", // L1 token address
      depositAmount: "DEPOSIT_AMOUNT", // L1 deposit amount, which doesn't consider fee
      depositReceive: "DEPOSIT_RECEIVE", // L2 received amount
      depositFeeRate: "DEPOSIT_FEE",
      fastDeposit: "FAST_DEPOSIT",
      status: "STATUS" // pending || succeeded || reverted
    }
  }
]
```

### Layer 2

#### get.l2.transactions

**Request Body**

```js
{
  address: "ACCOUNT",
  from: "NUMBER",
  to: "NUMBER"
}
```

**Response Body**

```js
[
  {
    hash: "TRANSACTION_HASH",
    blockNumber: "BLOCK_NUMBER",
    from: "FROM_ACCOUNT",
    to: "TO_ACCOUNT",
    timestamp: "BLOCK_TIMESTAMP",
    exitL2: "EXIT_L2", // True or False
    crossDomainMessage: {
      crossDomainMessage: "CROSS_DOMAIN_MESSAGE", // whether the transaction sent cross domain message
      crossDomainMessageFinalize: "CROSS_DOMAIN_MESSAGE_FINALIZED", // whether the cross domain message is finalized on L1
      crossDomainMessageSendTime: "CROSS_DOMAIN_MESSAGE_FINALIZED_TIME", // when the cross domain message is finalized
      crossDomainMessageEstimateFinalizedTime: "ESTIMATE_CROSS_DOMAIN_MESSAGE_FINALIZED_TIME",
      fastRelay: "FAST_RELAY", // Whether the message is using the fast message relayer
      l1Hash: "L1_HASH", // L1 hash of the cross domain message
      l1BlockNumber: "L1_BLOCK_NUMBER",
      l1BlockHash: "L1_BLOCK_HASH",
      l1From: "L1_FROM",
      l1To: "L1_TO"
    },
    stateRoot: {
      stateRootHash: "L1_STATE_ROOT_HASH",
      stateRootBlockNumber: "L1_STATE_ROOT_BLOCK_NUMBER",
      stateRootBlockHash: "L1_STATE_ROOT_BLOCK_HASH",
      stateRootBlockTimestamp: "L1_STATE_ROOT_BLOCK_TIMESTAMP"
    },
    exit: {
      exitSender: "EXIT_SENDER", // The address of L2 token sender
      exitTo: "EXIT_RECEIVER", // The address of L1 token receiver
      exitToken: "EXIT_TOKEN", // L2 token address
      exitAmount: "EXIT_AMOUNT", // L2 exit amount, which doesn't consider fee
      exitReceive: "EXIT_RECEIVE", // L1 received amount
      exitFeeRate: "EXIT_FEE",
      fastRelay: "FAST_RELAY",
      status: "STATUS" // pending || succeeded || reverted
    }
  }
]
```

#### get.l2.deployments

**Request Body**

```js
{
  address: "ACCOUNT"
}
```

**Response Body**

```js
[
  {
    hash: "TRANSACTION_HASH",
    blockNumber: "BLOCK_NUMBER",
    from: "FROM_ACCOUNT",
    timeStamp: "BLOCK_TIMESTAMP",
    contractAddress: "CONTRACT_ADDRESS"
  }
]
```

#### get.l2.crossdomainmessage

**Request Body**

```js
{
  hash: "HASH"
}
```

**Response Body**

```js
{
  hash: "TRANSACTION_HASH",
  blockNumber: "BLOCK_NUMBER",
  from: "FROM_ACCOUNT",
  to: "TO_ACCOUNT"
  timeStamp: "BLOCK_TIMESTAMP",
  crossDomainMessage: "CROSS_DOMAIN_MESSAGE", // whether the transaction sent cross domain message
  crossDomainMessageFinalize: "CROSS_DOMAIN_MESSAGE_FINALIZED", // whether the cross domain message is finalized on L1
  crossDomainMessageSendTime: "CROSS_DOMAIN_MESSAGE_FINALIZED_TIME", // when the cross domain message is finalized
  crossDomainMessageEstimateFinalizedTime: "ESTIMATE_CROSS_DOMAIN_MESSAGE_FINALIZED_TIME",
  fastRelay: "FAST_RELAY" // Whether the message is using the fast message relayer
  l1Hash: "L1_HASH", // L1 hash of the cross domain message
  l1BlockNumber: "L1_BLOCK_NUMBER",
  l1BlockHash: "L1_BLOCK_HASH",
  l1From: "L1_FROM",
  l1To: "L1_TO"
}
```


## Description
Script'll subscribe l1 and l2. Every new block, callback'll get balance of l1 pool and l2 pool, then log to console. Datadog agent can collect logs from docker host.

## How to setup
1. Create .env follow example:
```
NODE_ENV=rinkeby
L1_NODE_WEB3_WS=ws://localhost:9545
L2_NODE_WEB3_WS=ws://localhost:8546
L1_LIQUIDITY_POOL_ADDRESS=0x2b57c4aB6D64a2befcb67D46bdc302809418bd1c
L2_LIQUIDITY_POOL_ADDRESS=0x1c7F686451CE532735677f9A70d1831a653d7035
```
2. run `npm start`

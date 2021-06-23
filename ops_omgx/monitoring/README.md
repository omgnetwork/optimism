## Description
Script'll subscribe l1 and l2. Every new block, callback'll get balance of l1 pool and l2 pool, then log to console. Datadog agent can collect logs from docker host.

## How to setup
1. Create .env follow example:
```
NODE_ENV=rinkeby
L1_NODE_WEB3_WS=ws://localhost:9545
L2_NODE_WEB3_WS=ws://localhost:8546
L1_LIQUIDITY_POOL_ADDRESS=0x1383fF5A0Ef67f4BE949408838478917d87FeAc7
L2_LIQUIDITY_POOL_ADDRESS=0x88b3743A9e1FdB3C8C92Cec7A6A370c1403c7C60
RELAYER_ADDRESS=0x3C8b7FdbF1e5B2519B00A8c9317C4BA51d6a4f9d
SEQUENCER_ADDRESS=0xE50faB5E5F46BB3E3e412d6DFbA73491a2D97695
RECONNECT_TIME=10000 // delay time to reconect provider
```
2. run `npm start`

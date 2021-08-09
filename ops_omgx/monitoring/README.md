## Description
Script'll subscribe l1 and l2. Every new block, callback'll get balance of l1 pool and l2 pool, then log to console. Datadog agent can collect logs from docker host.

## How to setup monitoring
1. Create .env follow example:
    ```
    NODE_ENV=rinkeby
    APP_METHOD=monitoring // method name for monitoring service
    L1_NODE_WEB3_WS=ws://localhost:9545
    L2_NODE_WEB3_WS=ws://localhost:8546
    L1_LIQUIDITY_POOL_ADDRESS=0x1383fF5A0Ef67f4BE949408838478917d87FeAc7
    L2_LIQUIDITY_POOL_ADDRESS=0x88b3743A9e1FdB3C8C92Cec7A6A370c1403c7C60
    RELAYER_ADDRESS=0x494Ae1fCd178e0DBA5a3B32D9324C90e47D88AA8
    SEQUENCER_ADDRESS=0xE48E5b731FAAb955d147FA954cba19d93Dc03529
    PROPOSER_ADDRESS=0x7f3cDbe9906Fd57373e8d18AaA159Fc713f379b0
    FAST_RELAYER_ADDRESS=0x81922840527936c3453c99a81dBd4b13d7363722
    MONITORING_RECONNECT_SECS=10 // delay time to reconect provider
    ```
2. run `npm start`

## How to setup dummy-transaction
1. Create .env follow example:
    ```
    NODE_ENV=rinkeby
    APP_METHOD=dummy // method name for dummy transaction service
    L1_NODE_WEB3_URL=https://rinkeby.infura.io/v3/d64a23da1a714a0f9f8bf6c9352235a8
    L2_NODE_WEB3_URL=http://ec2-54-226-193-17.compute-1.amazonaws.com:8545
    L1_LIQUIDITY_POOL_ADDRESS=0x473d2bbF979D0BFA39EBAB320c3216408386e68d
    L2_LIQUIDITY_POOL_ADDRESS=0x1eCD5FBbb64F375A74670A1233CfA74D695fD861
    WALLET_PRIVATE_KEY=01d2b17d3c081725b5bcb2afd11ad0d4a459624c6f87c336aeedd3e7a97dc87c
    L2_GAS_LIMIT=3000000
    L1_ADDRESS_MANAGER=0x93A96D6A5beb1F661cf052722A1424CDDA3e9418
    L2_DEPOSITED_ERC20=0x0e52DEfc53ec6dCc52d630af949a9b6313455aDF
    DUMMY_DELAY_MINS=30 // delay after every transaction in minutes
    DUMMY_ETH_AMOUNT=0.0005 // transaction amount in eth
    DUMMY_WATCHER_TIMEOUT_MINS=15 // time out when transaction error in minutes
    ```
2. run `npm start`

## How to deploy image
1. Build new image: `docker build -t enyalabs/omgx-monitor:{version-number} .`
2. Push new image to docker hub: `docker push enyalabs/omgx-monitor:{version-number}`

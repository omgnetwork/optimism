# Service maintenance

## Docker containers

We have six main containers and five secondary containers that provide the monitor and subgraph services.

### Main containers

* [omgx/deployer-rinkeby](https://hub.docker.com/layers/omgx/deployer-rinkeby/production-v1/images/sha256-8ca509eb7a830ee862318225a2d5558f868d139a745edaff448ec3ccb90965e8?context=repo)

  It serves `addresses.json` and `state-dump.latest.json` files so that l2geth container and data-transport-layer can fetch the `ADDRESS_MANAGER_ADDRESS` and `ABI` of L1 pre-deployed contracts.

  Normally, this container uses about **15MB** memory.

* [omgx/l2geth](https://hub.docker.com/layers/156092279/omgx/l2geth/production-v1/images/sha256-d5f099b01629da9ca93af25705d326d90bb7d100695e0a66cc920871705ff890?context=repo)

  The l2geth container takes around 500MB memory. For safety and maintenance reasons, we should allocate **1GB** of memory to this service.

  > Note: We didn't see a large increase in memory usage of **l2geth** when we ran the performance test.

* [omgx/data-transport-layer](https://hub.docker.com/layers/156092207/omgx/data-transport-layer/production-v1/images/sha256-07d4415aab46863b8c7996c1c40f6221f3ac3f697485ccc262a3a6f0478aa4fb?context=repo)

  The data-transport-layer syncs L1 and provides the index service. It only uses about **50MB** of memory.

* [omgx/batch-submitter](https://hub.docker.com/layers/156091606/omgx/batch-submitter/production-v1/images/sha256-b3e61c1350b94cca73853867e1267e6f0e197ffbf7661f76c5c373e85eb3e70f?context=repo)

  The batch submitter submits TX and state root batches to CTC and SCC contracts. It takes about **100MB** of memory.

* [omgx/message-relayer](https://hub.docker.com/layers/156091959/omgx/message-relayer/production-v1/images/sha256-52ae4dbe41895c331ee3dc05955ad8c50c1319f91aaf3b4747d3ded2305382b4?context=repo) and [omgx/message-relayer-fast](https://hub.docker.com/layers/156091184/omgx/message-relayer-fast/production-v1/images/sha256-4e973130ca9cd5704ae3ce83f8c01682851b73835753268203bba91df7213167?context=repo)

  Both message relayers need at least **1GB** of memory.

### Secondary containers

Our main services won't be affected by these secondary services, so it's safe for them to reboot when they have any problems.

* Graph-node, postgres, ipfs
* omgx/gas-oracle
* omgx/transaction-monitor
* enyalabs/omgx-monitor

## Memory usage and recommendation

|         Container         | Minimum memory usage | Recommanded memory allocation |
| :-----------------------: | :------------------: | :---------------------------: |
|   omgx/deployer-rinkeby   |         15MB         |             128MB             |
|        omgx/l2geth        |        500MB         |            **2GB**            |
| omgx/data-transport-layer |        100MB         |             512MB             |
|   omgx/batch-submitter    |         1GB          |            **2GB**            |
|   omgx/message-relayer    |         1GB          |            **2GB**            |
| omgx/message-relayer-fast |         1GB          |            **2GB**            |

> NOTE:
>
> `omgx/l2geth`: it's the most important service, so we should give as much memory as we can.

## Possible errors

* [omgx/batch-submitter](https://hub.docker.com/layers/156091606/omgx/batch-submitter/production-v1/images/sha256-b3e61c1350b94cca73853867e1267e6f0e197ffbf7661f76c5c373e85eb3e70f?context=repo)

  The queued data in the `CTC-queue` contract might not match to the data of the L1 block. We have noticed the following situations:

  * `The timestamp of the queued element` >` timestamp of L1 block` and `block number of the queued element` === `block number of L1 block`.
  * `The timestamp of the queued element` >` timestamp of L1 block` and `block number of the queued element` > `block number of L1 block`.

  The second issue can be fixed by enabling the [AUTO_FIX_BATCH_OPTIONS_CONF](https://github.com/omgnetwork/optimism/blob/8fd511e608744f182f8a10e6fb5aa5d27f581860/packages/batch-submitter/src/exec/run-batch-submitter.ts#L241) to `fixMonotonicity`.

  Please comment out [fixedBatch.push(ele)](https://github.com/omgnetwork/optimism/blob/8fd511e608744f182f8a10e6fb5aa5d27f581860/packages/batch-submitter/src/batch-submitter/tx-batch-submitter.ts#L492) and enable [AUTO_FIX_BATCH_OPTIONS_CONF](https://github.com/omgnetwork/optimism/blob/8fd511e608744f182f8a10e6fb5aa5d27f581860/packages/batch-submitter/src/exec/run-batch-submitter.ts#L241) to `fixSkippedDeposits` for the first issue.

  > NOTE:
  >
  > You don't have to stop the batch-submitter in EC2 or ECS to fix the issue. Please add `.env` file to `packages/batch-submitter` and fix it via running the batch-submitter locally:
  >
  > ```bash
  > yarn build
  > yarn start
  > ```
  >
  > Once the local batch submitter pushes the correct queued elements to CTC, the production one will start to work.


L2 geth genesis structure:

```go
// Genesis specifies the header fields, state of a genesis block. It also defines hard
// fork switch-over blocks through the chain configuration.
type Genesis struct {
	Config     *params.ChainConfig `json:"config"`
	Nonce      uint64              `json:"nonce"`
	Timestamp  uint64              `json:"timestamp"`
	ExtraData  []byte              `json:"extraData"`
	GasLimit   uint64              `json:"gasLimit"   gencodec:"required"`
	Difficulty *big.Int            `json:"difficulty" gencodec:"required"`
	Mixhash    common.Hash         `json:"mixHash"`
	Coinbase   common.Address      `json:"coinbase"`
	Alloc      GenesisAlloc        `json:"alloc"      gencodec:"required"`

	// These fields are used for consensus tests. Please don't use them
	// in actual genesis blocks.
	Number     uint64      `json:"number"`
	GasUsed    uint64      `json:"gasUsed"`
	ParentHash common.Hash `json:"parentHash"`

	// OVM Specific, used to initialize the l1XDomainMessengerAddress
	// in the genesis state
	L1FeeWalletAddress            common.Address `json:"-"`
	L1CrossDomainMessengerAddress common.Address `json:"-"`
	AddressManagerOwnerAddress    common.Address `json:"-"`
	GasPriceOracleOwnerAddress    common.Address `json:"-"`
	L1StandardBridgeAddress       common.Address `json:"-"`
	ChainID                       *big.Int       `json:"-"`
}
```

## How to restart Mainnet Service

### Connect to EC2 Instance

```
ssh -i "KEY.pem" ubuntu@IP.compute-1.amazonaws.com
```

### Update Parameters

All docker configuration files are in `omgx-mainnet/production-v1`. There are four files:

*  `docker-compose-gas-oracle.yml` - Gas Oracle Service

* `docker-compose-mainnet.yml` - Main Service

  It has `deployer`, `omgx-deployer`, `data-transport-layer` and `l2geth` services

* `docker-compose-mainnet-relative.yml` - Secondary service

  It has `batch-submitter`, `message-relayer` and `message-relayer-fast` service

* `docker-compose-transaction-monitor.yml` - Main Monitor service

* `docker-compose-monitor.yml` - Datadog Monitor Service

If you don't update or add the `FROM_L2_TRANSACTION_INDEX` in  `docker-compose-mainnet-relative.yml`  before restarting the service, the `message relayer` and `message relayer fast` will scan from the L2 0 block or L2 block number that is set up last time. It takes a really long time to sync up the l2 block. 

[**RECOMMENDATION**]

The `FROM_L2_TRANSACTION_INDEX` should be set to the correct L2 block which doesn‘t have any pending messages before that block. Thus, the `FROM_L2_TRANSACTION_INDEX` variables for the `message relayer` and `message relayer fast` are different.

### Restart Services

```bash
cd omgx-mainnet/production-v1
docker-compose -f [docker-compose.yml] down
```

If you want to delete volume of dtl, please run

```bash
cd /mnt/efs
sudo rm -rf ./dtl
```

Restart services via:

```bash
docker-compose -f [docker-compose.yml] up -d
```

> NEVER DELETE `geth` FOLDER IN `/mnt/efs` !


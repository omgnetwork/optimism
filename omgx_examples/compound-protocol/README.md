# Deploying on Rinkeby-Boba Network


Instructions or Deploying Compound Governance Protocol on Rinkeby-Boba.
First create a `.env` file that follows the structure of `.env.example`. This file should contained a mnemonic phrase, and the private key linked to mnemonic phrase.

```bash
$ yarn
$ yarn compile:ovm
```

You should expect the following output:

```bash
yarn run v1.22.10
$ truffle compile --config truffle-config-ovm.js

Compiling your contracts...
===========================
> Compiling ./contracts/BaseJumpRateModelV2.sol
> Compiling ./contracts/CCompLikeDelegate.sol
> Compiling ./contracts/CDaiDelegate.sol
> Compiling ./contracts/CErc20.sol
> Compiling ./contracts/CErc20Delegate.sol
> Compiling ./contracts/CErc20Delegator.sol
> Compiling ./contracts/CErc20Immutable.sol
> Compiling ./contracts/CEther.sol
> Compiling ./contracts/CToken.sol
> Compiling ./contracts/CTokenInterfaces.sol
> Compiling ./contracts/CarefulMath.sol
> Compiling ./contracts/Comptroller.sol
> Compiling ./contracts/ComptrollerG1.sol
> Compiling ./contracts/ComptrollerG2.sol
> Compiling ./contracts/ComptrollerG3.sol
> Compiling ./contracts/ComptrollerG4.sol
> Compiling ./contracts/ComptrollerG5.sol
> Compiling ./contracts/ComptrollerG6.sol
> Compiling ./contracts/ComptrollerInterface.sol
> Compiling ./contracts/ComptrollerStorage.sol
> Compiling ./contracts/DAIInterestRateModelV3.sol
> Compiling ./contracts/EIP20Interface.sol
> Compiling ./contracts/EIP20NonStandardInterface.sol
> Compiling ./contracts/ErrorReporter.sol
> Compiling ./contracts/Exponential.sol
> Compiling ./contracts/ExponentialNoError.sol
> Compiling ./contracts/Governance/Comp.sol
> Compiling ./contracts/Governance/GovernorAlpha.sol
> Compiling ./contracts/Governance/GovernorBravoDelegate.sol
> Compiling ./contracts/Governance/GovernorBravoDelegator.sol
> Compiling ./contracts/Governance/GovernorBravoInterfaces.sol
> Compiling ./contracts/InterestRateModel.sol
> Compiling ./contracts/JumpRateModel.sol
> Compiling ./contracts/JumpRateModelV2.sol
> Compiling ./contracts/LegacyInterestRateModel.sol
> Compiling ./contracts/LegacyJumpRateModelV2.sol
> Compiling ./contracts/Lens/CompoundLens.sol
> Compiling ./contracts/Maximillion.sol
> Compiling ./contracts/Migrations.sol
> Compiling ./contracts/PriceOracle.sol
> Compiling ./contracts/Reservoir.sol
> Compiling ./contracts/SafeMath.sol
> Compiling ./contracts/SimplePriceOracle.sol
> Compiling ./contracts/Timelock.sol
> Compiling ./contracts/Unitroller.sol
> Compiling ./contracts/WhitePaperInterestRateModel.sol


> Artifacts written to /Users/jesusmeza/Developer/omgx/optimism/omgx_examples/compound-protocol/build-ovm
> Compiled successfully using:
   - solc: 0.5.16
```

Then deploy on the contracts onto Rinkeby L2

```bash
$ yarn migrate:boba
```

You should expect output similar to the following:

```bash
yarn run v1.22.10
$ truffle migrate --network boba_rinkeby --config truffle-config-ovm.js

Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



Starting migrations...
======================
> Network name:    'boba_rinkeby'
> Network id:      28
> Block gas limit: 11000000 (0xa7d8c0)


1_migration.js
==============
STARTING HERE
0x21A235cf690798ee052f54888297Ad8F46D3F389

   Deploying 'Comp'
   ----------------
   > transaction hash:    0x65d47be7ffd6f138fd806dbcc461eab9500a0f9dceb64a81e1b4fe040432ed2f
   > Blocks: 0            Seconds: 0
   > contract address:    0xef459fad4B8F53c05dE251Ad838593A98C6671fc
   > block number:        22418
   > block timestamp:     1630446838
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.280675607953
   > gas used:            3962954 (0x3c784a)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.00005944431 ETH

deployed comp

   Deploying 'Timelock'
   --------------------
   > transaction hash:    0xa1d97c9c63b7b3798fef5b9f3990bad133f5a89e9eb8cfbc2eec3cc614d852cc
   > Blocks: 0            Seconds: 0
   > contract address:    0x1099876c30f541F8c001872198B9094b976DF687
   > block number:        22419
   > block timestamp:     1630446838
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.268617107953
   > gas used:            3527769 (0x35d459)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.000052916535 ETH

deployed timelock

   Deploying 'GovernorBravoDelegate'
   ---------------------------------
   > transaction hash:    0x0456aff90c9f1c99477c7b7ed5330896255b4651f026822f2cf91e05891e3c45
   > Blocks: 0            Seconds: 0
   > contract address:    0x0c2678D4EB7EaC9c334Fb0d2b6d10Ec1dbf2cE9A
   > block number:        22420
   > block timestamp:     1630446838
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.256558607953
   > gas used:            8712102 (0x84efa6)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.00013068153 ETH

deployed delegate

   Deploying 'GovernorBravoDelegator'
   ----------------------------------
   > transaction hash:    0x84fd4a347a9a2396eaae42179b2bb8c2f6b35e7437122e01f25889b90b4fd17c
   > Blocks: 0            Seconds: 0
   > contract address:    0x53E691925D847843D50F7864321651858197080F
   > block number:        22421
   > block timestamp:     1630446838
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.244500107953
   > gas used:            2044073 (0x1f30a9)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.000030661095 ETH

deployed delegator
   > Saving artifacts
   -------------------------------------
   > Total cost:       0.00027370347 ETH


Summary
=======
> Total deployments:   4
> Final cost:          0.00027370347 ETH


✨  Done in 25.21s.
```


## Initiating Timelock and submiting a proposal
First paste the contract addresses into the file `networks/rinkeby-boba.json`. Using the addresses above the file should look as follows.

```json
{
"Comp":"0xef459fad4B8F53c05dE251Ad838593A98C6671fc",
"Timelock":"0x1099876c30f541F8c001872198B9094b976DF687",
"GovernorBravoDelegate":"0x0c2678D4EB7EaC9c334Fb0d2b6d10Ec1dbf2cE9A",
"GovernorBravoDelegator":"0x53E691925D847843D50F7864321651858197080F"
}
```


### Initiating Timelock
This step is necessary in order to link the Governor contract to the Timelock contract.
Run the following command. Note running this program may take some time please be patient.
```bash
$ yarn initiateComp
```

The output should look similar to the following:

```bash
yarn run v1.22.10
$ node scripts/initiateCompound.js
-----------Initiating Compound-----------

Current Time:  1630448203
Time at which transaction can be executed: 1630448503



-----------queueing setPendingAdmin-----------

queued setPendingAdmin
execute setPendingAdmin
Attempt: 1
	Timestamp: 1630448398
	Transaction hasn't surpassed time lock

Attempt: 2
	Timestamp: 1630448593
	executed setPendingAdmin



-----------queueing initiate-----------

Current Time:  1630448593
Time at which transaction can be executed: 1630448893
queued initiate
execute initiate
Attempt: 1
	Timestamp: 1630448788
	Transaction hasn't surpassed time lock

Attempt: 2
	Timestamp: 1630448788
	Transaction hasn't surpassed time lock

...

Attempt: 18
	Timestamp: 1630448788
	Transaction hasn't surpassed time lock

Attempt: 19
	Timestamp: 1630449178
Executed initiate
✨  Done in 836.14s.
```

## Submitting a Proposal, Voting, and Executing
This section will guide you in submitting a poroposal, voting on it, and executing it. The file `scripts/submitProposal.js` does all of this. The proposal that it will submit is one that reduces the number of votes necessary to submit a proposal to 65000.

Running this script will take time, approximately 15 minutes.

```bash
$ yarn submitProposal
```
You should expect output similar to the following:

```bash
yarn run v1.22.10
$ node scripts/submitProposal.js
Comp power:  10000000000000000000000000
current votes:  10000000000000000000000000
Wait 5 minutes to make sure votes are processed.
Proposing
Casting Votes
Attempt: 1
	Voting is closed

Attempt: 2
	Voting is closed

Attempt: 3
	Voting is closed

Attempt: 4
	Voting is closed

Attempt: 5
	Voting is closed

Attempt: 6
	Voting is closed

Attempt: 7
	Voting is closed

Attempt: 8
	Voting is closed

Attempt: 9
Success: vote cast
Queuing Proposal
Attempt: 1
	proposal can only be queued if it is succeeded
Attempt: 2
	proposal can only be queued if it is succeeded
Attempt: 3
	proposal can only be queued if it is succeeded
Attempt: 4
	proposal can only be queued if it is succeeded
Attempt: 5
	proposal can only be queued if it is succeeded
Attempt: 6
	proposal can only be queued if it is succeeded
Attempt: 7
	proposal can only be queued if it is succeeded
Attempt: 8
	proposal can only be queued if it is succeeded
Attempt: 9
	proposal can only be queued if it is succeeded
Attempt: 10
	proposal can only be queued if it is succeeded
Attempt: 11
	proposal can only be queued if it is succeeded
Attempt: 12
	proposal can only be queued if it is succeeded
Attempt: 13
	proposal can only be queued if it is succeeded
Attempt: 14
	proposal can only be queued if it is succeeded
Attempt: 15
	proposal can only be queued if it is succeeded
Attempt: 16
	proposal can only be queued if it is succeeded
Attempt: 17
	proposal can only be queued if it is succeeded
Attempt: 18
	proposal can only be queued if it is succeeded
Attempt: 19
	proposal can only be queued if it is succeeded
Attempt: 20
	proposal can only be queued if it is succeeded
Attempt: 21
	proposal can only be queued if it is succeeded
Attempt: 22
Success: Queued
Executing Proposal
Attempt: 1
Success: Executed
2
[
  BigNumber { _hex: '0x02', _isBigNumber: true },
  '0x21A235cf690798ee052f54888297Ad8F46D3F389',
  BigNumber { _hex: '0x612eb722', _isBigNumber: true },
  BigNumber { _hex: '0x8c9598', _isBigNumber: true },
  BigNumber { _hex: '0x8c95a2', _isBigNumber: true },
  BigNumber { _hex: '0x084595161401484a000000', _isBigNumber: true },
  BigNumber { _hex: '0x00', _isBigNumber: true },
  BigNumber { _hex: '0x00', _isBigNumber: true },
  false,
  true,
  id: BigNumber { _hex: '0x02', _isBigNumber: true },
  proposer: '0x21A235cf690798ee052f54888297Ad8F46D3F389',
  eta: BigNumber { _hex: '0x612eb722', _isBigNumber: true },
  startBlock: BigNumber { _hex: '0x8c9598', _isBigNumber: true },
  endBlock: BigNumber { _hex: '0x8c95a2', _isBigNumber: true },
  forVotes: BigNumber { _hex: '0x084595161401484a000000', _isBigNumber: true },
  againstVotes: BigNumber { _hex: '0x00', _isBigNumber: true },
  abstainVotes: BigNumber { _hex: '0x00', _isBigNumber: true },
  canceled: false,
  executed: true
]
State is :  Executed
[["0x53E691925D847843D50F7864321651858197080F"],[{"type":"BigNumber","hex":"0x00"}],["_setProposalThreshold(uint256)"],["0x000000000000000000000000000000000000000000000dc3a8351f3d86a00000"]]
Timestamp :  1630451490
BlockNum :  22500
Proposal Threshold :  65000000000000000000000
proposalId :  0x02
✨  Done in 611.37s.
```



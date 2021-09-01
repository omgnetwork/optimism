- [DAO explained](#dao-explained)
  * [Overview](#overview)
    + [Token](#token)
    + [Governor Bravo Delegate](#governor-bravo-delegate)
    + [Governor Bravo Delegator](#governor-bravo-delegator)
    + [Timelock](#timelock)
  * [Deployment](#deployment)
  * [Changes to Compound's Governance Contracts](#changes-to-compound-s-governance-contracts)
  * [Testing Notes](#testing-notes)
- [Deploying on Rinkeby-Boba Network and Initiating](#deploying-on-rinkeby-boba-network-and-initiating)
  * [Submitting a Proposal, Voting, and Executing](#submitting-a-proposal--voting--and-executing)
  
# DAO explained

## Overview

The DAO is a fork of Compound Finance's current governance module (Governor Bravo), which is comprised of 4 main contracts:

### Token

`Comp.sol` encodes the token, which follows the ERC-20 standard and grants token holders voting power proportional to the number of tokens they own. These votes can be delegated to either themselves or a trusted delegate who will be able to vote on proposals on the token owner's behalf.

### Governor Bravo Delegate

`GovernorBravoDelegate.sol` contains the current implementation of the DAO. This contract allows token holders with voting power greater than the proposal threshold (between 50,000 - 100,000 votes) to create proposals that others can vote on. After a voting delay (up to 1 week) for participants to review the proposal, the voting period opens for at least 1 day and can last up to 2 weeks. For a proposal to pass, the number of for votes must be greater than the number of against votes and the number of for votes must meet the quorum of 400,000 votes. Once a proposal passes, it can be queued and then executed to go into effect.

### Governor Bravo Delegator

`GovernorBravoDelegator.sol` is the proxy that allows the DAO to be upgradeable. This contract is simply a wrapper that points to an implementation (currently `GovernorBravoDelegate`), but can be changed to a newer implementation of the DAO when appropriate.

### Timelock

`Timelock.sol` delays the implementation of actions passed by the governance module. The minimum delay is 2 days and can be increased up to 30 days for major changes. The purpose of this security feature is to ensure that the community is given enough time to react to and prepare for changes that are passed.

## Deployment

The deployment script can be found in `migrations/1_deploy.js` and can be used to deploy the DAO and provides examples of basic calls that can be made to the governance contracts.

First, we deploy the token and pass in the developer address which receives the initial supply of tokens. Then, we deploy the timelock with the developer address and chosen timelock delay (between 2 and 30 days). The developer address is set as the temporary admin of the timelock. Next, we deploy the GovernorBravoDelegate contract. Finally, we pass in the timelock address, token address, developer address, GovernorBravoDelegate address, voting period, voting delay, and proposal threshold to deploy GovernorBravoDelegator.

After deploying these contracts, we set GovernorBravoDelegator as the admin of the timelock contract by first queueing this transaction. The function `queueTransaction` takes in 5 arguments: target contract address, value of ether, function signature, function data, and estimated time of arrival (ETA) where the ETA must satisfy the timelock delay. Once the transaction is queued and the ETA has arrived, the transaction can be executed by calling the function `executeTransaction` with the same 5 arguments. Note: there is a grace period of 14 days from the ETA where the transaction must be executed before it becomes stale.

Once GovernorBravoDelegator has been set as the admin of the Timelock contract, the `_initiate` function can be called which allows proposals to be created and the BOBA DAO is live!

## Changes to Compound's Governance Contracts

In `GovernorBravoDelegate.sol`, modify the `_initiate` function:

- Change line 326 to `proposalCount = 1;`
- Delete line 321
- Delete parameter (`address governorAlpha`) in line 323

```
    /**
      * @notice Initiate the GovernorBravo contract
      * @dev Admin only. Sets initial proposal id which initiates the contract, ensuring a continuous proposal id count
      */
    function _initiate() external {
        require(msg.sender == admin, "GovernorBravo::_initiate: admin only");
        require(initialProposalId == 0, "GovernorBravo::_initiate: can only initiate once");
        proposalCount = 1;
        initialProposalId = proposalCount;
        timelock.acceptAdmin();
    }
```

In `GovernorBravoInterfaces.sol`, delete `GovernorAlpha` Interface:

- Delete lines 179-182

## Testing Notes

- MINIMUM_DELAY in Timelock.sol set to 0 to allow for timely testing
- MIN_VOTING_PERIOD in GovernorBravoDelegate.sol set to 0 to allow for timely testing
-

# Deploying on Rinkeby-Boba Network and Initiating

Instructions for Deploying Compound Governance Protocol on Rinkeby-Boba.

First create a `.env` file that follows the structure of `.env.example`. Then compile your contracts, which will also create the build artifacts in `build-ovm` folder.

```bash
$ yarn
$ yarn compile:ovm
```

You should expect the following output:

```bash
yarn run v1.22.11
$ truffle compile --config truffle-config-ovm.js

Compiling your contracts...
===========================
> Compiling ./contracts/Comp.sol
> Compiling ./contracts/GovernorBravoDelegate.sol
> Compiling ./contracts/GovernorBravoDelegator.sol
> Compiling ./contracts/GovernorBravoInterfaces.sol
> Compiling ./contracts/SafeMath.sol
> Compiling ./contracts/Timelock.sol

> Artifacts written to optimism/omgx_examples/compound-simple/build-ovm
> Compiled successfully using:
   - solc: 0.5.16

✨  Done in 10.05s.

```

Next, deploy the DAO to Boba with `yarn migrate:rinkeby_l2`. **THIS WILL TAKE TIME - AT LEAST 6 MINUTES** You should expect the following output:

```bash
yarn run v1.22.10
$ truffle migrate --network rinkeby_l2 --config truffle-config-ovm.js

Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



Starting migrations...
======================
> Network name:    'rinkeby_l2'
> Network id:      28
> Block gas limit: 11000000 (0xa7d8c0)


1_migration.js
==============
STARTING HERE
0x21A235cf690798ee052f54888297Ad8F46D3F389

   Replacing 'Comp'
   ----------------
   > transaction hash:    0xebe659bbbdb9ba6be983dc297f979d2a36a827a282f524adb016977777924318
   > Blocks: 0            Seconds: 0
   > contract address:    0x7e5C11814DEfC1Adb8F8a9371334F7c9Fc4a3a7b
   > block number:        22880
   > block timestamp:     1630524555
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.688172744618
   > gas used:            3979070 (0x3cb73e)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.00005968605 ETH

deployed comp

   Replacing 'Timelock'
   --------------------
   > transaction hash:    0xcb4c208e5f45270ab47c24d63b9371306889e0486f1d3e56f36cd4c8167f9165
   > Blocks: 0            Seconds: 0
   > contract address:    0x55D6151B519853aaF38A669b2248221B128E14B9
   > block number:        22881
   > block timestamp:     1630524555
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.676114244618
   > gas used:            3512614 (0x359926)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.00005268921 ETH

deployed timelock

   Replacing 'GovernorBravoDelegate'
   ---------------------------------
   > transaction hash:    0x96048773ffa291828e157f69a0c218c1296af9ca112d370129483930a9bdb699
   > Blocks: 0            Seconds: 0
   > contract address:    0xe1004C6E7f490189F712441846031D76A38E5A49
   > block number:        22882
   > block timestamp:     1630524555
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.664055744618
   > gas used:            8720274 (0x850f92)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.00013080411 ETH

deployed delegate

   Replacing 'GovernorBravoDelegator'
   ----------------------------------
   > transaction hash:    0xf33626d5d9a31ef1fd0127a82c104a03924a19b9180db353b7237c66b062e36d
   > Blocks: 0            Seconds: 0
   > contract address:    0x15fFafE1b7060f6D61ea6Bed004721e2D5be7707
   > block number:        22883
   > block timestamp:     1630524555
   > account:             0x21A235cf690798ee052f54888297Ad8F46D3F389
   > balance:             1.651997244618
   > gas used:            2046983 (0x1f3c07)
   > gas price:           0.015 gwei
   > value sent:          0 ETH
   > total cost:          0.000030704745 ETH

deployed delegator
Queue setPendingAdmin
Time transaction was made: 1630524555
Time at which transaction may be executed: 1630524855
Attempt: 1
	Timestamp: 1630524555
	executed setPendingAdmin
   > Saving artifacts
   -------------------------------------
   > Total cost:      0.000273884115 ETH


Summary
=======
> Total deployments:   4
> Final cost:          0.000273884115 ETH


✨  Done in 320.22s.
```

## Submitting a Proposal, Voting, and Executing

This section will guide you in submitting a proposal, voting on it, and executing it. The file `scripts/submitProposal.js` does all of this. The proposal that it will submit is one that reduces the number of votes necessary to submit a proposal to 65000.

Running this script will take approximately 15 minutes.

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
...

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



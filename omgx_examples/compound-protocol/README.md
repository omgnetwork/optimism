## Deploying on Rinkeby-Boba Network


Instructions or Deploying Compound Governance Protocol on Rinkeby-Boba.
First add

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


FOR QUICK RUN THROUGH....
-------------------------
Make a `.env` file that follows the strucutre of `.env.example`.
Then run `yarn deploy:boba` in terminal.
Copy and paste the contract addresses into `networks/rinkeby-boba.json`.
Then run `node initiateCompound.js` in terminal to initate the Dao.

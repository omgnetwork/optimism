# OMGX First Steps

## 1. To deploy on a LOCAL system

First, spin up a local system as usual:

```bash
$ cd optimism
$ yarn clean
$ yarn build
$ cd ops
$ docker-compose down -v
$ docker-compose build
$ docker-compose up
```

Second, run:

```bash
$ yarn compile:ovm
```

This will compile the contract

```
Compiling 1 file with 0.7.6
contracts/ERC20.sol:47:5: Warning: Visibility for constructor is ignored. If you want the contract to be non-deployable, making it "abstract" is sufficient.
    constructor(
    ^ (Relevant source part starts here and spans across multiple lines).

Compilation finished successfully
✨  Done in 8.90s.

```

Now, see if it works

```bash
$ yarn test:integration:ovm
```

```bash
yarn run v1.22.10
$ hardhat test --network optimism


  ERC20
    ✓ should have a name
    ✓ should have a total supply equal to the initial supply (42ms)
    ✓ should give the initial supply to the creator's address
    transfer(...)
      ✓ should revert when the sender does not have enough balance (96ms)
      ✓ should succeed when the sender has enough balance (235ms)
    transferFrom(...)
      ✓ should revert when the sender does not have enough of an allowance (38ms)
      ✓ should succeed when the owner has enough balance and the sender has a large enough allowance (181ms)


  7 passing (3s)

✨  Done in 5.48s.
```

Finally, deploy the contract, 

```
$ deploy:ovm
```

```bash
yarn run v1.22.10
$ hardhat deploy --network optimism
Nothing to compile
deploying "ERC20" (tx: 0x87d1425bdc08cb41967f96d9b5f85bdb2f24dc430c4d73d64349e1df4ffa3a9d)...: deployed at 0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE with 1982889 gas
✨  Done in 1.37s.
```

## 2. To deploy on RINKEBY

First, run:

```bash
$ yarn compile:omgx
```

This will compile the contract, Now, see if it works

```bash
$ yarn test:integration:omgx
```

**Note that two tests will fail, which reflects how we set the fees on rinkeby.omgx.network.**

```bash
$ hardhat test --network omgx_rinkeby


  ERC20
    ✓ should have a name (1420ms)
    ✓ should have a total supply equal to the initial supply (2379ms)
    ✓ should give the initial supply to the creator's address (1417ms)
    transfer(...)
      1) should revert when the sender does not have enough balance
      ✓ should succeed when the sender has enough balance (5637ms)
    transferFrom(...)
      2) should revert when the sender does not have enough of an allowance
      ✓ should succeed when the owner has enough balance and the sender has a large enough allowance (9318ms)


  5 passing (47s)
  2 failing

  1) ERC20
       transfer(...)
         should revert when the sender does not have enough balance:

      AssertionError: Expected transaction to be reverted
      + expected - actual

      -Transaction NOT reverted.
      +Transaction reverted.
      
  

  2) ERC20
       transferFrom(...)
         should revert when the sender does not have enough of an allowance:

      AssertionError: Expected transaction to be reverted
      + expected - actual

      -Transaction NOT reverted.
      +Transaction reverted.

error Command failed with exit code 2.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

Finally, deploy the contract, 

```
$ deploy:ovm
```

```bash
yarn run v1.22.10
$ hardhat deploy --network omgx_rinkeby
Nothing to compile
deploying "ERC20" (tx: 0xe0eb90b6edca6a6d5a9c965dd59afd45ef26d36c292e031c49e4cbcca0fa3feb)...: deployed at 0x4A679253410272dd5232B3Ff7cF5dbB88f295319 with 1902037 gas
✨  Done in 5.48s.
```
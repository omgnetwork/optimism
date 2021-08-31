# The Boba DAO basic contracts

1. Install

Install the node_modules.

```
$ yarn
```

2. Provide .env

Then, provide a `.env` with the private keys you want to use for deployment and testing. These private keys need to be funded.

3. Spin up local L1/L2

Spin up the local `develop` stack as usual.

4. Compile and deploy the contracts. For example, if you want to deploy to the local L1, ...

```
yarn migrate:local_l1
```

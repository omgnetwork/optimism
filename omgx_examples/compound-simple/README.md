1. Install the node_modules.

```
yarn
```

2. Then, provide a `.env` with the private keys you want to use for deployment and testing. These private keys need to be funded.

3. Spin up the local `develop` stack as usual.

4. Compile and deploy the contracts. For example,

```
yarn migrate:local_l1
```

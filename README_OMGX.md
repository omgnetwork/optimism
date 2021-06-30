# Please see the main README.MD for the basics. 

- [Development Quick Start](#development-quick-start)
  * [Dependencies](#dependencies)
  * [Setup](#setup)
  * [Building the TypeScript packages](#building-the-typescript-packages)
  * [Building the rest of the system](#building-the-rest-of-the-system)
    + [Viewing docker container logs](#viewing-docker-container-logs)
  * [Running Tests](#running-tests)
    + [Running unit tests](#running-unit-tests)
    + [Running integration tests](#running-integration-tests)

## Development Quick Start

### Dependencies

You'll need the following:

* [Git](https://git-scm.com/downloads)
* [NodeJS](https://nodejs.org/en/download/)
* [Yarn](https://classic.yarnpkg.com/en/docs/install)
* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

Clone the repository, open it, and install nodejs packages with `yarn`:

```bash
git clone git@github.com:omgnetwork/optimism.git
cd optimism
yarn install
```

### Building the TypeScript packages

To build all of the [TypeScript packages](./packages), run:

```bash
yarn clean
yarn build
```

Packages compiled when on one branch may not be compatible with packages on a different branch.
**You should recompile all packages whenever you move from one branch to another.**
Use the above commands to recompile the packages.

### Building the rest of the system

If you want to run an Optimistic Ethereum node OR **if you want to run the integration tests**, you'll need to build the rest of the system.

```bash
cd ops
export COMPOSE_DOCKER_CLI_BUILD=1 # these environment variables significantly speed up build time
export DOCKER_BUILDKIT=1
docker-compose build 
docker-compose -f docker-compose-omgx.yml up -V
```

To build individual OMGX services:

```bash
docker-compose -f "docker-compose-omgx-services.yml" build -- omgx_message-relayer-fast
```

Note: First you will have to comment out various dependencies in the `docker-compose-omgx-services.yml`.

If you want to make a change to a container, you'll need to take it down and rebuild it.
For example, if you make a change in l2geth:

```bash
cd ops
docker-compose stop -- l2geth
docker-compose build -- l2geth
docker-compose start l2geth
```

For the typescript services, you'll need to rebuild the `builder` so that the compiled
files are re-generated, and then your service, e.g. for the batch submitter

```bash
cd ops
docker-compose stop -- batch_submitter
docker-compose build -- builder batch_submitter
docker-compose start batch_submitter
```

Source code changes can have an impact on more than one container.
**If you're unsure about which containers to rebuild, just rebuild them all**:

```bash
cd ops
docker-compose down
docker-compose build
docker-compose up
```

Finally, **if you're running into weird problems and nothing seems to be working**, run:

```bash
cd optimism
yarn clean
yarn build
cd ops
docker-compose down -v
docker-compose build
docker-compose up
```

In another terminal window, you can run the integration tests

```bash
docker-compose run integration_tests
```

#### Viewing docker container logs

By default, the `docker-compose up` command will show logs from all services, and that
can be hard to filter through. In order to view the logs from a specific service, you can run:

```bash
docker-compose logs --follow <service name>
```

### Running Tests

Before running tests: **follow the above instructions to get everything built.**

#### Running unit tests

Run unit tests for all packages in parallel via:

```bash
yarn test
```

To run unit tests for a specific package:

```bash
cd packages/package-to-test
yarn test
```

#### Running integration tests

Follow above instructions for building the whole stack.
Build and run the integration tests:

```bash
cd integration-tests
yarn build:integration
yarn test:integration
```

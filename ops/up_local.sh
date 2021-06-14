#!/bin/bash
if ! [ -x "$(command -v yq)" ]; then
  echo 'Error: yq is not installed. brew install yq' >&2
  exit 1
fi
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
ORIGINAL_DOCKERFILE="docker-compose.yml"
DOCKERFILE=docker-compose-omgx.yml
OMGX_DOCKERFILE=docker-compose-omgx-services.yml
#replace all occurances of image: ethereumoptimism/ with image: omgx/
#append :latest tag to all apps
yq eval '(.services.[].image | select(. == "ethereumoptimism*")) |= sub("ethereumoptimism", "omgx")' ${ORIGINAL_DOCKERFILE} | \
yq eval '(.services.[].image) += ":latest"' - \
> ${DOCKERFILE}

if [[ $BUILD == 1 ]]; then
    docker-compose build --parallel -- builder l2geth l1_chain
    docker-compose build --parallel -- deployer dtl batch_submitter relayer integration_tests
    docker image tag ethereumoptimism/builder omgx/builder
    docker image tag ethereumoptimism/hardhat omgx/hardhat
    docker image tag ethereumoptimism/deployer omgx/deployer
    docker image tag ethereumoptimism/data-transport-layer omgx/data-transport-layer
    docker image tag ethereumoptimism/l2geth omgx/l2geth
    docker image tag ethereumoptimism/message-relayer omgx/message-relayer
    docker image tag ethereumoptimism/batch-submitter omgx/batch-submitter
    docker image tag ethereumoptimism/integration-tests omgx/integration-tests
    docker build ../ --file $DIR/docker/Dockerfile.omgx_monorepo --tag omgx/wallet_builder:latest
    docker build ../ --file $DIR/docker/Dockerfile.wallet_deployer --tag omgx/wallet_deployer:latest
else
    echo "This doesn't work just yet."
    docker-compose -f $DIR/$DOCKERFILE -f $DIR/$OMGX_DOCKERFILE pull
fi

if [[ $DAEMON == 1 ]]; then
    docker-compose \
    -f $DIR/$DOCKERFILE \
    -f $DIR/$OMGX_DOCKERFILE \
    up --no-build --detach
else
    docker-compose \
    -f $DIR/$DOCKERFILE \
    -f $DIR/$OMGX_DOCKERFILE \
    up --no-build
fi



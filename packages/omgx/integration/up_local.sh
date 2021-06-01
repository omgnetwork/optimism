#!/bin/bash
# Run everything except the integration tests
if ! [ -x "$(command -v yq)" ]; then
  echo 'Error: yq is not installed. brew install yq' >&2
  exit 1
fi
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null && pwd )"
ORIGINAL_DOCKERFILE="../../..//ops/docker-compose.yml"
DOCKERFILE=docker-compose.yml
#replace all occurances of image: ethereumoptimism/ with image: omgx/
#append :latest tag to all apps
#delete integration_tests service
#locate the path to envs file from current dir (./ops/envs/)
#delete build nodes from images
yq eval '(.services.[].image | select(. == "ethereumoptimism*")) |= sub("ethereumoptimism", "omgx")' ${ORIGINAL_DOCKERFILE} | \
yq eval '(.services.[].image) += ":latest"' - | \
yq eval 'del(.services.integration_tests)' - | \
yq eval '(.services.[].env_file.[] | select(. == "./envs/*")) |= sub("./envs/", "./../../..//ops/envs/")' - | \
yq eval 'del(.services.[].build)' - \
> ${DOCKERFILE}

SERVICES=$(docker-compose \
    -f $DIR/$DOCKERFILE \
    config --services \
    | tr '\n' ' ')

docker-compose \
    -f $DIR/$DOCKERFILE \
    down -v --remove-orphans

docker-compose \
    -f $DIR/$DOCKERFILE \
    up $SERVICES





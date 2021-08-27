#!/usr/bin/env bash

rm -rf ./artifacts
rm -rf ./artifacts-ovm
id=$(docker create omgx/omgx_builder)
docker cp $id:/optimism/packages/omgx/contracts/artifacts ./
docker cp $id:/optimism/packages/omgx/contracts/artifacts-ovm ./
docker rm -v $id

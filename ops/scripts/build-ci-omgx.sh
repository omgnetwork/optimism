# build in 2 steps
function build_images() {
    docker-compose -f docker-compose-omgx.yml -f docker-compose-omgx-services.yml build --parallel -- omgx_wallet_builder bl-wl
    docker-compose -f docker-compose-omgx.yml -f docker-compose-omgx-services.yml build --parallel -- wallet_deployer message-relayer-fast omgx_integration_tests
}

build_images

wait

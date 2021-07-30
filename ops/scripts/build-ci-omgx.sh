# build in 2 steps
function build_images() {
    docker-compose build -- builder
    docker-compose build -- l2geth 
    docker-compose build -- l1_chain
    docker-compose build -- deployer
    docker-compose build -- batch_submitter
    docker-compose build -- dtl
    docker-compose build -- relayer
    docker-compose build -- integration_tests
    docker-compose build -- omgx_deployer
    docker-compose build -- omgx_message-relayer-fast
    docker-compose build -- gas_oracle
}

function build_dependencies() {
    yarn
    yarn build
}

build_dependencies && build_images

wait
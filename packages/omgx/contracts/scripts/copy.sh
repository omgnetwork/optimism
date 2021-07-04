rm -rf ../wallet-frontend/src/deployment &&
mkdir -p ../wallet-frontend/src/deployment &&
#no longer needed because the wallet pulls the addresses from the two http deployer services 
#cp -Rf ./deployment/local ../wallet-frontend/src/deployment &&
#cp -Rf ./deployment/rinkeby ../wallet-frontend/src/deployment &&
cp -Rf ./artifacts ../wallet-frontend/src/deployment/artifacts &&
cp -Rf ./artifacts-ovm ../wallet-frontend/src/deployment/artifacts-ovm &&
cp -Rf ../../contracts/artifacts/* ../wallet-frontend/src/deployment/artifacts &&
cp -Rf ../../contracts/artifacts-ovm/* ../wallet-frontend/src/deployment/artifacts-ovm &&
wait
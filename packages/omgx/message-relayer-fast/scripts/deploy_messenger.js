const { getContractFactory } = require('@eth-optimism/contracts');
const chalk = require('chalk');
require('dotenv').config()

async function main() {
  const env = process.env
  const deployWallet = new ethers.Wallet(env.DEPLOYER_PRIVATE_KEY).connect(
    new ethers.providers.JsonRpcProvider(env.L1_NODE_WEB3_URL)
  )

  const Fatory__OVM_L1CustomCrossDomainMessenger = await ethers.getContractFactory(
    'OVM_L1CrossDomainMessengerFast',
    deployWallet,
  )

  const OVM_L1CustomCrossDomainMessenger = await Fatory__OVM_L1CustomCrossDomainMessenger.deploy()
  await OVM_L1CustomCrossDomainMessenger.deployTransaction.wait()
  console.log(`🌕 ${chalk.red('OVM_L1CustomCrossDomainMessenger deployed to:')} ${chalk.green(OVM_L1CustomCrossDomainMessenger.address)}`)

  // initialize with address_manager
  const initTX = await OVM_L1CustomCrossDomainMessenger.initialize(env.ADDRESS_MANAGER_ADDRESS);
  await initTX.wait()
  console.log(`⭐️ ${chalk.blue('OVM_L1CustomCrossDomainMessenger initialized:')} ${chalk.green(initTX.hash)}`)

  const Fatory__Lib_AddressManager = getContractFactory('Lib_AddressManager', deployWallet)
  const Lib_AddressManager = await Fatory__Lib_AddressManager.attach(env.ADDRESS_MANAGER_ADDRESS)

  const setAddressTX = await Lib_AddressManager.setAddress(
    'OVM_L1CustomCrossDomainMessenger',
    OVM_L1CustomCrossDomainMessenger.address
  )
  await setAddressTX.wait()
  console.log(`⭐️ ${chalk.blue('Lib_AddressManager initialized:')} ${chalk.green(setAddressTX.hash)}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

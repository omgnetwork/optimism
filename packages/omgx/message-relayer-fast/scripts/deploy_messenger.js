require('dotenv').config()

async function main() {
console.log('Deploying ...')

const factory__L1_Messenger = await ethers.getContractFactory('OVM_L1CrossDomainMessengerFast')


const L1_Messenger= await factory__L1_Messenger.deploy()

console.log('Deployed the L1_Alt_Messenger to ' + L1_Messenger.address)

const L1_Messenger_Deployed = await factory__L1_Messenger.attach(L1_Messenger.address)

console.log('Initializing ...')
// initialize with address_manager
const tx0 = await L1_Messenger_Deployed.initialize(
    process.env.ETH1_ADDRESS_RESOLVER_ADDRESS
)
await tx0.wait()
}
main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
  
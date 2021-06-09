const fs = require("fs");
const chalk = require("chalk");
const { deploy } = require('./utils');

//Update these to fit your deployment
const network = 'local';
const deployPrivateKey = "0x754fde3f5e60ef2c7649061e06957c29017fe21032a8017132c0078e37f6193a"

let deployConfig = {
  local: {
    l1RpcUrl: 'http://localhost:9545/',
    l2RpcUrl: 'http://localhost:8545',
    l1MessengerAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    l1ETHAddress: '0x4F53A01556Dc6f120db9a1b4caE786D5f0b5792C',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007',
    l2ETHAddress: '0x4200000000000000000000000000000000000006',
  },
  rinkeby: {
    l1RpcUrl: 'https://rinkeby.infura.io/v3/YOUR_INFURA_KEY_HERE',
    l2RpcUrl: 'https://rinkeby.omgx.network',
    l1MessengerAddress: '0x07A5992d8bE8c271B3baa5320975b6E8d8816e34',
    l1ETHAddress: '0xBa67f68C956178CB7fd1c882f9B882487Fa28898',
    l2MessengerAddress: '0x4200000000000000000000000000000000000007',
    l2ETHAddress: '0x4200000000000000000000000000000000000006',
  }
}

function writeFileSyncRecursive(filename, content, charset) {
  const folders = filename.split('/').slice(0, -1)
  if (folders.length) {
    // create folder path if it doesn't exist
    folders.reduce((last, folder) => {
      const folderPath = last ? last + '/' + folder : folder
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }
      return folderPath
    })
  }
  fs.writeFileSync('.'+filename, content, charset)
}

const main = async () => {

  console.log(` 📡 Deploying on ${network}\n`);

  let selectedNetwork = deployConfig[network];

  const l1MessengerAddress = selectedNetwork.l1MessengerAddress;
  const l2MessengerAddress = selectedNetwork.l2MessengerAddress;
  const l2ETHAddress = selectedNetwork.l2ETHAddress;

  const decimals = 18
  const name = "CHKNTOKEN"
  const symbol = "CHKN"
  const initialSupply = "1000000000000000000000000000000"
  
  const deployAddress = new ethers.Wallet(deployPrivateKey).address;

  // contracts
  const SushiToken = await deploy({
    contractName: "SushiToken", 
    rpcUrl: selectedNetwork.l2RpcUrl, 
    pk: deployPrivateKey, 
    ovm: true, 
    _args: []
  })

  const SushiBar = await deploy({
    contractName: "SushiBar", 
    rpcUrl: selectedNetwork.l2RpcUrl, 
    pk: deployPrivateKey, 
    ovm: true, 
    _args: [SushiToken.address]
  })

  const MasterChef = await deploy({
    contractName: "MasterChef", 
    rpcUrl: selectedNetwork.l2RpcUrl, 
    pk: deployPrivateKey, 
    ovm: true, 
    _args: [SushiToken.address, deployAddress, "1000000000000000000000", "0", "1000000000000000000000"]
  });

  if (await SushiToken.owner() !== MasterChef.address) {
    // Transfer Sushi Ownership to Chef
    console.log(" 🔑 Transfer Sushi Ownership to Chef")
    await (await SushiToken.transferOwnership(MasterChef.address)).wait()
  }

  if (await MasterChef.owner() !== deployAddress) {
    // Transfer ownership of MasterChef to Dev
    console.log(" 🔑 Transfer ownership of MasterChef to Dev")
    await (await MasterChef.transferOwnership(deployAddress)).wait()
  }

  const UniswapV2Factory = await deploy({
    contractName: "UniswapV2Factory", 
    rpcUrl: selectedNetwork.l2RpcUrl, 
    pk: deployPrivateKey, 
    ovm: true, 
    _args: [deployAddress]
  })

  const UniswapV2Router02 = await deploy({
    contractName: "UniswapV2Router02", 
    rpcUrl: selectedNetwork.l2RpcUrl, 
    pk: deployPrivateKey, 
    ovm: true, 
    _args: [UniswapV2Factory.address, l2ETHAddress]
  })

  //const UNISWAP_ROUTER = new Map()
  //UNISWAP_ROUTER.set("1", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")

  const SushiRoll = await deploy({
    contractName: "SushiRoll", 
    rpcUrl: selectedNetwork.l2RpcUrl, 
    pk: deployPrivateKey, 
    ovm: true, 
    _args: ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", UniswapV2Router02.address]
  })

  // save address
  const addresses = {
    SushiToken: SushiToken.address,
    SushiBar: SushiBar.address,
    MasterChef: MasterChef.address,
    UniswapV2Factory: UniswapV2Factory.address,
    UniswapV2Router02: UniswapV2Router02.address,
    SushiRoll: SushiRoll.address,
  }

  writeFileSyncRecursive(`/deployments/${network}/addresses.json`,JSON.stringify(addresses));

  console.log(
    "\n\n 🛰  Addresses: \n",
    addresses,
  )
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

exports.deploy = deploy;

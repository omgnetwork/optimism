import { Wallet, providers, ethers} from 'ethers';
import L2StandardERC20Json from '../artifacts/contracts/libraries/OVM_L2StandardERC20.sol/L2StandardERC20.json'
require('dotenv').config()

const main  = async () =>{


    const l2Provider = new providers.JsonRpcProvider(process.env.L2_NODE_WEB3_URL);
    const L2Wallet = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, l2Provider);
    const L2ETH = new ethers.Contract(
        "0x4200000000000000000000000000000000000006",
        L2StandardERC20Json.abi,
        L2Wallet
        );
    const L2ETHBalance = await L2ETH.balanceOf(L2Wallet.address);
    console.log({ L2ETHBalance: L2ETHBalance.toString() });
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(
      JSON.stringify({ error: error.message, stack: error.stack }, null, 2)
    )
    process.exit(1)
  })
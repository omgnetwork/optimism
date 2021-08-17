/* External Imports */
const { ethers } = require('hardhat');
const BobaMenuJSON = require('../artifacts-ovm/contracts/BobaMenu.sol/BobaMenu.json')
require('dotenv').config();
const env = process.env;

const main = async () => {
    const l2_provider = new ethers.providers.JsonRpcProvider(env.l2_provider);
    const wallet1 = new ethers.Wallet(env.privateKey1, l2_provider);

    const flavor3 = "Black Milk Tea";
    const topping3 = "Tapioca Pearls";
    const commonScore3 = 15;
    const topping_color3 = [24, 31, 26];
    const flavor_color3 = [230, 172, 115];
    const flavor_gradient3 = [3, 2, 3];

    const flavorStruct3 = [ethers.utils.formatBytes32String(flavor3), // flavor
                    flavor_color3, // color
                    commonScore3, // common score
                    flavor_gradient3 // gradient
                    ];
    const toppingStruct3 = [ethers.utils.formatBytes32String(topping3), // topping
                            topping_color3, // color
                            commonScore3 // common score
                            ];
    BobaMenu = new ethers.Contract('0x0077B114930ceeB059929f720A1E64D5ed1b2146',
                                    BobaMenuJSON.abi,
                                    wallet1
                                    );
    await BobaMenu.addFlavor(flavorStruct3);
    await BobaMenu.addTopping(toppingStruct3);

}


(async () => {
    main();
  })().catch((err) => {
      console.log(err)
    process.exit(1)
  })
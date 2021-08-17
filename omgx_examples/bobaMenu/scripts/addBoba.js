/* External Imports */
const { ethers } = require('hardhat');
const BobaMenuJSON = require('../artifacts-ovm/contracts/BobaMenu.sol/BobaMenu.json')
require('dotenv').config();
const env = process.env;

const main = async () => {
    const l2_provider = new ethers.providers.JsonRpcProvider(env.l2_provider);
    const wallet1 = new ethers.Wallet(env.privateKey1, l2_provider);

    const flavor4 = "Wintermelon Milk Tea"
    const topping4 = "Lychee Jelly";
    const commonScore4 = 5;
    const topping_color4 = [234, 235, 216];
    const flavor_color4 = [186, 149, 114];
    const flavor_gradient4 = [4, 2, 4];

    const flavorStruct4 = [ethers.utils.formatBytes32String(flavor4), // flavor
                    flavor_color4, // color
                    commonScore4, // common score
                    flavor_gradient4 // gradient
                    ];
    const toppingStruct4 = [ethers.utils.formatBytes32String(topping4), // topping
                            topping_color4, // color
                            commonScore4 // common score
                            ];
    BobaMenu = new ethers.Contract('0x0077B114930ceeB059929f720A1E64D5ed1b2146',
                                    BobaMenuJSON.abi,
                                    wallet1
                                    );
    await BobaMenu.addFlavor(flavorStruct4);
    await BobaMenu.addTopping(toppingStruct4);

}


(async () => {
    main();
  })().catch((err) => {
      console.log(err)
    process.exit(1)
  })
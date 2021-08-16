// Just a standard hardhat-deploy deployment definition file!
const ethers = require('../node_modules/ethers');

const func = async (hre) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();


    const flavor = [ethers.utils.formatBytes32String("Taro Milk"), // flavor
                    [221, 137, 245], // color
                    30, // common score
                    [1, 2, 3] // gradient
];
    const topping = [ethers.utils.formatBytes32String("Aloe Vera"),// topping
                                            [230, 242, 234], // color
                                            30 // common score
];

    await deploy('BobaMenu', {
      from: deployer,
      args: ['0x21A235cf690798ee052f54888297Ad8F46D3F389', topping, flavor],
      log: true
    });
  }

  func.tags = ['BobaMenu']
  module.exports = func
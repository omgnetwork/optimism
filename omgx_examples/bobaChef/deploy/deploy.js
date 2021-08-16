// Just a standard hardhat-deploy deployment definition file!
const ethers = require('../node_modules/ethers');

// ethers.abiCoder.encode([ "uint", "string" ], [ 1234, "Hello World" ]);
ethers.utils.defaultAbiCoder.encode([ "string"], [ "Taro Milk" ]);
console.log(`Got here!`);
const func = async (hre) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();


  const flavor_test = ethers.utils.defaultAbiCoder.encode(["tuple(string, uint[3], uint, uint[3])"], [["Taro Milk", //ethers.utils.defaultAbiCoder.encode([ "bytes32"], [ "Taro Milk" ]), // flavor
  [221, 137, 245], // color
  30, // common score
  [1, 2, 3]]] );
  const topping_test = ethers.utils.defaultAbiCoder.encode(["tuple(string, uint[3], uint)"], [["Aloe Vera",// ethers.abiCoder.encode([ "bytes32"], [ "Aloe Vera" ]),
  [230, 242, 234], // color
  30 // common score
  ]] );


    const flavor = [ethers.utils.formatBytes32String("Taro Milk"), //ethers.utils.defaultAbiCoder.encode([ "bytes32"], [ "Taro Milk" ]), // flavor
                    [221, 137, 245], // color
                    30, // common score
                    [1, 2, 3] // gradient
];
    const topping = [ethers.utils.formatBytes32String("Aloe Vera"),// ethers.abiCoder.encode([ "bytes32"], [ "Aloe Vera" ]),
                                            [230, 242, 234], // color
                                            30 // common score
];

    await deploy('BobaChef', {
      from: deployer,
      args: ['0x21A235cf690798ee052f54888297Ad8F46D3F389', topping, flavor],
      log: true
    })
  }

  func.tags = ['BobaChef']
  module.exports = func

  // async function main() {
  //   // We get the contract to deploy
  //   const BobaChef = await ethers.getContractFactory("BobaChef");
  //   const bobaChef = await BobaChef.deploy("0xd3bc79679b9e70523cc78c7d8683460a3920dd6741c2f899f3fa417129d4e409", );

  //   console.log("BobaChef deployed to:", bobaChef.address);
  // }

  // main()
  //   .then(() => process.exit(0))
  //   .catch((error) => {
  //     console.error(error);
  //     process.exit(1);
  //   });

// struct flavor {
//     bytes32 flavor;
//     uint[3] color;
//     uint commonScore;
//     uint[3] gradient;
// }

// struct topping{
//     bytes32 topping;
//     uint[3] color;
//     uint256 commonScore;
// }

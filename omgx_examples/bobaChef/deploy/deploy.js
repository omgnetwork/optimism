// Just a standard hardhat-deploy deployment definition file!
const func = async (hre) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const flavor = 'test';
    const topping = 'test';

    await deploy('BobaChef', {
      from: deployer,
      args: ['0x21A235cf690798ee052f54888297Ad8F46D3F389', flavor,topping],
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

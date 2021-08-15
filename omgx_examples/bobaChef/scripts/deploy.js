
async function main() {
  // We get the contract to deploy
  const BobaChef = await ethers.getContractFactory("BobaChef");
  const bobaChef = await BobaChef.deploy("0xd3bc79679b9e70523cc78c7d8683460a3920dd6741c2f899f3fa417129d4e409", 'test', 'test');

  console.log("BobaChef deployed to:", bobaChef.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

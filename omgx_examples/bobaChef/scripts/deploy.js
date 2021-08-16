
async function main() {
  // We get the contract to deploy
  const BobaMenu = await ethers.getContractFactory("BobaMenu");
  const bobaMenu = await BobaMenu.deploy("", 'test', 'test');

  console.log("BobaMenu deployed to:", bobaMenu.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

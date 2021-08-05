// Just a standard hardhat-deploy deployment definition file!
const func = async (hre) => {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const X_SUPPLY = 1000
  const Y_SUPPLY = 1000

  await deploy('StableSwap', {
    from: deployer,
    args: [X_SUPPLY, Y_SUPPLY],
    log: true
  })
}

func.tags = ['StableSwap']
module.exports = func

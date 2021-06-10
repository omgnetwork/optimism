/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'


const deployFn: DeployFunction = async (hre) => {
  //console.log("herherherherh")
  const { deploy } = hre.deployments
  const { deployer } = await hre.getNamedAccounts()
// console.log(deploy)

console.log((hre as any).deployConfig.watcher.l1.messengerAddress)
  await deploy('L1LiquidityPool', {
    from: deployer,
    args: [(hre as any).deployConfig.watcher.l1.messengerAddress],
    log: true,
  })



  console.log((hre as any).deployConfig.watcher.l2.messengerAddress)
  await deploy('L2LiquidityPool', {
    from: deployer,
    args: [(hre as any).deployConfig.watcher.l2.messengerAddress],
    log: true,
  })


}

deployFn.tags = ['L2LiquidityPool', 'required']

export default deployFn

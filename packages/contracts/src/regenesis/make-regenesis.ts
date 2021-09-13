export const makeRegenesisDump = (dump:any, genesis: any) => {
  const stateDumpGeneis = genesis.accounts
  const stateDumpLatest = dump.accounts

  // We only update the data storage of OVM_ETH
  // in state-dump.latest.json
  const updatePredeployedContract = [
    "OVM_ETH",
  ]
  // get the predeployed contracts
  // { CONTRACT_ADDRESS: CONTRACT_NAME }
  const predeployedContract = Object.keys(stateDumpLatest)
    .reduce((acc, cur) => {
      acc[stateDumpLatest[cur].address] = cur
      return acc
    }, {})

  predeployedContract["0x420000000000000000000000000000000000000b"] = "EXECUTION_MANAGER_WRAPPER"
  predeployedContract["0x420000000000000000000000000000000000000f"] = "OVM_GasPriceOracle"

  for (const eachAddress of Object.keys(stateDumpGeneis)) {
    const contractName = predeployedContract[eachAddress]
    // contracts that are not predeployed
    if (typeof contractName === 'undefined') {
      stateDumpLatest[eachAddress] = {
        address: eachAddress,
        ...stateDumpGeneis[eachAddress]
      }
    // Update OVM_ETH
    } else if (updatePredeployedContract.includes(contractName)) {
      stateDumpLatest[contractName].storage = stateDumpGeneis[eachAddress].storage
    }
  }

  return { accounts: stateDumpLatest }
}
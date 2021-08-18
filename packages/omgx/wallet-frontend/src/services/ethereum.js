import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, Contract } from 'ethers'

import GovernorBravoDelegate from '../deployment/artifacts-ovm/contracts/GovernorBravoDelegate.json'
import GovernorBravoDelegator from '../deployment/artifacts-ovm/contracts/GovernorBravoDelegator.json'
import SafeMath from '../deployment/artifacts-ovm/contracts/SafeMath.json'
import Timelock from '../deployment/artifacts-ovm/contracts/Timelock.json'
import BobaMenu from '../deployment/artifacts-ovm/contracts/BobaMenu.json'
const Comp = require('../deployment/artifacts-ovm/contracts/Comp.json')

const getBlockchain = () =>
  new Promise(async (resolve, reject) => {
    let provider = await detectEthereumProvider()
    if (provider) {
      await window.ethereum.enable()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const signer = provider.getSigner()
      const networkId = window.ethereum.networkVersion
      const comp = new Contract(
        Comp.networks[networkId].address,
        Comp.abi,
        signer
      )
      const delegate = new Contract(
        GovernorBravoDelegate.networks[networkId].address,
        GovernorBravoDelegate.abi,
        signer
      )
      const delegator = new Contract(
        GovernorBravoDelegator.networks[networkId].address,
        GovernorBravoDelegator.abi,
        signer
      )
      const safeMath = new Contract(
        SafeMath.networks[networkId].address,
        SafeMath.abi,
        signer
      )
      const timelock = new Contract(
        Timelock.networks[networkId].address,
        Timelock.abi,
        signer
      )
      const bobaMenu = new Contract(
        '0x0077B114930ceeB059929f720A1E64D5ed1b2146',
        BobaMenu.abi,
        signer
      )

      const GovernorBravo = delegate.attach(delegator.address)

      resolve({
        signer,
        comp,
        delegate,
        delegator,
        safeMath,
        timelock,
        GovernorBravo,
        bobaMenu
      })
      return
    }
    reject('Install Metamask')
  })

export default getBlockchain

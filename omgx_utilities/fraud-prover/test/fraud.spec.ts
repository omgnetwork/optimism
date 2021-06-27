import { expect } from 'chai'
import { Contract, ContractFactory, BigNumber, utils } from 'ethers'
import { ethers, network } from 'hardhat'
import ERC20Json from '../artifacts-ovm/contracts/ERC20.sol/ERC20.json'

describe('Fraud Prover Testing System Setup', async () => {
    
  let Factory__ERC20: ContractFactory
  let ERC20: Contract

  //Test ERC20
  const INITIAL_SUPPLY = utils.parseEther('10000000000')
  const TOKEN_NAME = 'OMGX Test'
  const tokenDecimals = 18
  const tokenSymbol = 'OMGX'

    let bob
    let alice
    let fraud

    before(`load accounts`, async () => {
      ;[ bob, alice, fraud ] = await ethers.getSigners()
    })

    beforeEach(`deploy ERC20 contract`, async () => {
      
      const Factory__ERC20 = await ethers.getContractFactory('ERC20')
      
      ERC20 = await Factory__ERC20.connect(bob).deploy(
        INITIAL_SUPPLY,
        TOKEN_NAME,
        tokenDecimals,
        tokenSymbol
      )

      await ERC20.deployTransaction.wait()
    })

    it(`should give the initial supply to the creator's address`, async () => {
      const balance = await ERC20.balanceOf(await bob.getAddress())
      expect(balance.toString()).to.equal(INITIAL_SUPPLY.toString())
    })

    it(`should transfer from Bob to Alice, triggering the batch submitter to submit a batch`, async () => {
      //assuming it's configured correctly, of course. 

      let transfer = await ERC20.transfer(
        alice.address,
        utils.parseEther('8'),
        { gasLimit: 800000, gasPrice: 0 }
      )
      let receipt = await transfer.wait()

      let balanceA = await ERC20.balanceOf(await alice.getAddress())      
      expect(balanceA.toString()).to.equal(utils.parseEther('8').toString())

      transfer = await ERC20.transfer(
        alice.address,
        utils.parseEther('8'),
        { gasLimit: 800000, gasPrice: 0 }
      )
      receipt = await transfer.wait()

      balanceA = await ERC20.balanceOf(await alice.getAddress())      
      expect(balanceA.toString()).to.equal(utils.parseEther('16').toString())

      transfer = await ERC20.transfer(
        alice.address,
        utils.parseEther('8'),
        { gasLimit: 800000, gasPrice: 0 }
      )
      receipt = await transfer.wait()

      balanceA = await ERC20.balanceOf(await alice.getAddress())      
      expect(balanceA.toString()).to.equal(utils.parseEther('24').toString())

    })

    it(`should transfer from Bob to Fraud, and from Fraud to Alice`, async () => {
      
      const transfer = await ERC20.transfer(
        fraud.address,
        utils.parseEther('8'),
        { gasLimit: 800000, gasPrice: 0 }
      )

      const receipt = await transfer.wait()

      const balanceF = await ERC20.balanceOf(await fraud.getAddress())
      //console.log("Fraud now has:", balanceF.toString())
      
      expect(balanceF.toString()).to.equal(utils.parseEther('8').toString())

      const transferA = await ERC20.connect(fraud)
        .transfer(
          alice.address,
          utils.parseEther('4'),
          { gasLimit: 800000, gasPrice: 0 }
        )
      
      const receiptA = await transferA.wait()
      
      const balanceA = await ERC20.balanceOf(await alice.getAddress())
      //console.log("Alice now has:", balanceA.toString())
      
      expect(balanceA.toString()).to.equal(utils.parseEther('4').toString())
    })

})
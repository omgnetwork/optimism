/* External Imports */
const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

describe(`StableSwap`, () => {
  const X_SUPPLY = 1000
  const Y_SUPPLY = 1000

  let account1
  let account2
  before(`load accounts`, async () => {
    ;[account1, account2] = await ethers.getSigners()
  })

  let StableSwap
  beforeEach(`initialize token balances for x and y`, async () => {
    const Factory__StableSwap = await ethers.getContractFactory('StableSwap')
    StableSwap = await Factory__StableSwap.connect(account1).deploy(
      X_SUPPLY,
      Y_SUPPLY
    )

    await StableSwap.deployTransaction.wait()
  })

  it(`x should have given initial x_supply`, async () => {
    const xAmount = await StableSwap.x()
    expect(xAmount).to.equal(X_SUPPLY)
  })

  it(`y should have given initial y_supply`, async () => {
    const yAmount = await StableSwap.y()
    expect(yAmount).to.equal(Y_SUPPLY)
  })

  it(`k should have given initial (x_supply) times (y_supply)`, async () => {
    const kAmount = await StableSwap.k()
    expect(kAmount).to.equal(X_SUPPLY * Y_SUPPLY)
  })

  it(`A should be 0 for initialization`, async () => {
    const AAmount = await StableSwap.a()
    expect(AAmount).to.equal(0)
  })

  describe(`change A(...)`, () => {
    it(`should change A from 0 to 1`, async () => {
      const tx = StableSwap.connect(account1).changeA(1)
      await tx.wait()

      const AAmount = await StableSwap.a()
      expect(AAmount).to.equal(1)
    })

    it(`should maintain invariant`, async () => {
      const invariant = await StableSwap.invariant()
      expect(invariant).to.equal(true)
    })
  })

  const X_ADD = 500
  const Y_ADD = 500

  describe(`add liquidity(...)`, () => {
    it(`should add x_add & y_add to total liquidity`, async () => {
      const tx = StableSwap.connect(account1).addLiquidity(X_ADD, Y_ADD)
      await tx.wait()
    })

    it(`x should equal (x_supply + x_add)`, async () => {
      const xAmount = await StableSwap.x()
      expect(xAmount).to.equal(X_SUPPLY + X_ADD)
    })

    it(`y should equal (y_supply + y_add)`, async () => {
      const yAmount = await StableSwap.y()
      expect(yAmount).to.equal(Y_SUPPLY + Y_ADD)
    })

    it(`k should equal (x_supply + x_add) * (y_supply + y_add)`, async () => {
      const kAmount = await StableSwap.k()
      expect(kAmount).to.equal((X_SUPPLY + X_ADD) * (Y_SUPPLY + Y_ADD))
    })

    it(`A should remain 1`, async () => {
      const AAmount = await StableSwap.a()
      expect(AAmount).to.equal(1)
    })

    it(`should maintain invariant`, async () => {
      const invariant = await StableSwap.invariant()
      expect(invariant).to.equal(true)
    })
  })

  const X_SWAP_IN = 500
  const EXPECTED_Y_OUT = 447

  describe(`swap x for y(...)`, () => {
    it(`should add x_swap_in to liquidity of x and remove y_swap_in from liquidity of y`, async () => {
      const Y_SWAP_OUT = await StableSwap.connect(account1).swap_x(X_SWAP_IN) // Does this work??
      expect(Y_SWAP_OUT).to.equal(EXPECTED_Y_OUT)
    })

    it(`x should equal (x_supply + x_add + x_swap_in)`, async () => {
      const xAmount = await StableSwap.x()
      expect(xAmount).to.equal(X_SUPPLY + X_ADD + X_SWAP_IN)
    })

    it(`y should equal (y_supply + y_add - y_swap_out)`, async () => {
      const yAmount = await StableSwap.y()
      expect(yAmount).to.equal(Y_SUPPLY + Y_ADD - Y_SWAP_OUT)
    })

    it(`k should remain same, equal (x_supply + x_add) * (y_supply + y_add)`, async () => {
      const kAmount = await StableSwap.k()
      expect(kAmount).to.equal((X_SUPPLY + X_ADD) * (Y_SUPPLY + Y_ADD))
    })

    it(`A should remain 1`, async () => {
      const AAmount = await StableSwap.a()
      expect(AAmount).to.equal(1)
    })

    it(`should maintain invariant`, async () => {
      const invariant = await StableSwap.invariant()
      expect(invariant).to.equal(true) // Is there a way to check for approximate results?
    })
  })

  const Y_SWAP_IN = 447
  const EXPECTED_X_OUT = 500

  describe(`swap y for x(...)`, () => {
    it(`should add y_swap_in to liquidity of y and remove x_swap_out from liquidity of y`, async () => {
      const X_SWAP_OUT = await StableSwap.connect(account1).swap_y(Y_SWAP_IN) // Does this work??
      expect(X_SWAP_OUT).to.equal(EXPECTED_X_OUT)
    })

    it(`x should equal (x_supply + x_add + x_swap_in - x_swap_out)`, async () => {
      const xAmount = await StableSwap.x()
      expect(xAmount).to.equal(X_SUPPLY + X_ADD + X_SWAP_IN - X_SWAP_OUT)
    })

    it(`y should equal (y_supply + y_add - y_swap_out + y_swap_in)`, async () => {
      const yAmount = await StableSwap.y()
      expect(yAmount).to.equal(Y_SUPPLY + Y_ADD - Y_SWAP_OUT + Y_SWAP_IN)
    })

    it(`k should remain same, equal (x_supply + x_add) * (y_supply + y_add)`, async () => {
      const kAmount = await StableSwap.k()
      expect(kAmount).to.equal((X_SUPPLY + X_ADD) * (Y_SUPPLY + Y_ADD))
    })

    it(`A should remain 1`, async () => {
      const AAmount = await StableSwap.a()
      expect(AAmount).to.equal(1)
    })

    it(`should maintain invariant`, async () => {
      const invariant = await StableSwap.invariant()
      expect(invariant).to.equal(true) // Is there a way to check for approximate results?
    })
  })

  const LIQUIDITY_PERCENT_OUT = 50
  const EXPECTED_X_BACK = 750
  const EXPECTED_Y_BACK = 750


  describe(`remove liquidity(...)`, () => {
    it(`should remove x_back & y_back to total liquidity`, async () => {
      const { X_BACK, Y_BACK } = await StableSwap.connect(
        account1
      ).removeLiquidity(LIQUIDITY_PERCENT_OUT) // Does this work??
      expect(X_BACK).to.equal(EXPECTED_X_BACK)
      expect(Y_BACK).to.equal(EXPECTED_Y_BACK)
    })

    it(`x should equal (x_supply + x_add - x_back)`, async () => {
      const xAmount = await StableSwap.x()
      expect(xAmount).to.equal(X_SUPPLY + X_ADD - X_BACK)
    })

    it(`y should equal (y_supply + y_add - y_back)`, async () => {
      const yAmount = await StableSwap.y()
      expect(yAmount).to.equal(Y_SUPPLY + Y_ADD - Y_BACK)
    })

    it(`k should equal (x_supply + x_add - x_back) * (y_supply + y_add - y_back)`, async () => {
      const kAmount = await StableSwap.k()
      expect(kAmount).to.equal(
        (X_SUPPLY + X_ADD - X_BACK) * (Y_SUPPLY + Y_ADD - Y_BACK)
      )
    })

    it(`A should remain 1`, async () => {
      const AAmount = await StableSwap.a()
      expect(AAmount).to.equal(1)
    })

    it(`should maintain invariant`, async () => {
      const invariant = await StableSwap.invariant()
      expect(invariant).to.equal(true)
    })
  })
})

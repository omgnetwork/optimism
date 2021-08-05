# OMGX ERC721 Example

## 1. Compiling the contracts

First, spin up a local system as usual (see the top-level `Readme.md`). Then, run:

```bash
$ yarn
$ yarn compile       #for your local L1
$ yarn compile:ovm   #for your local L2
$ yarn compile:omgx  #for OMGX Rinkeby
```

## 2. Testing

```bash
$ yarn test:integration:ovm  #for your local L1/L2
$ yarn test:integration:omgx #for OMGX Rinkeby
```

```bash
  ERC721
NFT ERC721 deployed to: $(ERC721.address)
Owner balance: BigNumber { _hex: '0x00', _isBigNumber: true }
NFT Symbol: TST
NFT Name: TestNFT
NFT Genesis: [
  '0x0000000000000000000000000000000000000000',
  'Genesis',
  'OMGX_Rinkeby_28'
]
ERC721 owner: 0x21A235cf690798ee052f54888297Ad8F46D3F389
    ✓ should have a name (340ms)
meta: Henrietta Lacks#1627920679434#https://www.atcc.org/products/all/CCL-2.aspx
Alice (a1a): 0x5C2C14Fe167d567525AdE51cD77CE0B9D34674Aa
balanceOwner: 0
balanceAlice: 1
nftURL: Henrietta Lacks#1627920679434#https://www.atcc.org/products/all/CCL-2.aspx
TID:1
TID:3
    ✓ should generate a new ERC721 and transfer it from Bob (a1a) to Alice (a2a) (8855ms)
Alice's UUID: xA2E1_2_x5C2C
Derived NFT deployed to: 0xdFC6BF9eF15cEe41bEF706Ec02001c7dEcadF3E1
    ✓ should derive an NFT Factory from a genesis NFT (4749ms)
Addresses a2a: 0xA2E1D3b24b13Dbd39e6C3F167981428FdC6302F8
Addresses a3a: 0xA2E1D3b24b13Dbd39e6C3F167981428FdC6302F8,0xdFC6BF9eF15cEe41bEF706Ec02001c7dEcadF3E1
    ✓ should register the NFTs address in users wallet (6188ms)


  4 passing (28s)

✨  Done in 30.58s.

```

## 3. Deployment

 ```bash
 $ yarn deploy:omgx
yarn run v1.22.10
$ hardhat deploy
Compiling 16 files with 0.7.6
Compilation finished successfully
deploying "ERC721Genesis" (tx: 0x1c1ce510b8a727d27cde7a90f9ed682692415bcf611bd468459d7652ba3cb9c5)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 3521538 gas
deploying "ERC721Registry" (tx: 0xb604cb7b9860d488f2f14fb5bfd4b941311ef0d068849df363d434c825dd4775)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 232352 gas
✨  Done in 3.14s.
 ```
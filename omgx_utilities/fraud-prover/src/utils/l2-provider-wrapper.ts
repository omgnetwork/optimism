import { providers } from 'ethers'
import { StateDiffProof } from '../types'
import { toUnpaddedHexString } from './hex-utils'

export class L2ProviderWrapper {
  
  constructor(public provider: providers.JsonRpcProvider) {}

  public async getStateRoot(index: number): Promise<string> {
    const block = await this.provider.send('eth_getBlockByNumber', [
      toUnpaddedHexString(index),
      false,
    ])
    
    //this frequently gives null
    if (block === null) {
      console.log("did not get a stateroot")
      return null
    }
    else {
      return block.stateRoot
    }
  }

  public async getTransaction(index: number): Promise<string> {
    const transaction = await this.provider.send(
      'eth_getTransactionByBlockNumberAndIndex',
      [toUnpaddedHexString(index), '0x0']
    )

    return transaction.input
  }

  public async getProof(
    index: number,
    address: string,
    slots: string[] = []
  ): Promise<any> {
    return this.provider.send('eth_getProof', [
      address,
      slots,
      toUnpaddedHexString(index),
    ])
  }

  public async getStateDiffProof(index: number, indexL1: number): Promise<StateDiffProof> {
    
    let proof = await this.provider.send('eth_getStateDiffProofCT', [
      toUnpaddedHexString(index),
      indexL1,
    ])

    return {
      header: proof.header,
      accountStateProofs: proof.accounts,
    }
  }

  public async getRollupInfo(): Promise<any> {
    return this.provider.send('rollup_getInfo', [])
  }

  public async getAddressManagerAddress(): Promise<string> {
    const rollupInfo = await this.getRollupInfo()
    return rollupInfo.addresses.addressResolver
  }
}

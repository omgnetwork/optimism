import { BatchSigner } from '.'

import { providers } from 'ethers'

export const getBalance = async (
  provider: providers.JsonRpcProvider,
  address: string
) => {
  return provider.getBalance(address)
}

export const getBatchSignerAddress = async (
  batchSigner: BatchSigner
): Promise<string> => {
  if (batchSigner.address === undefined) {
    return batchSigner.signer.getAddress()
  } else {
    return batchSigner.address
  }
}

export const getTransactionCount = async (
  provider: providers.JsonRpcProvider,
  address: string
) => {
  return provider.getTransactionCount(address)
}

export const getTransactionCountBlock = async (
  provider: providers.JsonRpcProvider,
  address: string,
  block: string
) => {
  return provider.getTransactionCount(address, block)
}

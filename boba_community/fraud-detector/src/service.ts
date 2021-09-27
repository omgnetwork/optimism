
import { Contract, Signer, ethers, Wallet, BigNumber, providers } from 'ethers'
import { BaseService } from '@eth-optimism/common-ts'
import { loadContract, loadContractFromManager } from '@eth-optimism/contracts'

const L2_GENESIS_BLOCK = 1

import {
  L1ProviderWrapper,
  L2ProviderWrapper,
  sleep,
} from './utils'

interface FraudProverOptions {
  
  // Providers for interacting with L1 and L2.
  l1RpcProvider: providers.JsonRpcProvider
  l2RpcProvider: providers.JsonRpcProvider

  // Address of the AddressManager contract, used to resolve the various addresses we'll need
  // within this service.
  addressManagerAddress: string

  // Height of the L2 transaction to start searching for L2->L1 messages.
  fromL2TransactionIndex?: number

  // Interval in seconds to wait between loops.
  pollingInterval?: number

  // L1 block to start querying events from. Recommended to set to the StateCommitmentChain deploy height
  l1StartOffset?: number

  // When L1 blocks are considered final
  l1BlockFinality: number

  // Number of blocks within each getLogs query - max is 2000
  getLogsInterval?: number
}

const optionSettings = {
  pollingInterval: { default: 5000 },
  fromL2TransactionIndex: { default: 0 },
  l1StartOffset: { default: 0 },
  l1BlockFinality: { default: 0 },
  getLogsInterval: { default: 2000 },
}

export class FraudProverService extends BaseService<FraudProverOptions> {
  
  constructor(options: FraudProverOptions) {
    super('Fraud_Detector', options, optionSettings)
  }

  private state: {
    nextUnverifiedStateRoot: number
    lastFinalizedTxHeight: number
    nextUnfinalizedTxHeight: number
    lastQueriedL1Block: number
    eventCache: ethers.Event[]
    Lib_AddressManager: Contract
    OVM_StateCommitmentChain: Contract
    l1Provider: L1ProviderWrapper
    l2Provider: L2ProviderWrapper
  }

  protected async _init(): Promise<void> {
    
    this.logger.info('Initializing fraud detector', { options: this.options })

    this.state = {} as any

    this.logger.info('Trying to connect to the L1 network...')
    for (let i = 0; i < 10; i++) {
      try {
        await this.options.l1RpcProvider.detectNetwork()
        this.logger.info('Successfully connected to the L1 network.')
        break
      } catch (err) {
        if (i < 9) {
          this.logger.info('Unable to connect to L1 network', {
            retryAttemptsRemaining: 10 - i,
          })
          await sleep(1000)
        } else {
          throw new Error(
            `Unable to connect to the L1 network, check that your L1 endpoint is correct.`
          )
        }
      }
    }

    this.logger.info('Trying to connect to the Verifier...')
    for (let i = 0; i < 10; i++) {
      try {
        await this.options.l2RpcProvider.detectNetwork()
        this.logger.info('Successfully connected to the L2 Verifier.')
        break
      } catch (err) {
        if (i < 9) {
          this.logger.info('Unable to connect to L2 Verifier', {
            retryAttemptsRemaining: 10 - i,
          })
          await sleep(1000)
        } else {
          throw new Error(
            `Unable to connect to the L2 Verifier, check that your L2 Verifier endpoint is correct.`
          )
        }
      }
    }

    this.logger.info('Connecting to Lib_AddressManager...')

    this.state.Lib_AddressManager = loadContract(
      'Lib_AddressManager',
      this.options.addressManagerAddress,
      this.options.l1RpcProvider
    )
    this.logger.info('Connected to Lib_AddressManager', {
      address: this.state.Lib_AddressManager.address,
    })

    this.logger.info('Connecting to OVM_StateCommitmentChain...')
    this.state.OVM_StateCommitmentChain = await loadContractFromManager({
      name: 'OVM_StateCommitmentChain',
      Lib_AddressManager: this.state.Lib_AddressManager,
      provider: this.options.l1RpcProvider,
    })
    this.logger.info('Connected to OVM_StateCommitmentChain', {
      address: this.state.OVM_StateCommitmentChain.address,
    })

    this.logger.info('Connected to all contracts.')

    this.state.l1Provider = new L1ProviderWrapper(
      this.options.l1RpcProvider,
      this.state.OVM_StateCommitmentChain,
      this.options.l1StartOffset,
      this.options.l1BlockFinality
    )

    this.state.l2Provider = new L2ProviderWrapper(this.options.l2RpcProvider)

    this.logger.info(
      'Caching events for relevant contracts, this might take a while...'
    )

    this.logger.info('Caching events for OVM_StateCommitmentChain.StateBatchAppended...')
    
    await this.state.l1Provider.findAllEvents(
      this.state.OVM_StateCommitmentChain,
      this.state.OVM_StateCommitmentChain.filters.StateBatchAppended()
    )

    // this.logger.info('Caching events for OVM_StateCommitmentChain.StateBatchDeleted...')
    // await this.state.l1Provider.findAllEvents(
    //   this.state.OVM_StateCommitmentChain,
    //   this.state.OVM_StateCommitmentChain.filters.StateBatchDeleted()
    // )

    this.state.lastQueriedL1Block = this.options.l1StartOffset
    
    this.state.eventCache = []
    
    this.state.nextUnverifiedStateRoot = 
      this.options.fromL2TransactionIndex || 0
  }

  protected async _start(): Promise<void> {
    
    while (this.running) {
      
      await sleep(this.options.pollingInterval)
       
      try {
        
        this.logger.info("State Root Position",{
          nextUnverifiedStateRoot: this.state.nextUnverifiedStateRoot
        })

        let nextBatch = await this.state.l1Provider.getStateBatch(
          this.state.nextUnverifiedStateRoot
        )

        if(nextBatch === undefined) {
          //console.log('no new batch headers to check - waiting for batches')
          this.logger.info('Waiting for new transactions and roots...')
          continue
        }

        while (nextBatch !== undefined) {
      
          this.logger.info("New batch to verify", { nextBatch })
       
          //pull all of them in one go
          //console.log("L1 state roots for this header:", nextBatch.stateRoots )

          for (let i = 0; i < nextBatch.header.batchSize.toNumber(); i++) {
            
            const index = nextBatch.header.prevTotalElements.toNumber() + i 

            //console.log('Checking state root for mismatch', index)

            const l1StateRoot = nextBatch.stateRoots[i]

            const l2VStateRoot = await this.state.l2Provider.getStateRoot(
             index + L2_GENESIS_BLOCK
            )
            
            if (l1StateRoot !== l2VStateRoot) {
              this.logger.info('State root MISMATCH - not verified', { 
                stateRoot: this.state.nextUnverifiedStateRoot,
                mismatchIndex: index 
              } )
              this.logger.info('L1 State Root', { l1StateRoot })
              this.logger.info('L2 State Root', { l2VStateRoot })
            } else {
              this.logger.info('State root MATCH - verified ✓', { 
                stateRoot: this.state.nextUnverifiedStateRoot
              })
            }

          }

          this.state.nextUnverifiedStateRoot =
            nextBatch.header.prevTotalElements.toNumber() +
            nextBatch.header.batchSize.toNumber()

          console.log('Next UnverifiedStateRoot:', 
            this.state.nextUnverifiedStateRoot
          )

          nextBatch = await this.state.l1Provider.getStateBatch(
            this.state.nextUnverifiedStateRoot
          )

        }

      } catch (err) {
        this.logger.error('Caught an unhandled error', {
          err,
        })
      }
    }
  }

 }

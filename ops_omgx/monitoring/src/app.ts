import * as configs from './configs'
import logger from './logger'

import { setupProvider } from './monitoring'
import { doDummyTransaction } from './dummy-transaction'

function validateMonitoring () {
  return configs.l1WsUrl !== undefined && configs.l2WsUrl !== undefined &&
          configs.l1PoolAddress !== undefined && configs.l2PoolAddress !== undefined &&
          configs.l1AddressManager !== undefined && configs.relayerAddress !== undefined &&
          configs.sequencerAddress !== undefined && configs.monitoringReconnectSecs !== undefined
}

function validateDummyTransaction () {
  return configs.l1Web3Url !== undefined && configs.l2Web3Url !== undefined &&
          configs.l1PoolAddress !== undefined && configs.l2PoolAddress !== undefined &&
          configs.l1AddressManager !== undefined && configs.dummyDelayMins !== undefined &&
          configs.walletPKey !== undefined && configs.addressOvmEth !== undefined &&
          configs.dummyEthAmount !== undefined && configs.dummyWathcherTimeoutMins !== undefined &&
          configs.l2DepositedERC20 !== undefined && configs.l2GasLimit !== undefined &&
          configs.addressOvmEth !== undefined
}

switch (configs.method) {
  case configs.AppMethod.Monitoring:
    if (!validateMonitoring()) {
      logger.error('Env variables for monitoring is missing!')
      break
    }
    logger.info('Start monitoring service!')
    setupProvider(configs.OMGXNetwork.L1, configs.l1WsUrl)
    setupProvider(configs.OMGXNetwork.L2, configs.l2WsUrl)
    break
  case configs.AppMethod.DummyTransaction:
    if (!validateDummyTransaction()) {
      logger.error('Env variables for dummy transaction is missing!')
      break
    }
    logger.info('Start dummy transaction service!')
    doDummyTransaction()
    break
  default:
    logger.error('App started with invalid method!')
    break
}

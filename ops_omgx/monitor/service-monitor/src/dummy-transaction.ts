import * as configs from './configs'
import { fastOnRamp } from './3_fast-onramp'
import { fastExit } from './4_fast-exit'
import logger from './logger'

const delayTime = 1000 * 60 * configs.dummyDelayMins

const sleep = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(delayTime)
    }, delayTime)
  })
}

export const doDummyTransaction = () => {
  return fastOnRamp()
    .catch((err) => {
      logger.error(err.message)
    })
    .then(fastExit)
    .catch((err) => {
      logger.error(err.message)
    })
    .then(sleep)
    .then(doDummyTransaction)
}

import * as configs from './configs'
import database from './libs/database'
import logger from './logger'
import Web3 from 'web3';

// database
//   .initMySQL()
//   .then(() => {
//     logger.info('Done init')
//   })
//   .catch(logger.error)
(async () => {
  const web3 = new Web3(configs.l1Web3Url)
  // tslint:disable-next-line: no-console
  console.log(await web3.eth.getBlockNumber())
  // tslint:disable-next-line: no-console
})().catch(console.error)

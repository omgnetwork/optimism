/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React,{useEffect,useCallback} from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { isEqual } from 'lodash'
import truncate from 'truncate-middle'

import { selectLoading } from 'selectors/loadingSelector'
import { selectIsSynced } from 'selectors/statusSelector'

import { selectlayer2Balance, selectlayer1Balance } from 'selectors/balanceSelector'

import ListAccount from 'components/listAccount/listAccount';

import Copy from 'components/copy/Copy'

import { logAmount } from 'util/amountConvert'
import networkService from 'services/networkService'

import * as styles from './Account.module.scss'
import { selectTokens } from 'selectors/tokenSelector'
import { fetchGas, fetchLookUpPrice } from 'actions/networkAction'
import { selectNetwork } from 'selectors/setupSelector'

function Account () {
  const dispatch = useDispatch();

  const childBalance = useSelector(selectlayer2Balance, isEqual);
  const rootBalance = useSelector(selectlayer1Balance, isEqual);

  const isSynced = useSelector(selectIsSynced);
  const criticalTransactionLoading = useSelector(selectLoading([ 'EXIT/CREATE' ]));
  const tokenList = useSelector(selectTokens);

  const network = useSelector(selectNetwork());

  const wAddress = networkService.account ? truncate(networkService.account, 6, 4, '...') : '';
  const networkLayer = networkService.L1orL2 === 'L1' ? 'L1' : 'L2';

  const getLookupPrice = useCallback(()=>{
    const symbolList = Object.values(tokenList).map((i)=> {
      if(i.symbolL1 === 'ETH') {
        return 'ethereum'
      } else if(i.symbolL1 === 'OMG') {
        return 'omisego'
      } else {
        return i.symbolL1.toLowerCase()
      }
    });
    dispatch(fetchLookUpPrice(symbolList));
  },[tokenList,dispatch])

  const getGasPrice = useCallback(() => {
    dispatch(fetchGas({
      network: network || 'local',
      networkLayer
    }));
  }, [dispatch, network, networkLayer])

  useEffect(()=>{
    getLookupPrice();
    getGasPrice()
  },[childBalance, rootBalance,getLookupPrice,getGasPrice])

  const disabled = criticalTransactionLoading || !isSynced

  let balances = {
    oETH : {have: false, amount: 0, amountShort: '0'}
  }

  childBalance.reduce((acc, cur) => {
    if (cur.symbol === 'oETH' && cur.balance > 0 ) {
      acc['oETH']['have'] = true;
      acc['oETH']['amount'] = cur.balance;
      acc['oETH']['amountShort'] = logAmount(cur.balance, cur.decimals, 2);
    }
    return acc;
  }, balances)

  return (
    <div className={styles.Account}>

      <div className={styles.wallet}>
        <span className={styles.address}>{`Wallet Address : ${wAddress}`}</span>
        <Copy value={networkService.account} />
      </div>

      {balances['oETH']['have'] &&
        <div className={styles.RabbitBox}>
          <div className={styles.RabbitRight}>
            <div className={styles.RabbitRightTop}>
            BOBA Balance
            </div>
            <div className={styles.RabbitRightMiddle}>
              <div className={styles.happy}>{balances['oETH']['amountShort']}</div>
            </div>
            <div className={styles.RabbitRightBottom}>
              oETH
            </div>
            <div className={styles.RabbitRightBottomNote}>
            {networkLayer === 'L1' &&
              <span>You are on L1. To use the L2, please switch to L2 in MetaMask.</span>
            }
            {networkLayer === 'L2' &&
              <span>You are on L2. To use the L1, please switch to L1 in MetaMask.</span>
            }
            </div>
          </div>
        </div>
      }

      {!balances['oETH']['have'] &&
        <div className={styles.RabbitBox}>
          <div className={styles.RabbitRight}>
            <div className={styles.RabbitRightTop}>
              BOBA Balance
            </div>
            <div className={styles.RabbitRightMiddle}>
                <div className={styles.sad}>0</div>
            </div>
            <div className={styles.RabbitRightBottom}>
              oETH
            </div>
            <div className={styles.RabbitRightBottomNote}>
            {networkLayer === 'L1' &&
              <span>You are on L1. To use the L2, please switch to L2 in MetaMask.</span>
            }
            {networkLayer === 'L2' &&
              <span>You are on L2. To use the L1, please switch to L1 in MetaMask.</span>
            }
            </div>
          </div>
        </div>
      }

  <div className={styles.BalanceWrapper}>
    <div className={styles.balanceContent}>
      <div className={styles.title}>
        <p> <span className={styles.muted}>Balance on L1</span> Ethereum Network </p>
      </div>
      <div className={styles.TableContainer}>
        {rootBalance.map((i, index) => {
          return (
            <ListAccount
              key={i.currency}
              token={i}
              chain={'L1'}
              networkLayer={networkLayer}
              disabled={disabled}
            />
          )
        })}
      </div>
    </div>
    <div className={styles.balanceContent}>
      <div className={styles.title}>
        <p> <span className={styles.muted}>Balance on L2</span> BOBA </p>
      </div>
      <div className={styles.TableContainer}>
        {childBalance.map((i, index) => {
          return (
            <ListAccount
              key={i.currency}
              token={i}
              chain={'L2'}
              networkLayer={networkLayer}
              disabled={disabled}
            />
          )
        })}
      </div>
    </div>
  </div>

  </div>
  );

}

export default React.memo(Account);

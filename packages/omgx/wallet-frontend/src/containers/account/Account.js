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

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, ArrowBack, ArrowForward } from '@material-ui/icons';
import { isEqual } from 'lodash';
import truncate from 'truncate-middle';

import { selectLoading } from 'selectors/loadingSelector';
import { selectIsSynced } from 'selectors/statusSelector';
import { selectlayer2Balance, selectlayer1Balance } from 'selectors/balanceSelector';

import { openModal, openAlert, openError } from 'actions/uiAction';

import Copy from 'components/copy/Copy';
import Button from 'components/button/Button';
import { logAmount } from 'util/amountConvert';

import networkService from 'services/networkService';

import bunny_happy from 'images/bunny_happy.svg';
import bunny_sad from 'images/bunny_sad.svg';

import * as styles from './Account.module.scss';

function Account () {

  const dispatch = useDispatch();
  const isSynced = useSelector(selectIsSynced);
  const childBalance = useSelector(selectlayer2Balance, isEqual);
  const rootBalance = useSelector(selectlayer1Balance, isEqual);
  const criticalTransactionLoading = useSelector(selectLoading([ 'EXIT/CREATE' ]));

  const disabled = !childBalance.length || !isSynced ;

  const handleModalClick = useCallback(
    async (name, fast = false, beginner = false) => {
      if (name === 'transferModal' || name === 'exitModal') {
        const correctLayer = await dispatch(networkService.confirmLayer('L2'));
        if (!correctLayer) return 
      }
      if (name === 'depositModal') {
        const correctLayer = await dispatch(networkService.confirmLayer('L1'));
        if (!correctLayer) return 
      }
      if (name === 'addAssetModal') {
        //const correctLayer = await dispatch(networkService.confirmLayer('L1'));
        //if (!correctLayer) return 
      }
      dispatch(openModal(name, beginner, fast))
    }, [ dispatch ]
  );

  let balances = {
    /*____ : {have: false, amount: 0, amountShort: '0'},*/
    oETH : {have: false, amount: 0, amountShort: '0'}
  }

  childBalance.reduce((acc, cur) => {
    if (cur.symbol === 'oETH' && cur.amount > 0 ) {
      acc['oETH']['have'] = true;
      acc['oETH']['amount'] = cur.amount;
      acc['oETH']['amountShort'] = logAmount(cur.amount, cur.decimals, 2);
    }
    return acc;
  }, balances)

  const wAddress = networkService.account ? truncate(networkService.account, 6, 4, '...') : '';
  const networkLayer = networkService.L1orL2 === 'L1' ? 'L1' : 'L2';
  const masterConfig = networkService.masterConfig;

  return (
    <div className={styles.Account}>

      <div className={styles.wallet}>
        <span className={styles.address}>{`Wallet Address : ${wAddress}`}</span>
        <Copy value={networkService.account} />
      </div>

{/*
      {balances['oETH']['have'] &&
        <h3 style={{marginBottom: '30px'}}>Status: Ready to use OMGX</h3> 
      }
      {!balances['oETH']['have'] &&
        <h3 style={{marginBottom: '30px'}}>Status: Bunny Cry. You do not have any oETH on OMGX</h3> 
      }
*/}
      {balances['oETH']['have'] &&
        <div className={styles.RabbitBox}>
          <img className={styles.bunny} src={bunny_happy} alt='Happy Bunny' />
          <div className={styles.RabbitRight}>
            <div className={styles.RabbitRightTop}>
              OMGX Balance
            </div>
            <div className={styles.RabbitRightMiddle}>
              <div className={styles.happy}>{balances['oETH']['amountShort']}</div>
            </div>
            <div className={styles.RabbitRightBottom}>
              oETH
            </div>
            <div className={styles.RabbitRightBottomNote}>
            {networkLayer === 'L1' && 
              <span>You are on Mainnet (L1). Here, you can send tokens to OMGX. To use the OMGX L2, please switch to L2 in MetaMask.</span>
            }
            {networkLayer === 'L2' && 
              <span>You are on OMGX (L2). Here, you can trade, transfer tokens to others on OMGX, and send tokens to L1. To use L1, please switch to L1 in MetaMask.</span>
            }
            </div>
          </div>
        </div>
      }

      {!balances['oETH']['have'] &&
        <div className={styles.RabbitBox}>
          <img className={styles.bunny} src={bunny_sad} alt='Sad Bunny' />
          <div className={styles.RabbitRight}>
            <div
              className={styles.RabbitRightTop}
            >
              OMGX Balance
            </div>
            <div className={styles.RabbitRightMiddle}>
                0
            </div>
            <div className={styles.RabbitRightBottom}>
            </div>
          </div>
        </div>
      }

      <div className={styles.balances} style={{marginTop: 30}}>

      <div className={styles.boxWrapper}>

        <div className={styles.location}>
          <div>&nbsp;</div>
            {networkLayer === 'L1' && <span className={styles.under}>You are on L1</span>}
            {networkLayer === 'L2' && <span>&nbsp;</span>}
          <div>&nbsp;</div>
        </div>

        <div className={[styles.box, networkLayer === 'L2' ? styles.dim : styles.active].join(' ')}>

          <div className={styles.header}>
            <div className={styles.title}>
              <span>Balance on L1</span>
              <span>Ethereum Network</span>
            </div>
          </div>

          {rootBalance.map((i, index) => {
            return (
              <div key={index} className={styles.row}>
                <div className={styles.token}>
                  <span className={styles.symbol}>{i.symbol}</span>
                </div>
                <span>{logAmount(i.amount, i.decimals, 4)}</span>
              </div>
            );
          })}

        </div>
      </div>

      <div className={styles.boxWrapper}>
        <div className={styles.location}>
          &nbsp;
        </div>
        <div className={styles.boxActions}>
        {networkLayer === 'L1' &&
          <div className={styles.buttons}>
            <Button
              onClick={() => handleModalClick('depositModal', true)}
              type='primary'
              disabled={!isSynced || criticalTransactionLoading}
              style={{maxWidth: '150px', padding: '8px'}}
            >
              FAST ONRAMP<ArrowForward/>
            </Button>
          </div>
        }
        {networkLayer === 'L2' &&
          <div className={styles.buttons}>
            <Button
              onClick={() => handleModalClick('exitModal', true)}
              type='primary'
              disabled={!isSynced || criticalTransactionLoading}
              style={{maxWidth: '150px', padding: '8px'}}
            > 
            <ArrowBack/>FAST OFFRAMP
            </Button>
          </div>
        }
        {networkLayer === 'L1' &&
          <div className={styles.buttons}>
            <Button
              onClick={() => handleModalClick('depositModal')}
              type='secondary'
              disabled={!isSynced || criticalTransactionLoading}
              style={{maxWidth: '120px', padding: '4px', fontSize: '0.8em'}}
            >
              Traditional Deposit<ArrowForward/>
            </Button>
          </div>
        }
        {networkLayer === 'L2' &&
          <div className={styles.buttons}>
            <Button
              onClick={() => handleModalClick('exitModal')}
              type='secondary'
              disabled={disabled || criticalTransactionLoading}
              style={{maxWidth: '120px', padding: '4px', fontSize: '0.8em'}}
            >
              <ArrowBack/>Traditional Exit
            </Button>
          </div>
        }
        </div>
      </div>
      
      <div className={styles.boxWrapper}>
        <div className={styles.location}>
          <div>&nbsp;</div>
            {networkLayer === 'L1' && <span>&nbsp;</span>}
            {networkLayer === 'L2' && <span className={styles.under}>You are on L2</span>}
          <div>&nbsp;</div>
        </div>
        <div className={[styles.box, networkLayer === 'L1' ? styles.dim : styles.active].join(' ')}>
          <div className={styles.header}>
            <div className={styles.title}>
              <span>Balance on L2</span>
              <span>OMGX</span>
            </div>
              <div
                onClick={()=>handleModalClick('transferModal')}
                className={[styles.transfer, networkLayer === 'L1' ? styles.disabled : ''].join(' ')}
              >
                <Send />
                <span>TRANSFER</span>
              </div>
          </div>
          {childBalance.map((i, index) => {
            return (
              <div key={index} className={styles.row}>
                <div className={styles.token}>
                  <span className={styles.symbol}>{i.symbol}</span>
                </div>
                <span>{logAmount(i.amount, i.decimals, 4)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

  </div>
  );

}

export default React.memo(Account);

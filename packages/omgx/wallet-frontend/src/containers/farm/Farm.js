/*
  Utility Functions for OMG Plasma
  Copyright (C) 2021 Enya Inc. Palo Alto, CA

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import { getFarmInfo, getFee } from 'actions/farmAction'

import ListFarm from 'components/listFarm/listFarm'
import Tabs from 'components/tabs/Tabs'
import AlertIcon from 'components/icons/AlertIcon'
import networkService from 'services/networkService'

import * as S from './Farm.styles'
import { Box, FormControlLabel, Checkbox, Typography } from '@material-ui/core'
import PageHeader from 'components/pageHeader/PageHeader'
import { tableHeadList } from './tableHeadList'
import LayerSwitcher from 'components/mainMenu/layerSwitcher/LayerSwitcher'


class Farm extends React.Component {

  constructor(props) {

    super(props)

    const {
      totalFeeRate,
      userRewardFeeRate,
      poolInfo,
      userInfo,
    } = this.props.farm

    const {
      layer1,
      layer2
    } = this.props.balance


    let initialViewLayer = 'L1 Liquidity Pool'
    let initialLayer = 'L1LP'

    if(networkService.L1orL2 === 'L2') {
      initialViewLayer = 'L2 Liquidity Pool'
      initialLayer = 'L2LP'
    }

    this.state = {
      totalFeeRate,
      userRewardFeeRate,
      poolInfo,
      userInfo,
      layer1,
      layer2,
      lpChoice: initialLayer,
      poolTab: initialViewLayer,
      showMDO: false //MDO = my deposits only
    }

  }

  componentDidMount() {

    const { totalFeeRate, userRewardFeeRate } = this.props.farm

    if (!totalFeeRate || !userRewardFeeRate) {
      this.props.dispatch(getFee())
    }

    this.props.dispatch(getFarmInfo())

  }

  componentDidUpdate(prevState) {

    const {
      totalFeeRate,
      userRewardFeeRate,
      poolInfo,
      userInfo,
    } = this.props.farm

    const {
      layer1,
      layer2
    } = this.props.balance

    if (prevState.farm.totalFeeRate !== totalFeeRate) {
      this.setState({ totalFeeRate })
    }

    if (prevState.farm.userRewardFeeRate !== userRewardFeeRate) {
      this.setState({ userRewardFeeRate })
    }

    if (!isEqual(prevState.farm.poolInfo, poolInfo)) {
      this.setState({ poolInfo })
    }

    if (!isEqual(prevState.farm.userInfo, userInfo)) {
      this.setState({ userInfo })
    }

    if (!isEqual(prevState.balance.layer1, layer1)) {
      this.setState({ layer1 })
    }

    if (!isEqual(prevState.balance.layer2, layer2)) {
      this.setState({ layer2 })
    }

  }


  getBalance(address, chain) {

    const { layer1, layer2 } = this.state;

    if (typeof (layer1) === 'undefined') return [0, 0]
    if (typeof (layer2) === 'undefined') return [0, 0]

    if (chain === 'L1') {
      let tokens = Object.entries(layer1)
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i][1].address.toLowerCase() === address.toLowerCase()) {
          return [tokens[i][1].balance, tokens[i][1].decimals]
        }
      }
    }
    else if (chain === 'L2') {
      let tokens = Object.entries(layer2)
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i][1].address.toLowerCase() === address.toLowerCase()) {
          return [tokens[i][1].balance, tokens[i][1].decimals]
        }
      }
    }

    return [0, 0]

  }

  handleChange = (event, t) => {
    if( t === 'L1 Liquidity Pool' )
      this.setState({ 
        lpChoice: 'L1LP',
        poolTab: t  
      })
    else if(t === 'L2 Liquidity Pool')
      this.setState({ 
        lpChoice: 'L2LP',
        poolTab: t 
      })
  }

  handleCheckBox = (e) =>{
    this.setState({
      showMDO: e.target.checked
    })
  }

  render() {
    const {
      // Pool
      poolInfo,
      // user
      userInfo,
      lpChoice,
      poolTab,
      showMDO
    } = this.state

    const { isMobile } = this.props

    const networkLayer = networkService.L1orL2
    
    return (
      <>
        <PageHeader title="Earn" />

        <Box sx={{ my: 3, width: '100%' }}>
        <Typography variant="body2" sx={{mt: 2, fontSize: '0.7em'}}>
          <span style={{fontWeight: '700'}}>The Math</span>. The operating principles of cross-chain swap pools are similar (but not identical) to AMMs. For cross-chain swapping, 
          liquidity providers and users deposit (and withdraw) funds. Those operations constantly change the pools' liquidity and available balance. 
          The <span style={{fontWeight: '700'}}>POOL LIQUIDITY</span> refers to the funds provided by the liquidity 
          providers. The <span style={{fontWeight: '700'}}>POOL BALANCE</span> refers to the amount of funds currently in the pool.
          <br/><span style={{fontWeight: '700'}}>Deposit example</span>. When you stake 10 OMG into the L2 pool, then the pool's liquidity and balance both increase by 10 OMG. 
          <br/><span style={{fontWeight: '700'}}>Swap On example</span>. When a user moves 10 OMG from L1 to L2, then they pay 10 OMG into the L1 pool (whose balance increases by 10 OMG). 
          Shortly after that, the L2 pool's balance decreases by 10 OMG, as funds flow out to the user's L2 wallet. 
          Note that swap operations do not change the pool's liquidity, but only the pool's current balance.
          <br/><span style={{fontWeight: '700'}}>Pool rebalancing</span>. When capital inflows (L1->L2) match outflows (L2->L1), the pools will remain balanced and the role of staking is to provide 
          'lubrication' to the system. However, sudden ingresses and egresses can drive the balances to become sharply asymmetric, with all available balances 
          residing either on the L2 side (in a mass exit) or on the L1 side (in a mass entry). 
          In the current (v1) system, the pool operator is responsible for periodic pool rebalancing, by using classic deposit and exit operations to move funds from one pool to another. There is however 
          a more elegant supply-and-demand answer which is that staking fees could be made to scale inversely with pool balance. 
          Thus, when pool balances are low, a spike in APR would attract new liquidity into the pools with low balances.
        </Typography>
      </Box>

        <Box sx={{ my: 3, width: '100%' }}>
          <Box sx={{ mb: 2, display: 'flex' }}>
            <Tabs
              activeTab={poolTab}
              onClick={(t)=>this.handleChange(null, t)}
              aria-label="Liquidity Pool Tab"
              tabs={["L1 Liquidity Pool", "L2 Liquidity Pool"]}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={showMDO}
                  onChange={this.handleCheckBox}
                  name="my deposits only"
                  color="primary"
                />
              }
              label="My Deposits Only"
            />
          </Box>

          {networkLayer === 'L2' && lpChoice === 'L1LP' &&
            <S.LayerAlert>
              <S.AlertInfo>
                <AlertIcon sx={{flex: 1}} />
                <S.AlertText
                  variant="body1"
                  component="p"
                >
                  You are on L2. To transact on L1, SWITCH LAYER to L1
                </S.AlertText>
              </S.AlertInfo>
              <LayerSwitcher isButton={true} size={isMobile ? "small" : "medium"}/>
            </S.LayerAlert>
          }

          {networkLayer === 'L1' && lpChoice === 'L2LP' &&
            <S.LayerAlert>
              <S.AlertInfo>
                <AlertIcon />
                <S.AlertText
                  variant="body2"
                  component="p"
                >
                  You are on L1. To transact on L2, SWITCH LAYER to L2
                </S.AlertText>
              </S.AlertInfo>
              <LayerSwitcher isButton={true} />
            </S.LayerAlert>
          }

          {!isMobile ? (
            <S.TableHeading>
              {tableHeadList.map((item) => {
                return (
                  <S.TableHeadingItem key={item.label} variant="body2" component="div">
                    {item.label}
                  </S.TableHeadingItem>
                )
              })}
            </S.TableHeading>
          ) : (null)}

          {lpChoice === 'L1LP' &&
            <Box>
              {Object.keys(poolInfo.L1LP).map((v, i) => {
                const ret = this.getBalance(v, 'L1')
                return (
                  <ListFarm
                    key={i}
                    poolInfo={poolInfo.L1LP[v]}
                    userInfo={userInfo.L1LP[v]}
                    L1orL2Pool={lpChoice}
                    balance={ret[0]}
                    decimals={ret[1]}
                    isMobile={isMobile}
                    showAll={!showMDO}
                  />
                )
              })}
            </Box>}

          {lpChoice === 'L2LP' &&
            <Box>
              {Object.keys(poolInfo.L2LP).map((v, i) => {
                const ret = this.getBalance(v, 'L2')
                return (
                  <ListFarm
                    key={i}
                    poolInfo={poolInfo.L2LP[v]}
                    userInfo={userInfo.L2LP[v]}
                    L1orL2Pool={lpChoice}
                    balance={ret[0]}
                    decimals={ret[1]}
                    isMobile={isMobile}
                    showAll={!showMDO}
                  />
                )
              })}
            </Box>
          }
        </Box>
      </>
    )
  }
}

const mapStateToProps = state => ({
  farm: state.farm,
  balance: state.balance
})

export default connect(mapStateToProps)(Farm)

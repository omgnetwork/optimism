import React, { useState, useEffect } from 'react'
import getBlockchain from '../../services/ethereum.js'
import Transfer from './Transfer'
import Delegate from './Delegate'
import Propose from './Propose'
import ProposalList from './ProposalList'
import { ethers } from 'ethers'

function Dao() {
  const [comp, setComp] = useState(undefined)
  const [address, setAddress] = useState(undefined)
  const [balance, setBalance] = useState(undefined)
  const [votes, setVotes] = useState(undefined)

  useEffect(() => {
    const init = async () => {
      const { signer, comp } = await getBlockchain()
      const address = await signer.getAddress()
      const balance = ethers.utils.formatEther(await comp.balanceOf(address))
      const votes = ethers.utils.formatEther(
        await comp.getCurrentVotes(address)
      )
      setComp(comp)
      setAddress(address)
      setBalance(balance)
      setVotes(votes)
      checkAccountChange()
    }
    init()
  }, [balance, address, votes])

  const checkAccountChange = async () => {
    const ethereum = window.ethereum
    if (ethereum) {
      // Listening to Event
      ethereum.on('accountsChanged', (accounts) => {
        console.log(accounts[0])
        setAddress(accounts[0])
      })
    }
  }

  if (
    typeof comp === 'undefined' ||
    typeof balance === 'undefined' ||
    typeof votes === 'undefined'
  ) {
    return (
      <div className="ui active dimmer">
        <div className="ui big text loader">Loading</div>
      </div>
    )
  }

  return (
    <div className="home">
      <h1>BOBA DAO</h1>
      <br />
      <br />
      <p className="top">{address}</p>
      <div className="info">
        <Transfer
          address={address}
          balance={Number(balance).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maxiumFractionDigits: 18,
          })}
          comp={comp}
          setBalance={setBalance}
        />
        <Delegate
          address={address}
          comp={comp}
          setVotes={setVotes}
          votes={votes}
        />
      </div>
      <Propose />
      <ProposalList />
    </div>
  )
}

export default Dao

import React, { useState, useEffect } from "react";
import getBlockchain from "../../services/ethereum.js";
import networkService from 'services/networkService'
import Transfer from "./Transfer";
import Delegate from "./Delegate";
import Propose from "./Propose";
import { openAlert, openError } from 'actions/uiAction'
import { ethers } from "ethers";

function Dao() {
  const [comp, setComp] = useState(undefined);
  const [address, setAddress] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [votes, setVotes] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      if(!networkService.CompContract) networkService.initializeDaoAccounts();

      // const { address  } = this.state;

      // const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'))

      // if (!networkStatus) {
      //   this.props.dispatch(openError('Please use L2 network.'));
      //   return;
      // }
      const signer  = networkService.provider.getSigner();
      const address = await signer.getAddress();
      const balance = networkService.getBalance(address);
      const votes = await networkService.fetchDaoCurrentVotes(address);
      setAddress(address);
      setBalance(balance);
      setVotes(votes);
      checkAccountChange();
    };
    init();
  }, [balance, address, votes]);

  const checkAccountChange = async () => {
    const ethereum = window.ethereum;
    if (ethereum) {
      // Listening to Event
      ethereum.on("accountsChanged", (accounts) => {
        console.log(accounts[0]);
        setAddress(accounts[0]);
      });
    }
  };

  if (
    typeof balance === "undefined" ||
    typeof votes === "undefined"
  ) {
    return "Loading...";
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
          setBalance={setBalance}
        />
        <Delegate
          address={address}
          setVotes={setVotes}
          votes={votes}
        />
      </div>
      <Propose />
    </div>
  );
}

export default Dao;

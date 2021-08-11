import React, { useState } from "react";
import { ethers, BigNumber } from "ethers";
import networkService from "services/networkService";

function Delegate(props) {
  const { address, balance, comp, setBalance } = props;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const updateBalance = async (e) => {
    e.preventDefault();
    const recipient = e.target.elements[1].value;
    var amount = e.target.elements[0].value;
    amount = BigNumber.from(amount);
    console.log(recipient);
    console.log(amount);
    const tx = await comp.transfer(
      recipient,
      amount.mul(BigNumber.from(10).pow(18))
    );
    await tx.wait();
    const newBalance = ethers.utils.formatEther(
      await networkService.CompContract.balanceOf(`0x21A235cf690798ee052f54888297Ad8F46D3F389`)
    );
    setBalance(newBalance);
  };
  return (
    <>
      <div>
        <h4>Wallet Balance</h4>
        <h3>{balance} BOBA</h3>
      </div>
      <button className="delegate" onClick={handleShow}>
        Send BOBA
      </button>
      {show ? (
        <>
          <div className="modal">
            <form
              className="delegateVotes"
              onSubmit={(e) => updateBalance(e)}
            >
              <h2>Send BOBA</h2>
              <input
                type="text"
                className="recipient"
                placeholder="Amount"
              />
              <input
                type="text"
                className="recipient"
                placeholder="Recipient Address"
              />
              <button className="close" onClick={handleClose}>
                x
              </button>
              <button type="submit" className="submit">
                <h4>Send</h4>
              </button>
            </form>
          </div>
          <div className="tint" />
        </>
      ) : null}
    </>
  );
}

export default Delegate;

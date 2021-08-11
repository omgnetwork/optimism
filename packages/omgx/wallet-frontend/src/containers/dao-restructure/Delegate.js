import React, { useState } from "react";
import { ethers } from "ethers";
import networkService from "services/networkService";

function Transfer(props) {
  const { address, comp, setVotes, votes } = props;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const updateVotes = async (e) => {
    e.preventDefault();
    const recipient = e.target.elements[0].value;
    const tx = await networkService.CompContract.delegate(recipient);
    await tx.wait();
    const votes = await networkService.fetchDaoCurrentVotes(address);
    setVotes(votes);
  };
  return (
    <>
      <div>
        <h4>Voting Power</h4>
        <h3>{votes} Votes</h3>
      </div>
      <button className="delegate" onClick={handleShow}>
        Delegate Votes
      </button>
      {show ? (
        <>
          <div className="modal">
            <form
              className="delegateVotes"
              onSubmit={(e) => updateVotes(e)}
            >
              <h2>Delegate Votes</h2>
              <input
                type="text"
                className="recipient"
                placeholder="Delegate Address"
              />
              <button className="close" onClick={handleClose}>
                x
              </button>
              <button type="submit" className="submit">
                <h4>Delegate Votes</h4>
              </button>
            </form>
          </div>
          <div className="tint" />
        </>
      ) : null}
    </>
  );
}

export default Transfer;

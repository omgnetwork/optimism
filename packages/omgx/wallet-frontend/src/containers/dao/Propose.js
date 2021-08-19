import React, { useState, useEffect } from "react";
import getBlockchain from "services/ethereum";
import Proposal from "./Proposal";
import { ethers } from "ethers";
/* global BigInt */

function Propose() {
  const [actions, setActions] = useState(["select"]);
  const [contracts, setContracts] = useState(["select"]);
  const [values, setValues] = useState([0]);
  const [description, setDescription] = useState("");
  const [cnt, setCnt] = useState(0);
  const [GovernorBravo, setGovernorBravo] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const { GovernorBravo} = await getBlockchain()
      setGovernorBravo(GovernorBravo)
    }
    init()
  }, [])

  let actionsMarkup = actions.map((action, i) => (
    <div>
      <Proposal
        actions={actions}
        contracts={contracts}
        values={values}
        i={i}
        setValues={setValues}
        setActions={setActions}
        setContracts={setContracts}
        key={cnt}
        GovernorBravo={GovernorBravo}
      />
      <button className="removeAction" onClick={(e) => removeAction(e, i)}>
        - Remove
      </button>
    </div>
  ));

  const addAction = (e) => {
    e.preventDefault();
    setActions((actions) => [...actions, "select"]);
    setContracts((contracts) => [...contracts, "select"]);
    setValues((values) => [...values, 0]);
    setCnt(cnt + 1);
  };

  const removeAction = (e, i) => {
    console.log(`Values: ${values}`);
    e.preventDefault();
    if (actions.length <= 1) return;
    setActions((actions) =>
      (function (actions, i) {
        let nActions = [...actions];
        actions.splice(i, 1);
        nActions.splice(i, 1);
        actions = nActions;
        return nActions;
      })(actions, i)
    );
    setContracts((contracts) =>
      (function (contracts, i) {
        let nContracts = [...contracts];
        contracts.splice(i, 1);
        nContracts.splice(i, 1);
        contracts = nContracts;
        return nContracts;
      })(contracts, i)
    );
    setValues((values) =>
      (function (values, i) {
        let nValues = [...values];
        values.splice(i, 1);
        nValues.splice(i, 1);
        values = nValues;
        return nValues;
      })(values, i)
    );

    setCnt(cnt - 1);
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    const decimals  = BigInt(10**18);
    let calldataTypes = [];
    let callData = [];
    let proposeValues = [];
    for(let i = 0; i <actions.length; i++){
      calldataTypes.push('uint256');
      proposeValues.push(0);
      callData.push(ethers.utils.defaultAbiCoder.encode(
        ['uint256'],
        [BigInt(values[i]) * decimals]
      ));
    }

    console.log(`Governor bravo address: ${GovernorBravo.address}`)
    console.log(`description: ${description}`);
    console.log(`actions: ${actions}`);
    console.log(`contracts: ${contracts}`);
    console.log(`values: ${values}`);

    await GovernorBravo.propose(
      contracts,
      proposeValues,
      actions,
      callData,
      description);


  }

  const handleChange = (e) => {
    setDescription(e.target.value);
  };

  return (
    <form className="proposalForm" onSubmit={(e) => submitProposal(e)}>
      <h2>Create a proposal</h2>
      <div className="createProposal">
        <div className="chooseActions">
          <h3>Choose Actions</h3>
          {actionsMarkup}
          {cnt <= 9 ? (
            <button className="addAction" onClick={(e) => addAction(e)}>
              + Add an Action
            </button>
          ) : null}
        </div>
        <div className="typeDescription">
          <h3>Proposal Description</h3>
          <textarea
            className="description"
            onChange={(e) => handleChange(e)}
          ></textarea>
        </div>
      </div>
      <button type="submit" className="submit">
        Submit Proposal
      </button>
    </form>
  );
}

export default Propose;

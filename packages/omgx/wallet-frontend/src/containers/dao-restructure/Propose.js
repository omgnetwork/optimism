import React, { useState } from "react";
import Proposal from "./Proposal";
import networkService from 'services/networkService'
import { ethers } from "ethers";

function Propose() {
  const [actions, setActions] = useState(["select"]);
  const [contracts, setContracts] = useState(["select"]);
  const [values, setValues] = useState([0]);
  const [description, setDescription] = useState("");
  const [cnt, setCnt] = useState(0);

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
      />
      <button className="removeAction" onClick={(e) => removeAction(e, i)}>
        + Remove
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
  // signatures ~ actions
  // contracts ~ targets
  // values ~ calldatas
  const submitProposal = async (e) => {
    e.preventDefault();
    let calldataTypes = [];
    let proposeValues = [];
    for(let i = 0; i <actions.length; i++) calldataTypes.push('uint'); proposeValues.push(0);


    networkService.propose(contracts,
                          values,
                          actions,
                          ethers.utils.defaultAbiCoder.encode(calldataTypes, values),
                          description);

    console.log(description);
    console.log(actions);
    console.log(contracts);
    console.log(values);
  };

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

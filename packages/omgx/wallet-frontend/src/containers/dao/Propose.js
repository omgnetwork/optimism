import React, { useState } from "react";
import Proposal from "./Proposal";

function Propose() {
  const [actions, setActions] = useState(["select"]);
  const [contracts, setContracts] = useState(["select"]);
  const [values, setValues] = useState([0]);
  const [description, setDescription] = useState("");
  const [cnt, setCnt] = useState(1);

  let actionsMarkup = actions.map((action, i) => (
    <Proposal
      actions={actions}
      contracts={contracts}
      values={values}
      i={i}
      setActions={setActions}
      setContracts={setContracts}
      setValues={setValues}
      key={i}
    />
  ));

  const addAction = (e) => {
    e.preventDefault();
    setActions((actions) => [...actions, "select"]);
    setContracts((contracts) => [...contracts, "select"]);
    setValues((values) => [...values, 0]);
    setCnt(cnt + 1);
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    // const tx = gov.methods.propose(targets, values, signatures, calldatas, description).send({ from: sender });
    
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

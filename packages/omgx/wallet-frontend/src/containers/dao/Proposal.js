import React, { useState, useEffect } from "react";
import getBlockchain from "../../services/ethereum.js";

function Proposal(props) {
  const {
    actions,
    contracts,
    values,
    i,
    setActions,
    setContracts,
    setValues
  } = props;
  const [action, setAction] = useState(actions[i]);
  const [contract, setContract] = useState(contracts[i]);
  const [GBAddress, setGBAddress] = useState(undefined);
  const [timelockAddress, setTimelockAddress] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const { timelock, GovernorBravo } = await getBlockchain();
      setGBAddress(GovernorBravo.address);
      setTimelockAddress(timelock.address);
    };
    init();
  }, []);

  const updateContracts = (e) => {
    e.preventDefault();
    let newContracts = contracts;
    newContracts[i] = e.target.value;
    setContract(e.target.value);
    setContracts(newContracts);
  };

  const updateActions = (e) => {
    e.preventDefault();
    let newActions = actions;
    newActions[i] = e.target.value;
    setAction(e.target.value);
    setActions(newActions);
  };

  const updateValues = (e) => {
    e.preventDefault();
    let newValues = values;
    newValues[i] = e.target.value;
    setValues(newValues);
  };

  return (
    <div className="proposal">
      <h3>{i + 1}.</h3>
      <div className="column">
        <select value={contract} onChange={(e) => updateContracts(e)}>
          <option value="select">Select a Contract</option>
          <option value="boba">Boba Fees</option>
          <option value={GBAddress}>Governor Bravo</option>
          <option value={timelockAddress}>Timelock</option>
        </select>
        {contract === "select" ? null : contract === GBAddress ? (
          <>
            <select value={action} onChange={(e) => updateActions(e)}>
              <option value="select">Select an Action</option>
              <option value="_setProposalThreshold">
                _setProposalThreshold
              </option>
              <option value="_setVotingDelay">_setVotingDelay</option>
              <option value="_setVotingPeriod">_setVotingPeriod</option>
              <option value="_grantComp">Grant BOBA</option>
            </select>
            {action === "select" ? null : action === "_grantComp" ? (
              <>
                <input type="text" placeholder="Recipient Address"></input>
                <input type="text" placeholder="Grant Amount"></input>
              </>
            ) : (
              <input
                type="text"
                placeholder={`new ${action} (uint)`}
                onChange={(e) => updateValues(e)}
              ></input>
            )}
          </>
        ) : (
          <input
            type="text"
            placeholder={`new ${action}`}
            onChange={(e) => updateValues(e)}
          ></input>
        )}
      </div>
    </div>
  );
}

export default Proposal;

import React, { useState, useEffect } from "react";
import getBlockchain from "../../services/ethereum.js";
// import GovernorBravoDelegate from '../../deployment/artifacts-ovm/contracts/GovernorBravoDelegate.json'
// import Timelock from '../../deployment/artifacts-ovm/contracts/Timelock.json'
import BobaMenu from '../../deployment/artifacts-ovm/contracts/BobaMenu.json'
// import { functions } from "lodash";

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
  const [bobaMenuAddress, setBobaMenuAddress] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const { timelock, GovernorBravo, bobaMenu } = await getBlockchain();
      setGBAddress(GovernorBravo.address);
      setTimelockAddress(timelock.address);
      setBobaMenuAddress(bobaMenu.address);
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

  function generateInputs(funcInputs, funcInputTypes){
    let funcInputsMarkup = funcInputs.map((input, index) => (
                <input type={"text"} placeholder={`${input}(${funcInputTypes[index]})`}></input>
    ));
    return (<>{funcInputsMarkup}</>);
  }

  function generateFunctions(funcs){
    let funcsMarkup = funcs.map((func) => (
      <option value={func}>{func}</option>
    ));
    return (
          <>
            <option value="select">Select an Action</option>
            {funcsMarkup}
          </>);

  }

  function getFunctionInputs(contractABI){
    let functions = [];
    let inputs = [];
    let inputTypes = []
    contractABI.forEach((func, index) => {
      // if type is function
      if(func.type === 'function' && func.stateMutability !== "view"){
        functions.push(func.name);
        // if the function has inputs
        if(func.inputs.length > 0){
          // make an array of all the inputs and input types the function has
          let funcInputs = [];
          let funcInputTypes = [];

          // for each input
          func.inputs.forEach((input, index) => {
            if('components' in input){
              let typeStr = input.type + '(';
              let nameStr = input.name + '(';
              input.components.forEach((component, index) => {
                typeStr += component.type + ',';
                nameStr += component.name + ',';
              });
              typeStr = typeStr.substring(0, typeStr.length - 1) + ')';
              nameStr = nameStr.substring(0, nameStr.length - 1) + ')';
              funcInputs.push(nameStr);
              funcInputTypes.push(typeStr);
            } else {
              funcInputs.push(input.name);
              funcInputTypes.push(input.type);
            }
          });

          // push the array of function inputs to the larger input array
          inputs.push(funcInputs);
          inputTypes.push(funcInputTypes);
        }else{
          inputs.push(null);
          inputTypes.push(null);
        }
      }
    });
    return [functions, inputs, inputTypes];
  }

  let bobaMenuFuncs, bobaMenuInputs, bobaMenuInputTypes;
  [bobaMenuFuncs, bobaMenuInputs, bobaMenuInputTypes] = getFunctionInputs(BobaMenu.abi);
  console.log('Boba Menu', bobaMenuFuncs);
  console.log('Boba Menu Inputs',bobaMenuInputs);
  console.log('Boba Menu Input Types', bobaMenuInputTypes);

  function contractFunctions(contract){
    switch(contract){
      case GBAddress:
        return (
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
        );
      case bobaMenuAddress:
        return (
          <>
            <select value={action} onChange={(e) => updateActions(e)}>
              {generateFunctions(bobaMenuFuncs)}
            </select>
              {(action === 'select' || bobaMenuInputs[bobaMenuFuncs.indexOf(action)] == null)?
              null :
              generateInputs(bobaMenuInputs[bobaMenuFuncs.indexOf(action)], bobaMenuInputTypes[bobaMenuFuncs.indexOf(action)])}
          </>
        );
      default:
        return (
          <input
            type="text"
            placeholder={`${action}`}
            onChange={(e) => updateValues(e)}
          ></input>
        );
    }

  }

  return (
    <div className="proposal">
      <h3>{i + 1}.</h3>
      <div className="column">
        <select value={contract} onChange={(e) => updateContracts(e)}>
          <option value="select">Select a Contract</option>
          <option value="boba">Boba Fees</option>
          <option value={GBAddress}>Governor Bravo</option>
          <option value={timelockAddress}>Timelock</option>
          <option value={bobaMenuAddress}>Boba Menu</option>
        </select>
        {contractFunctions(contract)}
      </div>
    </div>
  );
}

export default Proposal;

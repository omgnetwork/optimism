//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.0;

import "hardhat/console.sol";

interface Helper {
  function TuringCall(bytes memory) view external returns (string memory);
}

contract HelloTuring {
  address helperAddr;
  Helper myHelper;

  mapping (address => bytes) locales;
  mapping (address => string) cachedGreetings;

  constructor(address _helper) {
    console.log("Deploying a contract with helper address:", _helper);
    helperAddr = _helper;
    myHelper = Helper(helperAddr);
  }

  /* This tests the eth_call pathway by returning a customized
     greeting for the specified locale. This only requires a
     passthrough call to the helper contract.
  */
  function CustomGreetingFor(string memory locale)
    public view returns (string memory) {

    return myHelper.TuringCall(bytes(locale));
  }

  /* This tests the eth_sendRawTransaction pathway by fetching
     a personalized greeting string for the user's chosen locale
     and storing it for later reference.

     As a future enhancement, this method could send the resulting
     greeting string in an Event rather than requiring the user to
     query for it later.
  */
  function SetMyLocale(string memory locale) public {
    console.log("Registering locale for user:", msg.sender, locale);
    bytes memory localebytes = bytes(locale);
    require(localebytes.length <= 5 && localebytes.length > 0,
       "Invalid Locale"); // Example uses "EN_US" etc

    locales[msg.sender] = localebytes;
    cachedGreetings[msg.sender] = myHelper.TuringCall(localebytes);
  }

  /* Return the value set by a previous call to SetMyLocale() */
  function PersonalGreeting()
    public view returns (string memory) {
    string memory greeting = cachedGreetings[msg.sender];
    require (bytes(greeting).length > 0, "No cached greeting string for this user");

    return greeting;
  }
}

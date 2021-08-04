//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.0;

import "hardhat/console.sol";

contract TuringHelper {
  bytes data_URL;
  TuringHelper Self;
  bool mock_L1;

  constructor(string memory _url, bool _mock_L1) {
    console.log("Deploying a helper contract with data source:", _url);
    data_URL = bytes(_url);
    Self = TuringHelper(address(this));
    mock_L1 = _mock_L1;
  }

  function getURL() public view returns (string memory) {
    return string(data_URL);
  }

  function genRequestRLP(bytes memory payload) internal view
    returns (bytes memory)
  {
    // This function generates a Turing request consisting of a
    // fixed prefix string followed by parameters in RLP encoding.
    // The outer container is a 3-element array containing a
    // single-byte version number and two strings.
    // The first string is the URL and the second is the request
    // payload. For now the payload is parsed as a string, but the
    // full RLP-encoded value could be passed to the off-chain server
    // for it to decode.

    // For now this is the only valid value and all others are reserved.
    byte request_version = 0x01;

    bytes memory prefix = bytes("_OMGXTURING_");
    assert (prefix.length == 12);

    uint rLen = uint8(4 + payload.length + data_URL.length);
    uint i;
    uint j;

    assert (rLen <= 53); // or else it would need different encoding
    bytes memory result = new bytes(rLen + prefix.length);

    for (i=0; i < prefix.length; i++) result[j++] = prefix[i];

    result[j++] = bytes1(0xc0 + 3 + uint8(payload.length + data_URL.length));
    result[j++] = request_version;

    result[j++] = bytes1(0x80 + uint8(data_URL.length));
    for (i=0; i<data_URL.length; i++) result[j++] = data_URL[i];

    result[j++] = bytes1(0x80 + uint8(payload.length));
    for (i=0; i<payload.length; i++) result[j++] = payload[i];

    return result;
  }

  /* This is the interface to the off-chain mechanism. Although
     marked as "public", it is only to be called by TuringCall().
     The _slot parameters is overloaded to represent either the
     request parameters or the off-chain response, with the first
     parameter indicating which is which. When called as a request,
     it reverts with an encoded OMGX_TURING string. The modified
     l2geth intercepts this, performs the off-chain interaction,
     then rewrites the parameters and calls the method again in
     "response" mode. This response is then passed back to the
     caller.
  */

  function GetResponse(uint32 rType, bytes memory _slot)
    public view returns (string memory) {

    require (msg.sender == address(this));

    require (rType == 1 || rType == 2); // l2geth can pass 0 here to indicate an error
    require (_slot.length > 0);

    // If we don't have a modified l2geth, fake it locally.
    if (mock_L1 && rType == 1) {
      string memory fake_response = "Mock-L1";
      return Self.GetResponse(2, bytes(fake_response));
    }

    require (rType == 2, string(genRequestRLP(_slot)));
    return string(_slot);
  }

  /* This is called from the external contract. For now it only
     accepts the request payload. In the future it could take
     other parameters such as a timeout threshold. If this helper
     contract is generalized to support multiple users it could
     also include a specification of which data source to use, either
     by passing a URL directly or by passing an index to a previously
     registered source. The latter approach would also allow for
     security measures such as registering a TLS client certificate or
     encoding other secrets which we wouldn't want to publish to the
     blockchain.
  */

  function TuringCall(bytes memory _payload)
    public view returns (string memory) {
      require (_payload.length > 0);

      // Initiate the request. This can't be a local function call
      // because that would stay inside the EVM and not give l2geth
      // a place to intercept and re-write the call.

      string memory response = Self.GetResponse(1, _payload);
      return response;
  }
}

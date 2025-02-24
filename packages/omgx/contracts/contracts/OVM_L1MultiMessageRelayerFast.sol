// SPDX-License-Identifier: MIT
// @unsupported: ovm
pragma solidity >0.5.0 <0.8.0;
pragma experimental ABIEncoderV2;

/* Interface Imports */
import { iOVM_L1CrossDomainMessenger } from "@eth-optimism/contracts/contracts/optimistic-ethereum/iOVM/bridge/messaging/iOVM_L1CrossDomainMessenger.sol";
import { iOVM_L1MultiMessageRelayer } from "@eth-optimism/contracts/contracts/optimistic-ethereum/iOVM/bridge/messaging/iOVM_L1MultiMessageRelayer.sol";

/* Library Imports */
import { Lib_AddressResolver } from "@eth-optimism/contracts/contracts/optimistic-ethereum/libraries/resolver/Lib_AddressResolver.sol";

/**
 * @title OVM_L1MultiMessageRelayerFast
 * @dev The L1 Multi-Message Relayer Fast contract is a gas efficiency optimization which enables the
 * relayer to submit multiple messages in a single transaction to be relayed by the Fast L1 Cross Domain
 * Message Sender.
 *
 * Compiler used: solc
 * Runtime target: EVM
 */
contract OVM_L1MultiMessageRelayerFast is iOVM_L1MultiMessageRelayer, Lib_AddressResolver {

    /***************
     * Constructor *
     ***************/

    /**
     * @param _libAddressManager Address of the Address Manager.
     */
    constructor(
        address _libAddressManager
    )
        Lib_AddressResolver(_libAddressManager)
    {}


    /**********************
     * Function Modifiers *
     **********************/

    modifier onlyBatchRelayer() {
        require(
            msg.sender == resolve("OVM_L2BatchFastMessageRelayer"),
            // solhint-disable-next-line max-line-length
            "OVM_L1MultiMessageRelayerFast: Function can only be called by the OVM_L2BatchFastMessageRelayer"
        );
        _;
    }


    /********************
     * Public Functions *
     ********************/

    /**
     * @notice Forwards multiple cross domain messages to the L1 Cross Domain Messenger Fast for relaying
     * @param _messages An array of L2 to L1 messages
     */
    function batchRelayMessages(
        L2ToL1Message[] calldata _messages
    )
        override
        external
        onlyBatchRelayer
    {
        iOVM_L1CrossDomainMessenger messenger = iOVM_L1CrossDomainMessenger(
            resolve("Proxy__OVM_L1CrossDomainMessengerFast")
        );

        for (uint256 i = 0; i < _messages.length; i++) {
            L2ToL1Message memory message = _messages[i];
            messenger.relayMessage(
                message.target,
                message.sender,
                message.message,
                message.messageNonce,
                message.proof
            );
        }
    }
}

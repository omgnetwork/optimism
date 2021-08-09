# Remove Parameter GovernorAlpha

In GovernorBravoDelegate.sol, modify \_initiate function:

- Delete lines 321 and 326
- Change line 327 to `initialProposalId = 1;`

In GovernorBravoInterfaces.sol, delete GovernorAlpha Interface:

- Delete lines 179-182

### Original \_initiate function:

```
    /**
      * @notice Initiate the GovernorBravo contract
      * @dev Admin only. Sets initial proposal id which initiates the contract, ensuring a continuous proposal id count
      * @param governorAlpha The address for the Governor to continue the proposal id count from
      */
    function _initiate(address governorAlpha) external {
        require(msg.sender == admin, "GovernorBravo::_initiate: admin only");
        require(initialProposalId == 0, "GovernorBravo::_initiate: can only initiate once");
        proposalCount = GovernorAlpha(governorAlpha).proposalCount();
        initialProposalId = proposalCount;
        timelock.acceptAdmin();
    }
```

### New \_initiate function:

```
    /**
      * @notice Initiate the GovernorBravo contract
      * @dev Admin only. Sets initial proposal id which initiates the contract, ensuring a continuous proposal id count
      */
    function _initiate() external {
        require(msg.sender == admin, "GovernorBravo::_initiate: admin only");
        require(initialProposalId == 0, "GovernorBravo::_initiate: can only initiate once");
        initialProposalId = 1;
        timelock.acceptAdmin();
    }
```

### Deleted GovernorAlpha Interface:

```
interface GovernorAlpha {
    /// @notice The total number of proposals
    function proposalCount() external returns (uint);
}
```

### Notes:

- MINIMUM_DELAY in Timelock.sol set to 0 for testing purposes only

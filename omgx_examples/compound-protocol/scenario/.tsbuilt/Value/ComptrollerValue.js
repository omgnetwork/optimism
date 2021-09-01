"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComptrollerValue = exports.comptrollerFetchers = exports.getHypotheticalLiquidity = exports.getLiquidity = exports.getComptrollerAddress = void 0;
const CoreValue_1 = require("../CoreValue");
const Value_1 = require("../Value");
const Command_1 = require("../Command");
const ContractLookup_1 = require("../ContractLookup");
const CTokenValue_1 = require("../Value/CTokenValue");
const Utils_1 = require("../Utils");
async function getComptrollerAddress(world, comptroller) {
    return new Value_1.AddressV(comptroller._address);
}
exports.getComptrollerAddress = getComptrollerAddress;
async function getLiquidity(world, comptroller, user) {
    let { 0: error, 1: liquidity, 2: shortfall } = await comptroller.methods.getAccountLiquidity(user).call();
    if (Number(error) != 0) {
        throw new Error(`Failed to compute account liquidity: error code = ${error}`);
    }
    return new Value_1.NumberV(Number(liquidity) - Number(shortfall));
}
exports.getLiquidity = getLiquidity;
async function getHypotheticalLiquidity(world, comptroller, account, asset, redeemTokens, borrowAmount) {
    let { 0: error, 1: liquidity, 2: shortfall } = await comptroller.methods.getHypotheticalAccountLiquidity(account, asset, redeemTokens, borrowAmount).call();
    if (Number(error) != 0) {
        throw new Error(`Failed to compute account hypothetical liquidity: error code = ${error}`);
    }
    return new Value_1.NumberV(Number(liquidity) - Number(shortfall));
}
exports.getHypotheticalLiquidity = getHypotheticalLiquidity;
async function getPriceOracle(world, comptroller) {
    return new Value_1.AddressV(await comptroller.methods.oracle().call());
}
async function getCloseFactor(world, comptroller) {
    return new Value_1.NumberV(await comptroller.methods.closeFactorMantissa().call(), 1e18);
}
async function getMaxAssets(world, comptroller) {
    return new Value_1.NumberV(await comptroller.methods.maxAssets().call());
}
async function getLiquidationIncentive(world, comptroller) {
    return new Value_1.NumberV(await comptroller.methods.liquidationIncentiveMantissa().call(), 1e18);
}
async function getImplementation(world, comptroller) {
    return new Value_1.AddressV(await comptroller.methods.comptrollerImplementation().call());
}
async function getBlockNumber(world, comptroller) {
    return new Value_1.NumberV(await comptroller.methods.getBlockNumber().call());
}
async function getAdmin(world, comptroller) {
    return new Value_1.AddressV(await comptroller.methods.admin().call());
}
async function getPendingAdmin(world, comptroller) {
    return new Value_1.AddressV(await comptroller.methods.pendingAdmin().call());
}
async function getCollateralFactor(world, comptroller, cToken) {
    let { 0: _isListed, 1: collateralFactorMantissa } = await comptroller.methods.markets(cToken._address).call();
    return new Value_1.NumberV(collateralFactorMantissa, 1e18);
}
async function membershipLength(world, comptroller, user) {
    return new Value_1.NumberV(await comptroller.methods.membershipLength(user).call());
}
async function checkMembership(world, comptroller, user, cToken) {
    return new Value_1.BoolV(await comptroller.methods.checkMembership(user, cToken._address).call());
}
async function getAssetsIn(world, comptroller, user) {
    let assetsList = await comptroller.methods.getAssetsIn(user).call();
    return new Value_1.ListV(assetsList.map((a) => new Value_1.AddressV(a)));
}
async function getCompMarkets(world, comptroller) {
    let mkts = await comptroller.methods.getCompMarkets().call();
    return new Value_1.ListV(mkts.map((a) => new Value_1.AddressV(a)));
}
async function checkListed(world, comptroller, cToken) {
    let { 0: isListed, 1: _collateralFactorMantissa } = await comptroller.methods.markets(cToken._address).call();
    return new Value_1.BoolV(isListed);
}
async function checkIsComped(world, comptroller, cToken) {
    let { 0: isListed, 1: _collateralFactorMantissa, 2: isComped } = await comptroller.methods.markets(cToken._address).call();
    return new Value_1.BoolV(isComped);
}
function comptrollerFetchers() {
    return [
        new Command_1.Fetcher(`
        #### Address

        * "Comptroller Address" - Returns address of comptroller
      `, "Address", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getComptrollerAddress(world, comptroller)),
        new Command_1.Fetcher(`
        #### Liquidity

        * "Comptroller Liquidity <User>" - Returns a given user's trued up liquidity
          * E.g. "Comptroller Liquidity Geoff"
      `, "Liquidity", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV)
        ], (world, { comptroller, account }) => getLiquidity(world, comptroller, account.val)),
        new Command_1.Fetcher(`
        #### Hypothetical

        * "Comptroller Hypothetical <User> <Action> <Asset> <Number>" - Returns a given user's trued up liquidity given a hypothetical change in asset with redeeming a certain number of tokens and/or borrowing a given amount.
          * E.g. "Comptroller Hypothetical Geoff Redeems 6.0 cZRX"
          * E.g. "Comptroller Hypothetical Geoff Borrows 5.0 cZRX"
      `, "Hypothetical", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
            new Command_1.Arg("action", CoreValue_1.getStringV),
            new Command_1.Arg("amount", CoreValue_1.getNumberV),
            new Command_1.Arg("cToken", CTokenValue_1.getCTokenV)
        ], async (world, { comptroller, account, action, cToken, amount }) => {
            let redeemTokens;
            let borrowAmount;
            switch (action.val.toLowerCase()) {
                case "borrows":
                    redeemTokens = new Value_1.NumberV(0);
                    borrowAmount = amount;
                    break;
                case "redeems":
                    redeemTokens = amount;
                    borrowAmount = new Value_1.NumberV(0);
                    break;
                default:
                    throw new Error(`Unknown hypothetical: ${action.val}`);
            }
            return await getHypotheticalLiquidity(world, comptroller, account.val, cToken._address, redeemTokens.encode(), borrowAmount.encode());
        }),
        new Command_1.Fetcher(`
        #### Admin

        * "Comptroller Admin" - Returns the Comptrollers's admin
          * E.g. "Comptroller Admin"
      `, "Admin", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getAdmin(world, comptroller)),
        new Command_1.Fetcher(`
        #### PendingAdmin

        * "Comptroller PendingAdmin" - Returns the pending admin of the Comptroller
          * E.g. "Comptroller PendingAdmin" - Returns Comptroller's pending admin
      `, "PendingAdmin", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
        ], (world, { comptroller }) => getPendingAdmin(world, comptroller)),
        new Command_1.Fetcher(`
        #### PriceOracle

        * "Comptroller PriceOracle" - Returns the Comptrollers's price oracle
          * E.g. "Comptroller PriceOracle"
      `, "PriceOracle", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getPriceOracle(world, comptroller)),
        new Command_1.Fetcher(`
        #### CloseFactor

        * "Comptroller CloseFactor" - Returns the Comptrollers's close factor
          * E.g. "Comptroller CloseFactor"
      `, "CloseFactor", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getCloseFactor(world, comptroller)),
        new Command_1.Fetcher(`
        #### MaxAssets

        * "Comptroller MaxAssets" - Returns the Comptrollers's max assets
          * E.g. "Comptroller MaxAssets"
      `, "MaxAssets", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getMaxAssets(world, comptroller)),
        new Command_1.Fetcher(`
        #### LiquidationIncentive

        * "Comptroller LiquidationIncentive" - Returns the Comptrollers's liquidation incentive
          * E.g. "Comptroller LiquidationIncentive"
      `, "LiquidationIncentive", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getLiquidationIncentive(world, comptroller)),
        new Command_1.Fetcher(`
        #### Implementation

        * "Comptroller Implementation" - Returns the Comptrollers's implementation
          * E.g. "Comptroller Implementation"
      `, "Implementation", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getImplementation(world, comptroller)),
        new Command_1.Fetcher(`
        #### BlockNumber

        * "Comptroller BlockNumber" - Returns the Comptrollers's mocked block number (for scenario runner)
          * E.g. "Comptroller BlockNumber"
      `, "BlockNumber", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], (world, { comptroller }) => getBlockNumber(world, comptroller)),
        new Command_1.Fetcher(`
        #### CollateralFactor

        * "Comptroller CollateralFactor <CToken>" - Returns the collateralFactor associated with a given asset
          * E.g. "Comptroller CollateralFactor cZRX"
      `, "CollateralFactor", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("cToken", CTokenValue_1.getCTokenV)
        ], (world, { comptroller, cToken }) => getCollateralFactor(world, comptroller, cToken)),
        new Command_1.Fetcher(`
        #### MembershipLength

        * "Comptroller MembershipLength <User>" - Returns a given user's length of membership
          * E.g. "Comptroller MembershipLength Geoff"
      `, "MembershipLength", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV)
        ], (world, { comptroller, account }) => membershipLength(world, comptroller, account.val)),
        new Command_1.Fetcher(`
        #### CheckMembership

        * "Comptroller CheckMembership <User> <CToken>" - Returns one if user is in asset, zero otherwise.
          * E.g. "Comptroller CheckMembership Geoff cZRX"
      `, "CheckMembership", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
            new Command_1.Arg("cToken", CTokenValue_1.getCTokenV)
        ], (world, { comptroller, account, cToken }) => checkMembership(world, comptroller, account.val, cToken)),
        new Command_1.Fetcher(`
        #### AssetsIn

        * "Comptroller AssetsIn <User>" - Returns the assets a user is in
          * E.g. "Comptroller AssetsIn Geoff"
      `, "AssetsIn", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV)
        ], (world, { comptroller, account }) => getAssetsIn(world, comptroller, account.val)),
        new Command_1.Fetcher(`
        #### CheckListed

        * "Comptroller CheckListed <CToken>" - Returns true if market is listed, false otherwise.
          * E.g. "Comptroller CheckListed cZRX"
      `, "CheckListed", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("cToken", CTokenValue_1.getCTokenV)
        ], (world, { comptroller, cToken }) => checkListed(world, comptroller, cToken)),
        new Command_1.Fetcher(`
        #### CheckIsComped

        * "Comptroller CheckIsComped <CToken>" - Returns true if market is listed, false otherwise.
          * E.g. "Comptroller CheckIsComped cZRX"
      `, "CheckIsComped", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("cToken", CTokenValue_1.getCTokenV)
        ], (world, { comptroller, cToken }) => checkIsComped(world, comptroller, cToken)),
        new Command_1.Fetcher(`
        #### PauseGuardian

        * "PauseGuardian" - Returns the Comptrollers's PauseGuardian
        * E.g. "Comptroller PauseGuardian"
        `, "PauseGuardian", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })
        ], async (world, { comptroller }) => new Value_1.AddressV(await comptroller.methods.pauseGuardian().call())),
        new Command_1.Fetcher(`
        #### _MintGuardianPaused

        * "_MintGuardianPaused" - Returns the Comptrollers's original global Mint paused status
        * E.g. "Comptroller _MintGuardianPaused"
        `, "_MintGuardianPaused", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], async (world, { comptroller }) => new Value_1.BoolV(await comptroller.methods._mintGuardianPaused().call())),
        new Command_1.Fetcher(`
        #### _BorrowGuardianPaused

        * "_BorrowGuardianPaused" - Returns the Comptrollers's original global Borrow paused status
        * E.g. "Comptroller _BorrowGuardianPaused"
        `, "_BorrowGuardianPaused", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], async (world, { comptroller }) => new Value_1.BoolV(await comptroller.methods._borrowGuardianPaused().call())),
        new Command_1.Fetcher(`
        #### TransferGuardianPaused

        * "TransferGuardianPaused" - Returns the Comptrollers's Transfer paused status
        * E.g. "Comptroller TransferGuardianPaused"
        `, "TransferGuardianPaused", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], async (world, { comptroller }) => new Value_1.BoolV(await comptroller.methods.transferGuardianPaused().call())),
        new Command_1.Fetcher(`
        #### SeizeGuardianPaused

        * "SeizeGuardianPaused" - Returns the Comptrollers's Seize paused status
        * E.g. "Comptroller SeizeGuardianPaused"
        `, "SeizeGuardianPaused", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], async (world, { comptroller }) => new Value_1.BoolV(await comptroller.methods.seizeGuardianPaused().call())),
        new Command_1.Fetcher(`
        #### MintGuardianMarketPaused

        * "MintGuardianMarketPaused" - Returns the Comptrollers's Mint paused status in market
        * E.g. "Comptroller MintGuardianMarketPaused cREP"
        `, "MintGuardianMarketPaused", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("cToken", CTokenValue_1.getCTokenV)
        ], async (world, { comptroller, cToken }) => new Value_1.BoolV(await comptroller.methods.mintGuardianPaused(cToken._address).call())),
        new Command_1.Fetcher(`
        #### BorrowGuardianMarketPaused

        * "BorrowGuardianMarketPaused" - Returns the Comptrollers's Borrow paused status in market
        * E.g. "Comptroller BorrowGuardianMarketPaused cREP"
        `, "BorrowGuardianMarketPaused", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("cToken", CTokenValue_1.getCTokenV)
        ], async (world, { comptroller, cToken }) => new Value_1.BoolV(await comptroller.methods.borrowGuardianPaused(cToken._address).call())),
        new Command_1.Fetcher(`
      #### GetCompMarkets

      * "GetCompMarkets" - Returns an array of the currently enabled Comp markets. To use the auto-gen array getter compMarkets(uint), use CompMarkets
      * E.g. "Comptroller GetCompMarkets"
      `, "GetCompMarkets", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], async (world, { comptroller }) => await getCompMarkets(world, comptroller)),
        new Command_1.Fetcher(`
      #### CompRate

      * "CompRate" - Returns the current comp rate.
      * E.g. "Comptroller CompRate"
      `, "CompRate", [new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })], async (world, { comptroller }) => new Value_1.NumberV(await comptroller.methods.compRate().call())),
        new Command_1.Fetcher(`
        #### CallNum

        * "CallNum signature:<String> ...callArgs<CoreValue>" - Simple direct call method
          * E.g. "Comptroller CallNum \"compSpeeds(address)\" (Address Coburn)"
      `, "CallNum", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("signature", CoreValue_1.getStringV),
            new Command_1.Arg("callArgs", CoreValue_1.getCoreValue, { variadic: true, mapped: true })
        ], async (world, { comptroller, signature, callArgs }) => {
            const fnData = Utils_1.encodeABI(world, signature.val, callArgs.map(a => a.val));
            const res = await world.web3.eth.call({
                to: comptroller._address,
                data: fnData
            });
            const resNum = world.web3.eth.abi.decodeParameter('uint256', res);
            return new Value_1.NumberV(resNum);
        }),
        new Command_1.Fetcher(`
        #### CompSupplyState(address)

        * "Comptroller CompBorrowState cZRX "index"
      `, "CompSupplyState", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("CToken", CTokenValue_1.getCTokenV),
            new Command_1.Arg("key", CoreValue_1.getStringV),
        ], async (world, { comptroller, CToken, key }) => {
            const result = await comptroller.methods.compSupplyState(CToken._address).call();
            return new Value_1.NumberV(result[key.val]);
        }),
        new Command_1.Fetcher(`
        #### CompBorrowState(address)

        * "Comptroller CompBorrowState cZRX "index"
      `, "CompBorrowState", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("CToken", CTokenValue_1.getCTokenV),
            new Command_1.Arg("key", CoreValue_1.getStringV),
        ], async (world, { comptroller, CToken, key }) => {
            const result = await comptroller.methods.compBorrowState(CToken._address).call();
            return new Value_1.NumberV(result[key.val]);
        }),
        new Command_1.Fetcher(`
        #### CompAccrued(address)

        * "Comptroller CompAccrued Coburn
      `, "CompAccrued", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { comptroller, account }) => {
            const result = await comptroller.methods.compAccrued(account.val).call();
            return new Value_1.NumberV(result);
        }),
        new Command_1.Fetcher(`
        #### compSupplierIndex

        * "Comptroller CompSupplierIndex cZRX Coburn
      `, "CompSupplierIndex", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("CToken", CTokenValue_1.getCTokenV),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { comptroller, CToken, account }) => {
            return new Value_1.NumberV(await comptroller.methods.compSupplierIndex(CToken._address, account.val).call());
        }),
        new Command_1.Fetcher(`
        #### CompBorrowerIndex

        * "Comptroller CompBorrowerIndex cZRX Coburn
      `, "CompBorrowerIndex", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("CToken", CTokenValue_1.getCTokenV),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { comptroller, CToken, account }) => {
            return new Value_1.NumberV(await comptroller.methods.compBorrowerIndex(CToken._address, account.val).call());
        }),
        new Command_1.Fetcher(`
        #### CompSpeed

        * "Comptroller CompSpeed cZRX
      `, "CompSpeed", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("CToken", CTokenValue_1.getCTokenV),
        ], async (world, { comptroller, CToken }) => {
            return new Value_1.NumberV(await comptroller.methods.compSpeeds(CToken._address).call());
        }),
        new Command_1.Fetcher(`
        #### BorrowCapGuardian

        * "BorrowCapGuardian" - Returns the Comptrollers's BorrowCapGuardian
        * E.g. "Comptroller BorrowCapGuardian"
        `, "BorrowCapGuardian", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true })
        ], async (world, { comptroller }) => new Value_1.AddressV(await comptroller.methods.borrowCapGuardian().call())),
        new Command_1.Fetcher(`
        #### BorrowCaps

        * "Comptroller BorrowCaps cZRX
      `, "BorrowCaps", [
            new Command_1.Arg("comptroller", ContractLookup_1.getComptroller, { implicit: true }),
            new Command_1.Arg("CToken", CTokenValue_1.getCTokenV),
        ], async (world, { comptroller, CToken }) => {
            return new Value_1.NumberV(await comptroller.methods.borrowCaps(CToken._address).call());
        })
    ];
}
exports.comptrollerFetchers = comptrollerFetchers;
async function getComptrollerValue(world, event) {
    return await Command_1.getFetcherValue("Comptroller", comptrollerFetchers(), world, event);
}
exports.getComptrollerValue = getComptrollerValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHRyb2xsZXJWYWx1ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9WYWx1ZS9Db21wdHJvbGxlclZhbHVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLDRDQUtzQjtBQUN0QixvQ0FPa0I7QUFDbEIsd0NBQXlEO0FBQ3pELHNEQUFpRDtBQUVqRCxzREFBZ0Q7QUFDaEQsb0NBQXVEO0FBRWhELEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxLQUFZLEVBQUUsV0FBd0I7SUFDaEYsT0FBTyxJQUFJLGdCQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFGRCxzREFFQztBQUVNLEtBQUssVUFBVSxZQUFZLENBQUMsS0FBWSxFQUFFLFdBQXdCLEVBQUUsSUFBWTtJQUNyRixJQUFJLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELEtBQUssRUFBRSxDQUFDLENBQUM7S0FDL0U7SUFDRCxPQUFPLElBQUksZUFBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBTkQsb0NBTUM7QUFFTSxLQUFLLFVBQVUsd0JBQXdCLENBQUMsS0FBWSxFQUFFLFdBQXdCLEVBQUUsT0FBZSxFQUFFLEtBQWEsRUFBRSxZQUEyQixFQUFFLFlBQTJCO0lBQzdLLElBQUksRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBQyxHQUFH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IGZyb20gJy4uL0V2ZW50JztcbmltcG9ydCB7V29ybGR9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7Q29tcHRyb2xsZXJ9IGZyb20gJy4uL0NvbnRyYWN0L0NvbXB0cm9sbGVyJztcbmltcG9ydCB7Q1Rva2VufSBmcm9tICcuLi9Db250cmFjdC9DVG9rZW4nO1xuaW1wb3J0IHtcbiAgZ2V0QWRkcmVzc1YsXG4gIGdldENvcmVWYWx1ZSxcbiAgZ2V0U3RyaW5nVixcbiAgZ2V0TnVtYmVyVlxufSBmcm9tICcuLi9Db3JlVmFsdWUnO1xuaW1wb3J0IHtcbiAgQWRkcmVzc1YsXG4gIEJvb2xWLFxuICBMaXN0VixcbiAgTnVtYmVyVixcbiAgU3RyaW5nVixcbiAgVmFsdWVcbn0gZnJvbSAnLi4vVmFsdWUnO1xuaW1wb3J0IHtBcmcsIEZldGNoZXIsIGdldEZldGNoZXJWYWx1ZX0gZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQge2dldENvbXB0cm9sbGVyfSBmcm9tICcuLi9Db250cmFjdExvb2t1cCc7XG5pbXBvcnQge2VuY29kZWROdW1iZXJ9IGZyb20gJy4uL0VuY29kaW5nJztcbmltcG9ydCB7Z2V0Q1Rva2VuVn0gZnJvbSAnLi4vVmFsdWUvQ1Rva2VuVmFsdWUnO1xuaW1wb3J0IHsgZW5jb2RlUGFyYW1ldGVycywgZW5jb2RlQUJJIH0gZnJvbSAnLi4vVXRpbHMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29tcHRyb2xsZXJBZGRyZXNzKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyKTogUHJvbWlzZTxBZGRyZXNzVj4ge1xuICByZXR1cm4gbmV3IEFkZHJlc3NWKGNvbXB0cm9sbGVyLl9hZGRyZXNzKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldExpcXVpZGl0eSh3b3JsZDogV29ybGQsIGNvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgdXNlcjogc3RyaW5nKTogUHJvbWlzZTxOdW1iZXJWPiB7XG4gIGxldCB7MDogZXJyb3IsIDE6IGxpcXVpZGl0eSwgMjogc2hvcnRmYWxsfSA9IGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuZ2V0QWNjb3VudExpcXVpZGl0eSh1c2VyKS5jYWxsKCk7XG4gIGlmIChOdW1iZXIoZXJyb3IpICE9IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBjb21wdXRlIGFjY291bnQgbGlxdWlkaXR5OiBlcnJvciBjb2RlID0gJHtlcnJvcn1gKTtcbiAgfVxuICByZXR1cm4gbmV3IE51bWJlclYoTnVtYmVyKGxpcXVpZGl0eSkgLSBOdW1iZXIoc2hvcnRmYWxsKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRIeXBvdGhldGljYWxMaXF1aWRpdHkod29ybGQ6IFdvcmxkLCBjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIGFjY291bnQ6IHN0cmluZywgYXNzZXQ6IHN0cmluZywgcmVkZWVtVG9rZW5zOiBlbmNvZGVkTnVtYmVyLCBib3Jyb3dBbW91bnQ6IGVuY29kZWROdW1iZXIpOiBQcm9taXNlPE51bWJlclY+IHtcbiAgbGV0IHswOiBlcnJvciwgMTogbGlxdWlkaXR5LCAyOiBzaG9ydGZhbGx9ID0gYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5nZXRIeXBvdGhldGljYWxBY2NvdW50TGlxdWlkaXR5KGFjY291bnQsIGFzc2V0LCByZWRlZW1Ub2tlbnMsIGJvcnJvd0Ftb3VudCkuY2FsbCgpO1xuICBpZiAoTnVtYmVyKGVycm9yKSAhPSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gY29tcHV0ZSBhY2NvdW50IGh5cG90aGV0aWNhbCBsaXF1aWRpdHk6IGVycm9yIGNvZGUgPSAke2Vycm9yfWApO1xuICB9XG4gIHJldHVybiBuZXcgTnVtYmVyVihOdW1iZXIobGlxdWlkaXR5KSAtIE51bWJlcihzaG9ydGZhbGwpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0UHJpY2VPcmFjbGUod29ybGQ6IFdvcmxkLCBjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIpOiBQcm9taXNlPEFkZHJlc3NWPiB7XG4gIHJldHVybiBuZXcgQWRkcmVzc1YoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5vcmFjbGUoKS5jYWxsKCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRDbG9zZUZhY3Rvcih3b3JsZDogV29ybGQsIGNvbXB0cm9sbGVyOiBDb21wdHJvbGxlcik6IFByb21pc2U8TnVtYmVyVj4ge1xuICByZXR1cm4gbmV3IE51bWJlclYoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5jbG9zZUZhY3Rvck1hbnRpc3NhKCkuY2FsbCgpLCAxZTE4KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0TWF4QXNzZXRzKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyKTogUHJvbWlzZTxOdW1iZXJWPiB7XG4gIHJldHVybiBuZXcgTnVtYmVyVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLm1heEFzc2V0cygpLmNhbGwoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldExpcXVpZGF0aW9uSW5jZW50aXZlKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyKTogUHJvbWlzZTxOdW1iZXJWPiB7XG4gIHJldHVybiBuZXcgTnVtYmVyVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLmxpcXVpZGF0aW9uSW5jZW50aXZlTWFudGlzc2EoKS5jYWxsKCksIDFlMTgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRJbXBsZW1lbnRhdGlvbih3b3JsZDogV29ybGQsIGNvbXB0cm9sbGVyOiBDb21wdHJvbGxlcik6IFByb21pc2U8QWRkcmVzc1Y+IHtcbiAgcmV0dXJuIG5ldyBBZGRyZXNzVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLmNvbXB0cm9sbGVySW1wbGVtZW50YXRpb24oKS5jYWxsKCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRCbG9ja051bWJlcih3b3JsZDogV29ybGQsIGNvbXB0cm9sbGVyOiBDb21wdHJvbGxlcik6IFByb21pc2U8TnVtYmVyVj4ge1xuICByZXR1cm4gbmV3IE51bWJlclYoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5nZXRCbG9ja051bWJlcigpLmNhbGwoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFkbWluKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyKTogUHJvbWlzZTxBZGRyZXNzVj4ge1xuICByZXR1cm4gbmV3IEFkZHJlc3NWKGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuYWRtaW4oKS5jYWxsKCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nQWRtaW4od29ybGQ6IFdvcmxkLCBjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIpOiBQcm9taXNlPEFkZHJlc3NWPiB7XG4gIHJldHVybiBuZXcgQWRkcmVzc1YoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5wZW5kaW5nQWRtaW4oKS5jYWxsKCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRDb2xsYXRlcmFsRmFjdG9yKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBjVG9rZW46IENUb2tlbik6IFByb21pc2U8TnVtYmVyVj4ge1xuICBsZXQgezA6IF9pc0xpc3RlZCwgMTogY29sbGF0ZXJhbEZhY3Rvck1hbnRpc3NhfSA9IGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMubWFya2V0cyhjVG9rZW4uX2FkZHJlc3MpLmNhbGwoKTtcbiAgcmV0dXJuIG5ldyBOdW1iZXJWKGNvbGxhdGVyYWxGYWN0b3JNYW50aXNzYSwgMWUxOCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1lbWJlcnNoaXBMZW5ndGgod29ybGQ6IFdvcmxkLCBjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIHVzZXI6IHN0cmluZyk6IFByb21pc2U8TnVtYmVyVj4ge1xuICByZXR1cm4gbmV3IE51bWJlclYoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5tZW1iZXJzaGlwTGVuZ3RoKHVzZXIpLmNhbGwoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrTWVtYmVyc2hpcCh3b3JsZDogV29ybGQsIGNvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgdXNlcjogc3RyaW5nLCBjVG9rZW46IENUb2tlbik6IFByb21pc2U8Qm9vbFY+IHtcbiAgcmV0dXJuIG5ldyBCb29sVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLmNoZWNrTWVtYmVyc2hpcCh1c2VyLCBjVG9rZW4uX2FkZHJlc3MpLmNhbGwoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEFzc2V0c0luKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCB1c2VyOiBzdHJpbmcpOiBQcm9taXNlPExpc3RWPiB7XG4gIGxldCBhc3NldHNMaXN0ID0gYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5nZXRBc3NldHNJbih1c2VyKS5jYWxsKCk7XG5cbiAgcmV0dXJuIG5ldyBMaXN0Vihhc3NldHNMaXN0Lm1hcCgoYSkgPT4gbmV3IEFkZHJlc3NWKGEpKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldENvbXBNYXJrZXRzKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyKTogUHJvbWlzZTxMaXN0Vj4ge1xuICBsZXQgbWt0cyA9IGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuZ2V0Q29tcE1hcmtldHMoKS5jYWxsKCk7XG5cbiAgcmV0dXJuIG5ldyBMaXN0Vihta3RzLm1hcCgoYSkgPT4gbmV3IEFkZHJlc3NWKGEpKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrTGlzdGVkKHdvcmxkOiBXb3JsZCwgY29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBjVG9rZW46IENUb2tlbik6IFByb21pc2U8Qm9vbFY+IHtcbiAgbGV0IHswOiBpc0xpc3RlZCwgMTogX2NvbGxhdGVyYWxGYWN0b3JNYW50aXNzYX0gPSBhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLm1hcmtldHMoY1Rva2VuLl9hZGRyZXNzKS5jYWxsKCk7XG5cbiAgcmV0dXJuIG5ldyBCb29sVihpc0xpc3RlZCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrSXNDb21wZWQod29ybGQ6IFdvcmxkLCBjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIGNUb2tlbjogQ1Rva2VuKTogUHJvbWlzZTxCb29sVj4ge1xuICBsZXQgezA6IGlzTGlzdGVkLCAxOiBfY29sbGF0ZXJhbEZhY3Rvck1hbnRpc3NhLCAyOiBpc0NvbXBlZH0gPSBhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLm1hcmtldHMoY1Rva2VuLl9hZGRyZXNzKS5jYWxsKCk7XG4gIHJldHVybiBuZXcgQm9vbFYoaXNDb21wZWQpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdHJvbGxlckZldGNoZXJzKCkge1xuICByZXR1cm4gW1xuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBBZGRyZXNzVj4oYFxuICAgICAgICAjIyMjIEFkZHJlc3NcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgQWRkcmVzc1wiIC0gUmV0dXJucyBhZGRyZXNzIG9mIGNvbXB0cm9sbGVyXG4gICAgICBgLFxuICAgICAgXCJBZGRyZXNzXCIsXG4gICAgICBbbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KV0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IGdldENvbXB0cm9sbGVyQWRkcmVzcyh3b3JsZCwgY29tcHRyb2xsZXIpXG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBhY2NvdW50OiBBZGRyZXNzVn0sIE51bWJlclY+KGBcbiAgICAgICAgIyMjIyBMaXF1aWRpdHlcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgTGlxdWlkaXR5IDxVc2VyPlwiIC0gUmV0dXJucyBhIGdpdmVuIHVzZXIncyB0cnVlZCB1cCBsaXF1aWRpdHlcbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlciBMaXF1aWRpdHkgR2VvZmZcIlxuICAgICAgYCxcbiAgICAgIFwiTGlxdWlkaXR5XCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICAgIG5ldyBBcmcoXCJhY2NvdW50XCIsIGdldEFkZHJlc3NWKVxuICAgICAgXSxcbiAgICAgICh3b3JsZCwge2NvbXB0cm9sbGVyLCBhY2NvdW50fSkgPT4gZ2V0TGlxdWlkaXR5KHdvcmxkLCBjb21wdHJvbGxlciwgYWNjb3VudC52YWwpXG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBhY2NvdW50OiBBZGRyZXNzViwgYWN0aW9uOiBTdHJpbmdWLCBhbW91bnQ6IE51bWJlclYsIGNUb2tlbjogQ1Rva2VufSwgTnVtYmVyVj4oYFxuICAgICAgICAjIyMjIEh5cG90aGV0aWNhbFxuXG4gICAgICAgICogXCJDb21wdHJvbGxlciBIeXBvdGhldGljYWwgPFVzZXI+IDxBY3Rpb24+IDxBc3NldD4gPE51bWJlcj5cIiAtIFJldHVybnMgYSBnaXZlbiB1c2VyJ3MgdHJ1ZWQgdXAgbGlxdWlkaXR5IGdpdmVuIGEgaHlwb3RoZXRpY2FsIGNoYW5nZSBpbiBhc3NldCB3aXRoIHJlZGVlbWluZyBhIGNlcnRhaW4gbnVtYmVyIG9mIHRva2VucyBhbmQvb3IgYm9ycm93aW5nIGEgZ2l2ZW4gYW1vdW50LlxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIEh5cG90aGV0aWNhbCBHZW9mZiBSZWRlZW1zIDYuMCBjWlJYXCJcbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlciBIeXBvdGhldGljYWwgR2VvZmYgQm9ycm93cyA1LjAgY1pSWFwiXG4gICAgICBgLFxuICAgICAgXCJIeXBvdGhldGljYWxcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KSxcbiAgICAgICAgbmV3IEFyZyhcImFjY291bnRcIiwgZ2V0QWRkcmVzc1YpLFxuICAgICAgICBuZXcgQXJnKFwiYWN0aW9uXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwiYW1vdW50XCIsIGdldE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKFwiY1Rva2VuXCIsIGdldENUb2tlblYpXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7Y29tcHRyb2xsZXIsIGFjY291bnQsIGFjdGlvbiwgY1Rva2VuLCBhbW91bnR9KSA9PiB7XG4gICAgICAgIGxldCByZWRlZW1Ub2tlbnM6IE51bWJlclY7XG4gICAgICAgIGxldCBib3Jyb3dBbW91bnQ6IE51bWJlclY7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24udmFsLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICBjYXNlIFwiYm9ycm93c1wiOlxuICAgICAgICAgICAgcmVkZWVtVG9rZW5zID0gbmV3IE51bWJlclYoMCk7XG4gICAgICAgICAgICBib3Jyb3dBbW91bnQgPSBhbW91bnQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwicmVkZWVtc1wiOlxuICAgICAgICAgICAgcmVkZWVtVG9rZW5zID0gYW1vdW50O1xuICAgICAgICAgICAgYm9ycm93QW1vdW50ID0gbmV3IE51bWJlclYoMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGh5cG90aGV0aWNhbDogJHthY3Rpb24udmFsfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGdldEh5cG90aGV0aWNhbExpcXVpZGl0eSh3b3JsZCwgY29tcHRyb2xsZXIsIGFjY291bnQudmFsLCBjVG9rZW4uX2FkZHJlc3MsIHJlZGVlbVRva2Vucy5lbmNvZGUoKSwgYm9ycm93QW1vdW50LmVuY29kZSgpKTtcbiAgICAgIH1cbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBBZGRyZXNzVj4oYFxuICAgICAgICAjIyMjIEFkbWluXG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIEFkbWluXCIgLSBSZXR1cm5zIHRoZSBDb21wdHJvbGxlcnMncyBhZG1pblxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIEFkbWluXCJcbiAgICAgIGAsXG4gICAgICBcIkFkbWluXCIsXG4gICAgICBbbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KV0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IGdldEFkbWluKHdvcmxkLCBjb21wdHJvbGxlcilcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBBZGRyZXNzVj4oYFxuICAgICAgICAjIyMjIFBlbmRpbmdBZG1pblxuXG4gICAgICAgICogXCJDb21wdHJvbGxlciBQZW5kaW5nQWRtaW5cIiAtIFJldHVybnMgdGhlIHBlbmRpbmcgYWRtaW4gb2YgdGhlIENvbXB0cm9sbGVyXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgUGVuZGluZ0FkbWluXCIgLSBSZXR1cm5zIENvbXB0cm9sbGVyJ3MgcGVuZGluZyBhZG1pblxuICAgICAgYCxcbiAgICAgIFwiUGVuZGluZ0FkbWluXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7Y29tcHRyb2xsZXJ9KSA9PiBnZXRQZW5kaW5nQWRtaW4od29ybGQsIGNvbXB0cm9sbGVyKVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlcn0sIEFkZHJlc3NWPihgXG4gICAgICAgICMjIyMgUHJpY2VPcmFjbGVcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgUHJpY2VPcmFjbGVcIiAtIFJldHVybnMgdGhlIENvbXB0cm9sbGVycydzIHByaWNlIG9yYWNsZVxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIFByaWNlT3JhY2xlXCJcbiAgICAgIGAsXG4gICAgICBcIlByaWNlT3JhY2xlXCIsXG4gICAgICBbbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KV0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IGdldFByaWNlT3JhY2xlKHdvcmxkLCBjb21wdHJvbGxlcilcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgQ2xvc2VGYWN0b3JcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgQ2xvc2VGYWN0b3JcIiAtIFJldHVybnMgdGhlIENvbXB0cm9sbGVycydzIGNsb3NlIGZhY3RvclxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIENsb3NlRmFjdG9yXCJcbiAgICAgIGAsXG4gICAgICBcIkNsb3NlRmFjdG9yXCIsXG4gICAgICBbbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KV0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IGdldENsb3NlRmFjdG9yKHdvcmxkLCBjb21wdHJvbGxlcilcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgTWF4QXNzZXRzXG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIE1heEFzc2V0c1wiIC0gUmV0dXJucyB0aGUgQ29tcHRyb2xsZXJzJ3MgbWF4IGFzc2V0c1xuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIE1heEFzc2V0c1wiXG4gICAgICBgLFxuICAgICAgXCJNYXhBc3NldHNcIixcbiAgICAgIFtuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXSxcbiAgICAgICh3b3JsZCwge2NvbXB0cm9sbGVyfSkgPT4gZ2V0TWF4QXNzZXRzKHdvcmxkLCBjb21wdHJvbGxlcilcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgTGlxdWlkYXRpb25JbmNlbnRpdmVcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgTGlxdWlkYXRpb25JbmNlbnRpdmVcIiAtIFJldHVybnMgdGhlIENvbXB0cm9sbGVycydzIGxpcXVpZGF0aW9uIGluY2VudGl2ZVxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIExpcXVpZGF0aW9uSW5jZW50aXZlXCJcbiAgICAgIGAsXG4gICAgICBcIkxpcXVpZGF0aW9uSW5jZW50aXZlXCIsXG4gICAgICBbbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KV0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IGdldExpcXVpZGF0aW9uSW5jZW50aXZlKHdvcmxkLCBjb21wdHJvbGxlcilcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBBZGRyZXNzVj4oYFxuICAgICAgICAjIyMjIEltcGxlbWVudGF0aW9uXG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIEltcGxlbWVudGF0aW9uXCIgLSBSZXR1cm5zIHRoZSBDb21wdHJvbGxlcnMncyBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIEltcGxlbWVudGF0aW9uXCJcbiAgICAgIGAsXG4gICAgICBcIkltcGxlbWVudGF0aW9uXCIsXG4gICAgICBbbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KV0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IGdldEltcGxlbWVudGF0aW9uKHdvcmxkLCBjb21wdHJvbGxlcilcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgQmxvY2tOdW1iZXJcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgQmxvY2tOdW1iZXJcIiAtIFJldHVybnMgdGhlIENvbXB0cm9sbGVycydzIG1vY2tlZCBibG9jayBudW1iZXIgKGZvciBzY2VuYXJpbyBydW5uZXIpXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgQmxvY2tOdW1iZXJcIlxuICAgICAgYCxcbiAgICAgIFwiQmxvY2tOdW1iZXJcIixcbiAgICAgIFtuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXSxcbiAgICAgICh3b3JsZCwge2NvbXB0cm9sbGVyfSkgPT4gZ2V0QmxvY2tOdW1iZXIod29ybGQsIGNvbXB0cm9sbGVyKVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgY1Rva2VuOiBDVG9rZW59LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgQ29sbGF0ZXJhbEZhY3RvclxuXG4gICAgICAgICogXCJDb21wdHJvbGxlciBDb2xsYXRlcmFsRmFjdG9yIDxDVG9rZW4+XCIgLSBSZXR1cm5zIHRoZSBjb2xsYXRlcmFsRmFjdG9yIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIGFzc2V0XG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgQ29sbGF0ZXJhbEZhY3RvciBjWlJYXCJcbiAgICAgIGAsXG4gICAgICBcIkNvbGxhdGVyYWxGYWN0b3JcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KSxcbiAgICAgICAgbmV3IEFyZyhcImNUb2tlblwiLCBnZXRDVG9rZW5WKVxuICAgICAgXSxcbiAgICAgICh3b3JsZCwge2NvbXB0cm9sbGVyLCBjVG9rZW59KSA9PiBnZXRDb2xsYXRlcmFsRmFjdG9yKHdvcmxkLCBjb21wdHJvbGxlciwgY1Rva2VuKVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgYWNjb3VudDogQWRkcmVzc1Z9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgTWVtYmVyc2hpcExlbmd0aFxuXG4gICAgICAgICogXCJDb21wdHJvbGxlciBNZW1iZXJzaGlwTGVuZ3RoIDxVc2VyPlwiIC0gUmV0dXJucyBhIGdpdmVuIHVzZXIncyBsZW5ndGggb2YgbWVtYmVyc2hpcFxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIE1lbWJlcnNoaXBMZW5ndGggR2VvZmZcIlxuICAgICAgYCxcbiAgICAgIFwiTWVtYmVyc2hpcExlbmd0aFwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pLFxuICAgICAgICBuZXcgQXJnKFwiYWNjb3VudFwiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlciwgYWNjb3VudH0pID0+IG1lbWJlcnNoaXBMZW5ndGgod29ybGQsIGNvbXB0cm9sbGVyLCBhY2NvdW50LnZhbClcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIGFjY291bnQ6IEFkZHJlc3NWLCBjVG9rZW46IENUb2tlbn0sIEJvb2xWPihgXG4gICAgICAgICMjIyMgQ2hlY2tNZW1iZXJzaGlwXG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIENoZWNrTWVtYmVyc2hpcCA8VXNlcj4gPENUb2tlbj5cIiAtIFJldHVybnMgb25lIGlmIHVzZXIgaXMgaW4gYXNzZXQsIHplcm8gb3RoZXJ3aXNlLlxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIENoZWNrTWVtYmVyc2hpcCBHZW9mZiBjWlJYXCJcbiAgICAgIGAsXG4gICAgICBcIkNoZWNrTWVtYmVyc2hpcFwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pLFxuICAgICAgICBuZXcgQXJnKFwiYWNjb3VudFwiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJjVG9rZW5cIiwgZ2V0Q1Rva2VuVilcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlciwgYWNjb3VudCwgY1Rva2VufSkgPT4gY2hlY2tNZW1iZXJzaGlwKHdvcmxkLCBjb21wdHJvbGxlciwgYWNjb3VudC52YWwsIGNUb2tlbilcbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIGFjY291bnQ6IEFkZHJlc3NWfSwgTGlzdFY+KGBcbiAgICAgICAgIyMjIyBBc3NldHNJblxuXG4gICAgICAgICogXCJDb21wdHJvbGxlciBBc3NldHNJbiA8VXNlcj5cIiAtIFJldHVybnMgdGhlIGFzc2V0cyBhIHVzZXIgaXMgaW5cbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlciBBc3NldHNJbiBHZW9mZlwiXG4gICAgICBgLFxuICAgICAgXCJBc3NldHNJblwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pLFxuICAgICAgICBuZXcgQXJnKFwiYWNjb3VudFwiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHtjb21wdHJvbGxlciwgYWNjb3VudH0pID0+IGdldEFzc2V0c0luKHdvcmxkLCBjb21wdHJvbGxlciwgYWNjb3VudC52YWwpXG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBjVG9rZW46IENUb2tlbn0sIEJvb2xWPihgXG4gICAgICAgICMjIyMgQ2hlY2tMaXN0ZWRcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgQ2hlY2tMaXN0ZWQgPENUb2tlbj5cIiAtIFJldHVybnMgdHJ1ZSBpZiBtYXJrZXQgaXMgbGlzdGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgQ2hlY2tMaXN0ZWQgY1pSWFwiXG4gICAgICBgLFxuICAgICAgXCJDaGVja0xpc3RlZFwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pLFxuICAgICAgICBuZXcgQXJnKFwiY1Rva2VuXCIsIGdldENUb2tlblYpXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7Y29tcHRyb2xsZXIsIGNUb2tlbn0pID0+IGNoZWNrTGlzdGVkKHdvcmxkLCBjb21wdHJvbGxlciwgY1Rva2VuKVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgY1Rva2VuOiBDVG9rZW59LCBCb29sVj4oYFxuICAgICAgICAjIyMjIENoZWNrSXNDb21wZWRcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgQ2hlY2tJc0NvbXBlZCA8Q1Rva2VuPlwiIC0gUmV0dXJucyB0cnVlIGlmIG1hcmtldCBpcyBsaXN0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlciBDaGVja0lzQ29tcGVkIGNaUlhcIlxuICAgICAgYCxcbiAgICAgIFwiQ2hlY2tJc0NvbXBlZFwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pLFxuICAgICAgICBuZXcgQXJnKFwiY1Rva2VuXCIsIGdldENUb2tlblYpXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7Y29tcHRyb2xsZXIsIGNUb2tlbn0pID0+IGNoZWNrSXNDb21wZWQod29ybGQsIGNvbXB0cm9sbGVyLCBjVG9rZW4pXG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyfSwgQWRkcmVzc1Y+KGBcbiAgICAgICAgIyMjIyBQYXVzZUd1YXJkaWFuXG5cbiAgICAgICAgKiBcIlBhdXNlR3VhcmRpYW5cIiAtIFJldHVybnMgdGhlIENvbXB0cm9sbGVycydzIFBhdXNlR3VhcmRpYW5cbiAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgUGF1c2VHdWFyZGlhblwiXG4gICAgICAgIGAsXG4gICAgICAgIFwiUGF1c2VHdWFyZGlhblwiLFxuICAgICAgICBbXG4gICAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KVxuICAgICAgICBdLFxuICAgICAgICBhc3luYyAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IG5ldyBBZGRyZXNzVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLnBhdXNlR3VhcmRpYW4oKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBCb29sVj4oYFxuICAgICAgICAjIyMjIF9NaW50R3VhcmRpYW5QYXVzZWRcblxuICAgICAgICAqIFwiX01pbnRHdWFyZGlhblBhdXNlZFwiIC0gUmV0dXJucyB0aGUgQ29tcHRyb2xsZXJzJ3Mgb3JpZ2luYWwgZ2xvYmFsIE1pbnQgcGF1c2VkIHN0YXR1c1xuICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlciBfTWludEd1YXJkaWFuUGF1c2VkXCJcbiAgICAgICAgYCxcbiAgICAgICAgXCJfTWludEd1YXJkaWFuUGF1c2VkXCIsXG4gICAgICAgIFtuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXSxcbiAgICAgICAgYXN5bmMgKHdvcmxkLCB7Y29tcHRyb2xsZXJ9KSA9PiBuZXcgQm9vbFYoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5fbWludEd1YXJkaWFuUGF1c2VkKCkuY2FsbCgpKVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlcn0sIEJvb2xWPihgXG4gICAgICAgICMjIyMgX0JvcnJvd0d1YXJkaWFuUGF1c2VkXG5cbiAgICAgICAgKiBcIl9Cb3Jyb3dHdWFyZGlhblBhdXNlZFwiIC0gUmV0dXJucyB0aGUgQ29tcHRyb2xsZXJzJ3Mgb3JpZ2luYWwgZ2xvYmFsIEJvcnJvdyBwYXVzZWQgc3RhdHVzXG4gICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIF9Cb3Jyb3dHdWFyZGlhblBhdXNlZFwiXG4gICAgICAgIGAsXG4gICAgICAgIFwiX0JvcnJvd0d1YXJkaWFuUGF1c2VkXCIsXG4gICAgICAgIFtuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXSxcbiAgICAgICAgYXN5bmMgKHdvcmxkLCB7Y29tcHRyb2xsZXJ9KSA9PiBuZXcgQm9vbFYoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5fYm9ycm93R3VhcmRpYW5QYXVzZWQoKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBCb29sVj4oYFxuICAgICAgICAjIyMjIFRyYW5zZmVyR3VhcmRpYW5QYXVzZWRcblxuICAgICAgICAqIFwiVHJhbnNmZXJHdWFyZGlhblBhdXNlZFwiIC0gUmV0dXJucyB0aGUgQ29tcHRyb2xsZXJzJ3MgVHJhbnNmZXIgcGF1c2VkIHN0YXR1c1xuICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlciBUcmFuc2Zlckd1YXJkaWFuUGF1c2VkXCJcbiAgICAgICAgYCxcbiAgICAgICAgXCJUcmFuc2Zlckd1YXJkaWFuUGF1c2VkXCIsXG4gICAgICAgIFtuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXSxcbiAgICAgICAgYXN5bmMgKHdvcmxkLCB7Y29tcHRyb2xsZXJ9KSA9PiBuZXcgQm9vbFYoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy50cmFuc2Zlckd1YXJkaWFuUGF1c2VkKCkuY2FsbCgpKVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlcn0sIEJvb2xWPihgXG4gICAgICAgICMjIyMgU2VpemVHdWFyZGlhblBhdXNlZFxuXG4gICAgICAgICogXCJTZWl6ZUd1YXJkaWFuUGF1c2VkXCIgLSBSZXR1cm5zIHRoZSBDb21wdHJvbGxlcnMncyBTZWl6ZSBwYXVzZWQgc3RhdHVzXG4gICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIFNlaXplR3VhcmRpYW5QYXVzZWRcIlxuICAgICAgICBgLFxuICAgICAgICBcIlNlaXplR3VhcmRpYW5QYXVzZWRcIixcbiAgICAgICAgW25ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSldLFxuICAgICAgICBhc3luYyAod29ybGQsIHtjb21wdHJvbGxlcn0pID0+IG5ldyBCb29sVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLnNlaXplR3VhcmRpYW5QYXVzZWQoKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIGNUb2tlbjogQ1Rva2VufSwgQm9vbFY+KGBcbiAgICAgICAgIyMjIyBNaW50R3VhcmRpYW5NYXJrZXRQYXVzZWRcblxuICAgICAgICAqIFwiTWludEd1YXJkaWFuTWFya2V0UGF1c2VkXCIgLSBSZXR1cm5zIHRoZSBDb21wdHJvbGxlcnMncyBNaW50IHBhdXNlZCBzdGF0dXMgaW4gbWFya2V0XG4gICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIE1pbnRHdWFyZGlhbk1hcmtldFBhdXNlZCBjUkVQXCJcbiAgICAgICAgYCxcbiAgICAgICAgXCJNaW50R3VhcmRpYW5NYXJrZXRQYXVzZWRcIixcbiAgICAgICAgW1xuICAgICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICAgICAgbmV3IEFyZyhcImNUb2tlblwiLCBnZXRDVG9rZW5WKVxuICAgICAgICBdLFxuICAgICAgICBhc3luYyAod29ybGQsIHtjb21wdHJvbGxlciwgY1Rva2VufSkgPT4gbmV3IEJvb2xWKGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMubWludEd1YXJkaWFuUGF1c2VkKGNUb2tlbi5fYWRkcmVzcykuY2FsbCgpKVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgY1Rva2VuOiBDVG9rZW59LCBCb29sVj4oYFxuICAgICAgICAjIyMjIEJvcnJvd0d1YXJkaWFuTWFya2V0UGF1c2VkXG5cbiAgICAgICAgKiBcIkJvcnJvd0d1YXJkaWFuTWFya2V0UGF1c2VkXCIgLSBSZXR1cm5zIHRoZSBDb21wdHJvbGxlcnMncyBCb3Jyb3cgcGF1c2VkIHN0YXR1cyBpbiBtYXJrZXRcbiAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgQm9ycm93R3VhcmRpYW5NYXJrZXRQYXVzZWQgY1JFUFwiXG4gICAgICAgIGAsXG4gICAgICAgIFwiQm9ycm93R3VhcmRpYW5NYXJrZXRQYXVzZWRcIixcbiAgICAgICAgW1xuICAgICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICAgICAgbmV3IEFyZyhcImNUb2tlblwiLCBnZXRDVG9rZW5WKVxuICAgICAgICBdLFxuICAgICAgICBhc3luYyAod29ybGQsIHtjb21wdHJvbGxlciwgY1Rva2VufSkgPT4gbmV3IEJvb2xWKGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuYm9ycm93R3VhcmRpYW5QYXVzZWQoY1Rva2VuLl9hZGRyZXNzKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXJ9LCBMaXN0Vj4oYFxuICAgICAgIyMjIyBHZXRDb21wTWFya2V0c1xuXG4gICAgICAqIFwiR2V0Q29tcE1hcmtldHNcIiAtIFJldHVybnMgYW4gYXJyYXkgb2YgdGhlIGN1cnJlbnRseSBlbmFibGVkIENvbXAgbWFya2V0cy4gVG8gdXNlIHRoZSBhdXRvLWdlbiBhcnJheSBnZXR0ZXIgY29tcE1hcmtldHModWludCksIHVzZSBDb21wTWFya2V0c1xuICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgR2V0Q29tcE1hcmtldHNcIlxuICAgICAgYCxcbiAgICAgIFwiR2V0Q29tcE1hcmtldHNcIixcbiAgICAgIFtuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXSxcbiAgICAgIGFzeW5jKHdvcmxkLCB7Y29tcHRyb2xsZXJ9KSA9PiBhd2FpdCBnZXRDb21wTWFya2V0cyh3b3JsZCwgY29tcHRyb2xsZXIpXG4gICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyfSwgTnVtYmVyVj4oYFxuICAgICAgIyMjIyBDb21wUmF0ZVxuXG4gICAgICAqIFwiQ29tcFJhdGVcIiAtIFJldHVybnMgdGhlIGN1cnJlbnQgY29tcCByYXRlLlxuICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgQ29tcFJhdGVcIlxuICAgICAgYCxcbiAgICAgIFwiQ29tcFJhdGVcIixcbiAgICAgIFtuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXSxcbiAgICAgIGFzeW5jKHdvcmxkLCB7Y29tcHRyb2xsZXJ9KSA9PiBuZXcgTnVtYmVyVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLmNvbXBSYXRlKCkuY2FsbCgpKVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBzaWduYXR1cmU6IFN0cmluZ1YsIGNhbGxBcmdzOiBTdHJpbmdWW119LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgQ2FsbE51bVxuXG4gICAgICAgICogXCJDYWxsTnVtIHNpZ25hdHVyZTo8U3RyaW5nPiAuLi5jYWxsQXJnczxDb3JlVmFsdWU+XCIgLSBTaW1wbGUgZGlyZWN0IGNhbGwgbWV0aG9kXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgQ2FsbE51bSBcXFwiY29tcFNwZWVkcyhhZGRyZXNzKVxcXCIgKEFkZHJlc3MgQ29idXJuKVwiXG4gICAgICBgLFxuICAgICAgXCJDYWxsTnVtXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICAgIG5ldyBBcmcoXCJzaWduYXR1cmVcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJjYWxsQXJnc1wiLCBnZXRDb3JlVmFsdWUsIHt2YXJpYWRpYzogdHJ1ZSwgbWFwcGVkOiB0cnVlfSlcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtjb21wdHJvbGxlciwgc2lnbmF0dXJlLCBjYWxsQXJnc30pID0+IHtcbiAgICAgICAgY29uc3QgZm5EYXRhID0gZW5jb2RlQUJJKHdvcmxkLCBzaWduYXR1cmUudmFsLCBjYWxsQXJncy5tYXAoYSA9PiBhLnZhbCkpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCB3b3JsZC53ZWIzLmV0aC5jYWxsKHtcbiAgICAgICAgICAgIHRvOiBjb21wdHJvbGxlci5fYWRkcmVzcyxcbiAgICAgICAgICAgIGRhdGE6IGZuRGF0YVxuICAgICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHJlc051bSA6IGFueSA9IHdvcmxkLndlYjMuZXRoLmFiaS5kZWNvZGVQYXJhbWV0ZXIoJ3VpbnQyNTYnLHJlcyk7XG4gICAgICAgIHJldHVybiBuZXcgTnVtYmVyVihyZXNOdW0pO1xuICAgICAgfVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgQ1Rva2VuOiBDVG9rZW4sIGtleTogU3RyaW5nVn0sIE51bWJlclY+KGBcbiAgICAgICAgIyMjIyBDb21wU3VwcGx5U3RhdGUoYWRkcmVzcylcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgQ29tcEJvcnJvd1N0YXRlIGNaUlggXCJpbmRleFwiXG4gICAgICBgLFxuICAgICAgXCJDb21wU3VwcGx5U3RhdGVcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KSxcbiAgICAgICAgbmV3IEFyZyhcIkNUb2tlblwiLCBnZXRDVG9rZW5WKSxcbiAgICAgICAgbmV3IEFyZyhcImtleVwiLCBnZXRTdHJpbmdWKSxcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtjb21wdHJvbGxlciwgQ1Rva2VuLCBrZXl9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuY29tcFN1cHBseVN0YXRlKENUb2tlbi5fYWRkcmVzcykuY2FsbCgpO1xuICAgICAgICByZXR1cm4gbmV3IE51bWJlclYocmVzdWx0W2tleS52YWxdKTtcbiAgICAgIH1cbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIENUb2tlbjogQ1Rva2VuLCBrZXk6IFN0cmluZ1Z9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgQ29tcEJvcnJvd1N0YXRlKGFkZHJlc3MpXG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIENvbXBCb3Jyb3dTdGF0ZSBjWlJYIFwiaW5kZXhcIlxuICAgICAgYCxcbiAgICAgIFwiQ29tcEJvcnJvd1N0YXRlXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICAgIG5ldyBBcmcoXCJDVG9rZW5cIiwgZ2V0Q1Rva2VuViksXG4gICAgICAgIG5ldyBBcmcoXCJrZXlcIiwgZ2V0U3RyaW5nViksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7Y29tcHRyb2xsZXIsIENUb2tlbiwga2V5fSkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLmNvbXBCb3Jyb3dTdGF0ZShDVG9rZW4uX2FkZHJlc3MpLmNhbGwoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBOdW1iZXJWKHJlc3VsdFtrZXkudmFsXSk7XG4gICAgICB9XG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBhY2NvdW50OiBBZGRyZXNzViwga2V5OiBTdHJpbmdWfSwgTnVtYmVyVj4oYFxuICAgICAgICAjIyMjIENvbXBBY2NydWVkKGFkZHJlc3MpXG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIENvbXBBY2NydWVkIENvYnVyblxuICAgICAgYCxcbiAgICAgIFwiQ29tcEFjY3J1ZWRcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldENvbXB0cm9sbGVyLCB7aW1wbGljaXQ6IHRydWV9KSxcbiAgICAgICAgbmV3IEFyZyhcImFjY291bnRcIiwgZ2V0QWRkcmVzc1YpLFxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge2NvbXB0cm9sbGVyLGFjY291bnR9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuY29tcEFjY3J1ZWQoYWNjb3VudC52YWwpLmNhbGwoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBOdW1iZXJWKHJlc3VsdCk7XG4gICAgICB9XG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBDVG9rZW46IENUb2tlbiwgYWNjb3VudDogQWRkcmVzc1Z9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgY29tcFN1cHBsaWVySW5kZXhcblxuICAgICAgICAqIFwiQ29tcHRyb2xsZXIgQ29tcFN1cHBsaWVySW5kZXggY1pSWCBDb2J1cm5cbiAgICAgIGAsXG4gICAgICBcIkNvbXBTdXBwbGllckluZGV4XCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICAgIG5ldyBBcmcoXCJDVG9rZW5cIiwgZ2V0Q1Rva2VuViksXG4gICAgICAgIG5ldyBBcmcoXCJhY2NvdW50XCIsIGdldEFkZHJlc3NWKSxcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtjb21wdHJvbGxlciwgQ1Rva2VuLCBhY2NvdW50fSkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IE51bWJlclYoYXdhaXQgY29tcHRyb2xsZXIubWV0aG9kcy5jb21wU3VwcGxpZXJJbmRleChDVG9rZW4uX2FkZHJlc3MsIGFjY291bnQudmFsKS5jYWxsKCkpO1xuICAgICAgfVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8e2NvbXB0cm9sbGVyOiBDb21wdHJvbGxlciwgQ1Rva2VuOiBDVG9rZW4sIGFjY291bnQ6IEFkZHJlc3NWfSwgTnVtYmVyVj4oYFxuICAgICAgICAjIyMjIENvbXBCb3Jyb3dlckluZGV4XG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIENvbXBCb3Jyb3dlckluZGV4IGNaUlggQ29idXJuXG4gICAgICBgLFxuICAgICAgXCJDb21wQm9ycm93ZXJJbmRleFwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pLFxuICAgICAgICBuZXcgQXJnKFwiQ1Rva2VuXCIsIGdldENUb2tlblYpLFxuICAgICAgICBuZXcgQXJnKFwiYWNjb3VudFwiLCBnZXRBZGRyZXNzViksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7Y29tcHRyb2xsZXIsIENUb2tlbiwgYWNjb3VudH0pID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBOdW1iZXJWKGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuY29tcEJvcnJvd2VySW5kZXgoQ1Rva2VuLl9hZGRyZXNzLCBhY2NvdW50LnZhbCkuY2FsbCgpKTtcbiAgICAgIH1cbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtjb21wdHJvbGxlcjogQ29tcHRyb2xsZXIsIENUb2tlbjogQ1Rva2VufSwgTnVtYmVyVj4oYFxuICAgICAgICAjIyMjIENvbXBTcGVlZFxuXG4gICAgICAgICogXCJDb21wdHJvbGxlciBDb21wU3BlZWQgY1pSWFxuICAgICAgYCxcbiAgICAgIFwiQ29tcFNwZWVkXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRDb21wdHJvbGxlciwge2ltcGxpY2l0OiB0cnVlfSksXG4gICAgICAgIG5ldyBBcmcoXCJDVG9rZW5cIiwgZ2V0Q1Rva2VuViksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7Y29tcHRyb2xsZXIsIENUb2tlbn0pID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBOdW1iZXJWKGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuY29tcFNwZWVkcyhDVG9rZW4uX2FkZHJlc3MpLmNhbGwoKSk7XG4gICAgICB9XG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyfSwgQWRkcmVzc1Y+KGBcbiAgICAgICAgIyMjIyBCb3Jyb3dDYXBHdWFyZGlhblxuXG4gICAgICAgICogXCJCb3Jyb3dDYXBHdWFyZGlhblwiIC0gUmV0dXJucyB0aGUgQ29tcHRyb2xsZXJzJ3MgQm9ycm93Q2FwR3VhcmRpYW5cbiAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgQm9ycm93Q2FwR3VhcmRpYW5cIlxuICAgICAgICBgLFxuICAgICAgICBcIkJvcnJvd0NhcEd1YXJkaWFuXCIsXG4gICAgICAgIFtcbiAgICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pXG4gICAgICAgIF0sXG4gICAgICAgIGFzeW5jICh3b3JsZCwge2NvbXB0cm9sbGVyfSkgPT4gbmV3IEFkZHJlc3NWKGF3YWl0IGNvbXB0cm9sbGVyLm1ldGhvZHMuYm9ycm93Q2FwR3VhcmRpYW4oKS5jYWxsKCkpXG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7Y29tcHRyb2xsZXI6IENvbXB0cm9sbGVyLCBDVG9rZW46IENUb2tlbn0sIE51bWJlclY+KGBcbiAgICAgICAgIyMjIyBCb3Jyb3dDYXBzXG5cbiAgICAgICAgKiBcIkNvbXB0cm9sbGVyIEJvcnJvd0NhcHMgY1pSWFxuICAgICAgYCxcbiAgICAgIFwiQm9ycm93Q2Fwc1wiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcHRyb2xsZXJcIiwgZ2V0Q29tcHRyb2xsZXIsIHtpbXBsaWNpdDogdHJ1ZX0pLFxuICAgICAgICBuZXcgQXJnKFwiQ1Rva2VuXCIsIGdldENUb2tlblYpLFxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge2NvbXB0cm9sbGVyLCBDVG9rZW59KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgTnVtYmVyVihhd2FpdCBjb21wdHJvbGxlci5tZXRob2RzLmJvcnJvd0NhcHMoQ1Rva2VuLl9hZGRyZXNzKS5jYWxsKCkpO1xuICAgICAgfVxuICAgIClcbiAgXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvbXB0cm9sbGVyVmFsdWUod29ybGQ6IFdvcmxkLCBldmVudDogRXZlbnQpOiBQcm9taXNlPFZhbHVlPiB7XG4gIHJldHVybiBhd2FpdCBnZXRGZXRjaGVyVmFsdWU8YW55LCBhbnk+KFwiQ29tcHRyb2xsZXJcIiwgY29tcHRyb2xsZXJGZXRjaGVycygpLCB3b3JsZCwgZXZlbnQpO1xufVxuIl19
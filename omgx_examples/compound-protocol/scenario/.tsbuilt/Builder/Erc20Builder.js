"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildErc20 = void 0;
const Invokation_1 = require("../Invokation");
const CoreValue_1 = require("../CoreValue");
const Value_1 = require("../Value");
const Command_1 = require("../Command");
const Networks_1 = require("../Networks");
const Contract_1 = require("../Contract");
const Utils_1 = require("../Utils");
const ExistingToken = Contract_1.getContract("EIP20Interface");
const TetherInterface = Contract_1.getContract("TetherInterface");
const FaucetTokenHarness = Contract_1.getContract("FaucetToken");
const FaucetTokenNonStandardHarness = Contract_1.getContract("FaucetNonStandardToken");
const FaucetTokenReEntrantHarness = Contract_1.getContract("FaucetTokenReEntrantHarness");
const EvilTokenHarness = Contract_1.getContract("EvilToken");
const WBTCTokenHarness = Contract_1.getContract("WBTCToken");
const FeeTokenHarness = Contract_1.getContract("FeeToken");
async function buildErc20(world, from, event) {
    const fetchers = [
        new Command_1.Fetcher(`
        #### Existing

        * "Existing symbol:<String> address:<Address> name:<String>" - Wrap an existing Erc20 token
          * E.g. "Erc20 Deploy Existing DAI 0x123...
      `, "Existing", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("address", CoreValue_1.getAddressV),
            new Command_1.Arg("name", CoreValue_1.getStringV, { default: undefined }),
        ], async (world, { symbol, name, address }) => {
            const existingToken = await ExistingToken.at(world, address.val);
            const tokenName = name.val === undefined ? symbol.val : name.val;
            const decimals = await existingToken.methods.decimals().call();
            return {
                invokation: new Invokation_1.Invokation(existingToken, null, null, null),
                description: "Existing",
                decimals: Number(decimals),
                name: tokenName,
                symbol: symbol.val,
                contract: 'ExistingToken'
            };
        }),
        new Command_1.Fetcher(`
        #### ExistingTether

        * "Existing symbol:<String> address:<Address>" - Wrap an existing Erc20 token
          * E.g. "Erc20 Deploy ExistingTether USDT 0x123...
      `, "ExistingTether", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("address", CoreValue_1.getAddressV)
        ], async (world, { symbol, address }) => {
            return {
                invokation: new Invokation_1.Invokation(await TetherInterface.at(world, address.val), null, null, null),
                description: "ExistingTether",
                name: symbol.val,
                symbol: symbol.val,
                contract: 'TetherInterface'
            };
        }),
        new Command_1.Fetcher(`
        #### NonStandard

        * "NonStandard symbol:<String> name:<String> decimals:<Number=18>" - A non-standard token, like BAT
          * E.g. "Erc20 Deploy NonStandard BAT \"Basic Attention Token\" 18"
      `, "NonStandard", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV, { default: new Value_1.NumberV(18) }),
        ], async (world, { symbol, name, decimals }) => {
            return {
                invokation: await FaucetTokenNonStandardHarness.deploy(world, from, [0, name.val, decimals.val, symbol.val]),
                description: "NonStandard",
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                contract: 'FaucetNonStandardToken'
            };
        }),
        new Command_1.Fetcher(`
        #### ReEntrant

        * "ReEntrant symbol:<String> name:string fun:<String> funSig:<String> ...funArgs:<Value>" - A token that loves to call back to spook its caller
          * E.g. "Erc20 Deploy ReEntrant PHREAK PHREAK "transfer" "mint(uint256)" 0 - A token that will call back to a CToken's mint function

        Note: valid functions: totalSupply, balanceOf, transfer, transferFrom, approve, allowance
      `, "ReEntrant", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("fun", CoreValue_1.getStringV),
            new Command_1.Arg("reEntryFunSig", CoreValue_1.getStringV),
            new Command_1.Arg("reEntryFunArgs", CoreValue_1.getStringV, { variadic: true, mapped: true })
        ], async (world, { symbol, name, fun, reEntryFunSig, reEntryFunArgs }) => {
            const fnData = Utils_1.encodeABI(world, reEntryFunSig.val, reEntryFunArgs.map((a) => a.val));
            return {
                invokation: await FaucetTokenReEntrantHarness.deploy(world, from, [0, name.val, 18, symbol.val, fnData, fun.val]),
                description: "ReEntrant",
                name: name.val,
                symbol: symbol.val,
                decimals: 18,
                contract: 'FaucetTokenReEntrantHarness'
            };
        }),
        new Command_1.Fetcher(`
        #### Evil

        * "Evil symbol:<String> name:<String> decimals:<Number>" - A less vanilla ERC-20 contract that fails transfers
          * E.g. "Erc20 Deploy Evil BAT \"Basic Attention Token\" 18"
      `, "Evil", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV, { default: new Value_1.NumberV(18) })
        ], async (world, { symbol, name, decimals }) => {
            return {
                invokation: await EvilTokenHarness.deploy(world, from, [0, name.val, decimals.val, symbol.val]),
                description: "Evil",
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                contract: 'EvilToken'
            };
        }),
        new Command_1.Fetcher(`
        #### Standard

        * "Standard symbol:<String> name:<String> decimals:<Number>" - A vanilla ERC-20 contract
          * E.g. "Erc20 Deploy Standard BAT \"Basic Attention Token\" 18"
      `, "Standard", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV, { default: new Value_1.NumberV(18) })
        ], async (world, { symbol, name, decimals }) => {
            return {
                invokation: await FaucetTokenHarness.deploy(world, from, [0, name.val, decimals.val, symbol.val]),
                description: "Standard",
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                contract: 'FaucetToken'
            };
        }),
        new Command_1.Fetcher(`
        #### WBTC

        * "WBTC symbol:<String> name:<String>" - The WBTC contract
          * E.g. "Erc20 Deploy WBTC WBTC \"Wrapped Bitcoin\""
      `, "WBTC", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV, { default: new Value_1.StringV("WBTC") }),
            new Command_1.Arg("name", CoreValue_1.getStringV, { default: new Value_1.StringV("Wrapped Bitcoin") })
        ], async (world, { symbol, name }) => {
            let decimals = 8;
            return {
                invokation: await WBTCTokenHarness.deploy(world, from, []),
                description: "WBTC",
                name: name.val,
                symbol: symbol.val,
                decimals: decimals,
                contract: 'WBTCToken'
            };
        }),
        new Command_1.Fetcher(`
        #### Fee

        * "Fee symbol:<String> name:<String> decimals:<Number> basisPointFee:<Number> owner:<Address>" - An ERC20 whose owner takes a fee on transfers. Used for mocking USDT.
          * E.g. "Erc20 Deploy Fee USDT USDT 100 Root"
      `, "Fee", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV),
            new Command_1.Arg("basisPointFee", CoreValue_1.getNumberV),
            new Command_1.Arg("owner", CoreValue_1.getAddressV)
        ], async (world, { symbol, name, decimals, basisPointFee, owner }) => {
            return {
                invokation: await FeeTokenHarness.deploy(world, from, [0, name.val, decimals.val, symbol.val, basisPointFee.val, owner.val]),
                description: "Fee",
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                owner: owner.val,
                contract: 'FeeToken'
            };
        }),
    ];
    let tokenData = await Command_1.getFetcherValue("DeployErc20", fetchers, world, event);
    let invokation = tokenData.invokation;
    delete tokenData.invokation;
    if (invokation.error) {
        throw invokation.error;
    }
    const erc20 = invokation.value;
    tokenData.address = erc20._address;
    world = await Networks_1.storeAndSaveContract(world, erc20, tokenData.symbol, invokation, [
        { index: ['Tokens', tokenData.symbol], data: tokenData }
    ]);
    return { world, erc20, tokenData };
}
exports.buildErc20 = buildErc20;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJjMjBCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0J1aWxkZXIvRXJjMjBCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLDhDQUFpRDtBQUNqRCw0Q0FLc0I7QUFDdEIsb0NBS2tCO0FBQ2xCLHdDQUF5RDtBQUN6RCwwQ0FBaUQ7QUFDakQsMENBQXlEO0FBQ3pELG9DQUFtQztBQUVuQyxNQUFNLGFBQWEsR0FBRyxzQkFBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDcEQsTUFBTSxlQUFlLEdBQUcsc0JBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXZELE1BQU0sa0JBQWtCLEdBQUcsc0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN0RCxNQUFNLDZCQUE2QixHQUFHLHNCQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1RSxNQUFNLDJCQUEyQixHQUFHLHNCQUFXLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUMvRSxNQUFNLGdCQUFnQixHQUFHLHNCQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxzQkFBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sZUFBZSxHQUFHLHNCQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7QUFZekMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxLQUFZLEVBQUUsSUFBWSxFQUFFLEtBQVk7SUFDdkUsTUFBTSxRQUFRLEdBQUc7UUFDZixJQUFJLGlCQUFPLENBQW1FOzs7OztPQUszRSxFQUNELFVBQVUsRUFDVjtZQUNFLElBQUksYUFBRyxDQUFDLFFBQVEsRUFBRSxzQkFBVSxDQUFDO1lBQzdCLElBQUksYUFBRyxDQUFDLFNBQVMsRUFBRSx1QkFBVyxDQUFDO1lBQy9CLElBQUksYUFBRyxDQUFDLE1BQU0sRUFBRSxzQkFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDO1NBQ3BELEVBQ0QsS0FB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LENBQUMsUUFBUSxDQUFDO0lBRW5DLEtBQUssR0FBRyxNQUFNLCtCQUFvQixDQUNoQyxLQUFLLEVBQ0wsS0FBSyxFQUNMLFNBQVMsQ0FBQyxNQUFNLEVBQ2hCLFVBQVUsRUFDVjtRQUNFLEVBQUUsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0tBQ3pELENBQ0YsQ0FBQztJQUVGLE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBQyxDQUFDO0FBQ25DLENBQUM7QUFwT0QsZ0NBb09DIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQge0V2ZW50fSBmcm9tICcuLi9FdmVudCc7XG5pbXBvcnQge2FkZEFjdGlvbiwgV29ybGR9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7RXJjMjB9IGZyb20gJy4uL0NvbnRyYWN0L0VyYzIwJztcbmltcG9ydCB7SW52b2thdGlvbiwgaW52b2tlfSBmcm9tICcuLi9JbnZva2F0aW9uJztcbmltcG9ydCB7XG4gIGdldEFkZHJlc3NWLFxuICBnZXRDb3JlVmFsdWUsXG4gIGdldE51bWJlclYsXG4gIGdldFN0cmluZ1Zcbn0gZnJvbSAnLi4vQ29yZVZhbHVlJztcbmltcG9ydCB7XG4gIEFkZHJlc3NWLFxuICBOdW1iZXJWLFxuICBTdHJpbmdWLFxuICBWYWx1ZVxufSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQge0FyZywgRmV0Y2hlciwgZ2V0RmV0Y2hlclZhbHVlfSBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7c3RvcmVBbmRTYXZlQ29udHJhY3R9IGZyb20gJy4uL05ldHdvcmtzJztcbmltcG9ydCB7Z2V0Q29udHJhY3QsIGdldFRlc3RDb250cmFjdH0gZnJvbSAnLi4vQ29udHJhY3QnO1xuaW1wb3J0IHtlbmNvZGVBQkl9IGZyb20gJy4uL1V0aWxzJztcblxuY29uc3QgRXhpc3RpbmdUb2tlbiA9IGdldENvbnRyYWN0KFwiRUlQMjBJbnRlcmZhY2VcIik7XG5jb25zdCBUZXRoZXJJbnRlcmZhY2UgPSBnZXRDb250cmFjdChcIlRldGhlckludGVyZmFjZVwiKTtcblxuY29uc3QgRmF1Y2V0VG9rZW5IYXJuZXNzID0gZ2V0Q29udHJhY3QoXCJGYXVjZXRUb2tlblwiKTtcbmNvbnN0IEZhdWNldFRva2VuTm9uU3RhbmRhcmRIYXJuZXNzID0gZ2V0Q29udHJhY3QoXCJGYXVjZXROb25TdGFuZGFyZFRva2VuXCIpO1xuY29uc3QgRmF1Y2V0VG9rZW5SZUVudHJhbnRIYXJuZXNzID0gZ2V0Q29udHJhY3QoXCJGYXVjZXRUb2tlblJlRW50cmFudEhhcm5lc3NcIik7XG5jb25zdCBFdmlsVG9rZW5IYXJuZXNzID0gZ2V0Q29udHJhY3QoXCJFdmlsVG9rZW5cIik7XG5jb25zdCBXQlRDVG9rZW5IYXJuZXNzID0gZ2V0Q29udHJhY3QoXCJXQlRDVG9rZW5cIik7XG5jb25zdCBGZWVUb2tlbkhhcm5lc3MgPSBnZXRDb250cmFjdChcIkZlZVRva2VuXCIpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRva2VuRGF0YSB7XG4gIGludm9rYXRpb246IEludm9rYXRpb248RXJjMjA+LFxuICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIHN5bWJvbDogc3RyaW5nLFxuICBkZWNpbWFscz86IG51bWJlcixcbiAgYWRkcmVzcz86IHN0cmluZyxcbiAgY29udHJhY3Q6IHN0cmluZ1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRFcmMyMCh3b3JsZDogV29ybGQsIGZyb206IHN0cmluZywgZXZlbnQ6IEV2ZW50KTogUHJvbWlzZTx7IHdvcmxkOiBXb3JsZCwgZXJjMjA6IEVyYzIwLCB0b2tlbkRhdGE6IFRva2VuRGF0YSB9PiB7XG4gIGNvbnN0IGZldGNoZXJzID0gW1xuICAgIG5ldyBGZXRjaGVyPHsgc3ltYm9sOiBTdHJpbmdWLCBhZGRyZXNzOiBBZGRyZXNzViwgbmFtZTogU3RyaW5nViB9LCBUb2tlbkRhdGE+KGBcbiAgICAgICAgIyMjIyBFeGlzdGluZ1xuXG4gICAgICAgICogXCJFeGlzdGluZyBzeW1ib2w6PFN0cmluZz4gYWRkcmVzczo8QWRkcmVzcz4gbmFtZTo8U3RyaW5nPlwiIC0gV3JhcCBhbiBleGlzdGluZyBFcmMyMCB0b2tlblxuICAgICAgICAgICogRS5nLiBcIkVyYzIwIERlcGxveSBFeGlzdGluZyBEQUkgMHgxMjMuLi5cbiAgICAgIGAsXG4gICAgICBcIkV4aXN0aW5nXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJzeW1ib2xcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJhZGRyZXNzXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcIm5hbWVcIiwgZ2V0U3RyaW5nViwgeyBkZWZhdWx0OiB1bmRlZmluZWQgfSksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IHN5bWJvbCwgbmFtZSwgYWRkcmVzcyB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nVG9rZW4gPSBhd2FpdCBFeGlzdGluZ1Rva2VuLmF0PEVyYzIwPih3b3JsZCwgYWRkcmVzcy52YWwpO1xuICAgICAgICBjb25zdCB0b2tlbk5hbWUgPSBuYW1lLnZhbCA9PT0gdW5kZWZpbmVkID8gc3ltYm9sLnZhbCA6IG5hbWUudmFsO1xuICAgICAgICBjb25zdCBkZWNpbWFscyA9IGF3YWl0IGV4aXN0aW5nVG9rZW4ubWV0aG9kcy5kZWNpbWFscygpLmNhbGwoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IG5ldyBJbnZva2F0aW9uPEVyYzIwPihleGlzdGluZ1Rva2VuLCBudWxsLCBudWxsLCBudWxsKSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJFeGlzdGluZ1wiLFxuICAgICAgICAgIGRlY2ltYWxzOiBOdW1iZXIoZGVjaW1hbHMpLFxuICAgICAgICAgIG5hbWU6IHRva2VuTmFtZSxcbiAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdFeGlzdGluZ1Rva2VuJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7c3ltYm9sOiBTdHJpbmdWLCBhZGRyZXNzOiBBZGRyZXNzVn0sIFRva2VuRGF0YT4oYFxuICAgICAgICAjIyMjIEV4aXN0aW5nVGV0aGVyXG5cbiAgICAgICAgKiBcIkV4aXN0aW5nIHN5bWJvbDo8U3RyaW5nPiBhZGRyZXNzOjxBZGRyZXNzPlwiIC0gV3JhcCBhbiBleGlzdGluZyBFcmMyMCB0b2tlblxuICAgICAgICAgICogRS5nLiBcIkVyYzIwIERlcGxveSBFeGlzdGluZ1RldGhlciBVU0RUIDB4MTIzLi4uXG4gICAgICBgLFxuICAgICAgXCJFeGlzdGluZ1RldGhlclwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwic3ltYm9sXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwiYWRkcmVzc1wiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtzeW1ib2wsIGFkZHJlc3N9KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogbmV3IEludm9rYXRpb248RXJjMjA+KGF3YWl0IFRldGhlckludGVyZmFjZS5hdDxFcmMyMD4od29ybGQsIGFkZHJlc3MudmFsKSwgbnVsbCwgbnVsbCwgbnVsbCksXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXhpc3RpbmdUZXRoZXJcIixcbiAgICAgICAgICBuYW1lOiBzeW1ib2wudmFsLFxuICAgICAgICAgIHN5bWJvbDogc3ltYm9sLnZhbCxcbiAgICAgICAgICBjb250cmFjdDogJ1RldGhlckludGVyZmFjZSdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8e3N5bWJvbDogU3RyaW5nViwgbmFtZTogU3RyaW5nViwgZGVjaW1hbHM6IE51bWJlclZ9LCBUb2tlbkRhdGE+KGBcbiAgICAgICAgIyMjIyBOb25TdGFuZGFyZFxuXG4gICAgICAgICogXCJOb25TdGFuZGFyZCBzeW1ib2w6PFN0cmluZz4gbmFtZTo8U3RyaW5nPiBkZWNpbWFsczo8TnVtYmVyPTE4PlwiIC0gQSBub24tc3RhbmRhcmQgdG9rZW4sIGxpa2UgQkFUXG4gICAgICAgICAgKiBFLmcuIFwiRXJjMjAgRGVwbG95IE5vblN0YW5kYXJkIEJBVCBcXFwiQmFzaWMgQXR0ZW50aW9uIFRva2VuXFxcIiAxOFwiXG4gICAgICBgLFxuICAgICAgXCJOb25TdGFuZGFyZFwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwic3ltYm9sXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwibmFtZVwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcImRlY2ltYWxzXCIsIGdldE51bWJlclYsIHtkZWZhdWx0OiBuZXcgTnVtYmVyVigxOCl9KSxcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtzeW1ib2wsIG5hbWUsIGRlY2ltYWxzfSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IEZhdWNldFRva2VuTm9uU3RhbmRhcmRIYXJuZXNzLmRlcGxveTxFcmMyMD4od29ybGQsIGZyb20sIFswLCBuYW1lLnZhbCwgZGVjaW1hbHMudmFsLCBzeW1ib2wudmFsXSksXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiTm9uU3RhbmRhcmRcIixcbiAgICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgZGVjaW1hbHM6IGRlY2ltYWxzLnRvTnVtYmVyKCksXG4gICAgICAgICAgY29udHJhY3Q6ICdGYXVjZXROb25TdGFuZGFyZFRva2VuJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7c3ltYm9sOiBTdHJpbmdWLCBuYW1lOiBTdHJpbmdWLCBmdW46U3RyaW5nViwgcmVFbnRyeUZ1blNpZzogU3RyaW5nViwgcmVFbnRyeUZ1bkFyZ3M6IFN0cmluZ1ZbXX0sIFRva2VuRGF0YT4oYFxuICAgICAgICAjIyMjIFJlRW50cmFudFxuXG4gICAgICAgICogXCJSZUVudHJhbnQgc3ltYm9sOjxTdHJpbmc+IG5hbWU6c3RyaW5nIGZ1bjo8U3RyaW5nPiBmdW5TaWc6PFN0cmluZz4gLi4uZnVuQXJnczo8VmFsdWU+XCIgLSBBIHRva2VuIHRoYXQgbG92ZXMgdG8gY2FsbCBiYWNrIHRvIHNwb29rIGl0cyBjYWxsZXJcbiAgICAgICAgICAqIEUuZy4gXCJFcmMyMCBEZXBsb3kgUmVFbnRyYW50IFBIUkVBSyBQSFJFQUsgXCJ0cmFuc2ZlclwiIFwibWludCh1aW50MjU2KVwiIDAgLSBBIHRva2VuIHRoYXQgd2lsbCBjYWxsIGJhY2sgdG8gYSBDVG9rZW4ncyBtaW50IGZ1bmN0aW9uXG5cbiAgICAgICAgTm90ZTogdmFsaWQgZnVuY3Rpb25zOiB0b3RhbFN1cHBseSwgYmFsYW5jZU9mLCB0cmFuc2ZlciwgdHJhbnNmZXJGcm9tLCBhcHByb3ZlLCBhbGxvd2FuY2VcbiAgICAgIGAsXG4gICAgICBcIlJlRW50cmFudFwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwic3ltYm9sXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwibmFtZVwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcImZ1blwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcInJlRW50cnlGdW5TaWdcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJyZUVudHJ5RnVuQXJnc1wiLCBnZXRTdHJpbmdWLCB7dmFyaWFkaWM6IHRydWUsIG1hcHBlZDogdHJ1ZX0pXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7c3ltYm9sLCBuYW1lLCBmdW4sIHJlRW50cnlGdW5TaWcsIHJlRW50cnlGdW5BcmdzfSkgPT4ge1xuICAgICAgICBjb25zdCBmbkRhdGEgPSBlbmNvZGVBQkkod29ybGQsIHJlRW50cnlGdW5TaWcudmFsLCByZUVudHJ5RnVuQXJncy5tYXAoKGEpID0+IGEudmFsKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBGYXVjZXRUb2tlblJlRW50cmFudEhhcm5lc3MuZGVwbG95PEVyYzIwPih3b3JsZCwgZnJvbSwgWzAsIG5hbWUudmFsLCAxOCwgc3ltYm9sLnZhbCwgZm5EYXRhLCBmdW4udmFsXSksXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiUmVFbnRyYW50XCIsXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgc3ltYm9sOiBzeW1ib2wudmFsLFxuICAgICAgICAgIGRlY2ltYWxzOiAxOCxcbiAgICAgICAgICBjb250cmFjdDogJ0ZhdWNldFRva2VuUmVFbnRyYW50SGFybmVzcydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8e3N5bWJvbDogU3RyaW5nViwgbmFtZTogU3RyaW5nViwgZGVjaW1hbHM6IE51bWJlclZ9LCBUb2tlbkRhdGE+KGBcbiAgICAgICAgIyMjIyBFdmlsXG5cbiAgICAgICAgKiBcIkV2aWwgc3ltYm9sOjxTdHJpbmc+IG5hbWU6PFN0cmluZz4gZGVjaW1hbHM6PE51bWJlcj5cIiAtIEEgbGVzcyB2YW5pbGxhIEVSQy0yMCBjb250cmFjdCB0aGF0IGZhaWxzIHRyYW5zZmVyc1xuICAgICAgICAgICogRS5nLiBcIkVyYzIwIERlcGxveSBFdmlsIEJBVCBcXFwiQmFzaWMgQXR0ZW50aW9uIFRva2VuXFxcIiAxOFwiXG4gICAgICBgLFxuICAgICAgXCJFdmlsXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJzeW1ib2xcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJuYW1lXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwiZGVjaW1hbHNcIiwgZ2V0TnVtYmVyViwge2RlZmF1bHQ6IG5ldyBOdW1iZXJWKDE4KX0pXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7c3ltYm9sLCBuYW1lLCBkZWNpbWFsc30pID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBFdmlsVG9rZW5IYXJuZXNzLmRlcGxveTxFcmMyMD4od29ybGQsIGZyb20sIFswLCBuYW1lLnZhbCwgZGVjaW1hbHMudmFsLCBzeW1ib2wudmFsXSksXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRXZpbFwiLFxuICAgICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICAgIHN5bWJvbDogc3ltYm9sLnZhbCxcbiAgICAgICAgICBkZWNpbWFsczogZGVjaW1hbHMudG9OdW1iZXIoKSxcbiAgICAgICAgICBjb250cmFjdDogJ0V2aWxUb2tlbidcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8e3N5bWJvbDogU3RyaW5nViwgbmFtZTogU3RyaW5nViwgZGVjaW1hbHM6IE51bWJlclZ9LCBUb2tlbkRhdGE+KGBcbiAgICAgICAgIyMjIyBTdGFuZGFyZFxuXG4gICAgICAgICogXCJTdGFuZGFyZCBzeW1ib2w6PFN0cmluZz4gbmFtZTo8U3RyaW5nPiBkZWNpbWFsczo8TnVtYmVyPlwiIC0gQSB2YW5pbGxhIEVSQy0yMCBjb250cmFjdFxuICAgICAgICAgICogRS5nLiBcIkVyYzIwIERlcGxveSBTdGFuZGFyZCBCQVQgXFxcIkJhc2ljIEF0dGVudGlvbiBUb2tlblxcXCIgMThcIlxuICAgICAgYCxcbiAgICAgIFwiU3RhbmRhcmRcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcInN5bWJvbFwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcIm5hbWVcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJkZWNpbWFsc1wiLCBnZXROdW1iZXJWLCB7ZGVmYXVsdDogbmV3IE51bWJlclYoMTgpfSlcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtzeW1ib2wsIG5hbWUsIGRlY2ltYWxzfSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IEZhdWNldFRva2VuSGFybmVzcy5kZXBsb3k8RXJjMjA+KHdvcmxkLCBmcm9tLCBbMCwgbmFtZS52YWwsIGRlY2ltYWxzLnZhbCwgc3ltYm9sLnZhbF0pLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlN0YW5kYXJkXCIsXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgc3ltYm9sOiBzeW1ib2wudmFsLFxuICAgICAgICAgIGRlY2ltYWxzOiBkZWNpbWFscy50b051bWJlcigpLFxuICAgICAgICAgIGNvbnRyYWN0OiAnRmF1Y2V0VG9rZW4nXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHtzeW1ib2w6IFN0cmluZ1YsIG5hbWU6IFN0cmluZ1Z9LCBUb2tlbkRhdGE+KGBcbiAgICAgICAgIyMjIyBXQlRDXG5cbiAgICAgICAgKiBcIldCVEMgc3ltYm9sOjxTdHJpbmc+IG5hbWU6PFN0cmluZz5cIiAtIFRoZSBXQlRDIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiRXJjMjAgRGVwbG95IFdCVEMgV0JUQyBcXFwiV3JhcHBlZCBCaXRjb2luXFxcIlwiXG4gICAgICBgLFxuICAgICAgXCJXQlRDXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJzeW1ib2xcIiwgZ2V0U3RyaW5nViwge2RlZmF1bHQ6IG5ldyBTdHJpbmdWKFwiV0JUQ1wiKX0pLFxuICAgICAgICBuZXcgQXJnKFwibmFtZVwiLCBnZXRTdHJpbmdWLCB7ZGVmYXVsdDogbmV3IFN0cmluZ1YoXCJXcmFwcGVkIEJpdGNvaW5cIil9KVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge3N5bWJvbCwgbmFtZX0pID0+IHtcbiAgICAgICAgbGV0IGRlY2ltYWxzID0gODtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IFdCVENUb2tlbkhhcm5lc3MuZGVwbG95PEVyYzIwPih3b3JsZCwgZnJvbSwgW10pLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIldCVENcIixcbiAgICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgZGVjaW1hbHM6IGRlY2ltYWxzLFxuICAgICAgICAgIGNvbnRyYWN0OiAnV0JUQ1Rva2VuJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7c3ltYm9sOiBTdHJpbmdWLCBuYW1lOiBTdHJpbmdWLCBkZWNpbWFsczogTnVtYmVyViwgYmFzaXNQb2ludEZlZTogTnVtYmVyViwgb3duZXI6IEFkZHJlc3NWfSwgVG9rZW5EYXRhPihgXG4gICAgICAgICMjIyMgRmVlXG5cbiAgICAgICAgKiBcIkZlZSBzeW1ib2w6PFN0cmluZz4gbmFtZTo8U3RyaW5nPiBkZWNpbWFsczo8TnVtYmVyPiBiYXNpc1BvaW50RmVlOjxOdW1iZXI+IG93bmVyOjxBZGRyZXNzPlwiIC0gQW4gRVJDMjAgd2hvc2Ugb3duZXIgdGFrZXMgYSBmZWUgb24gdHJhbnNmZXJzLiBVc2VkIGZvciBtb2NraW5nIFVTRFQuXG4gICAgICAgICAgKiBFLmcuIFwiRXJjMjAgRGVwbG95IEZlZSBVU0RUIFVTRFQgMTAwIFJvb3RcIlxuICAgICAgYCxcbiAgICAgIFwiRmVlXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJzeW1ib2xcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJuYW1lXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwiZGVjaW1hbHNcIiwgZ2V0TnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJiYXNpc1BvaW50RmVlXCIsIGdldE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKFwib3duZXJcIiwgZ2V0QWRkcmVzc1YpXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7c3ltYm9sLCBuYW1lLCBkZWNpbWFscywgYmFzaXNQb2ludEZlZSwgb3duZXJ9KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgRmVlVG9rZW5IYXJuZXNzLmRlcGxveTxFcmMyMD4od29ybGQsIGZyb20sIFswLCBuYW1lLnZhbCwgZGVjaW1hbHMudmFsLCBzeW1ib2wudmFsLCBiYXNpc1BvaW50RmVlLnZhbCwgb3duZXIudmFsXSksXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiRmVlXCIsXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgc3ltYm9sOiBzeW1ib2wudmFsLFxuICAgICAgICAgIGRlY2ltYWxzOiBkZWNpbWFscy50b051bWJlcigpLFxuICAgICAgICAgIG93bmVyOiBvd25lci52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdGZWVUb2tlbidcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuICBdO1xuXG4gIGxldCB0b2tlbkRhdGEgPSBhd2FpdCBnZXRGZXRjaGVyVmFsdWU8YW55LCBUb2tlbkRhdGE+KFwiRGVwbG95RXJjMjBcIiwgZmV0Y2hlcnMsIHdvcmxkLCBldmVudCk7XG4gIGxldCBpbnZva2F0aW9uID0gdG9rZW5EYXRhLmludm9rYXRpb247XG4gIGRlbGV0ZSB0b2tlbkRhdGEuaW52b2thdGlvbjtcblxuICBpZiAoaW52b2thdGlvbi5lcnJvcikge1xuICAgIHRocm93IGludm9rYXRpb24uZXJyb3I7XG4gIH1cbiAgY29uc3QgZXJjMjAgPSBpbnZva2F0aW9uLnZhbHVlITtcbiAgdG9rZW5EYXRhLmFkZHJlc3MgPSBlcmMyMC5fYWRkcmVzcztcblxuICB3b3JsZCA9IGF3YWl0IHN0b3JlQW5kU2F2ZUNvbnRyYWN0KFxuICAgIHdvcmxkLFxuICAgIGVyYzIwLFxuICAgIHRva2VuRGF0YS5zeW1ib2wsXG4gICAgaW52b2thdGlvbixcbiAgICBbXG4gICAgICB7IGluZGV4OiBbJ1Rva2VucycsIHRva2VuRGF0YS5zeW1ib2xdLCBkYXRhOiB0b2tlbkRhdGEgfVxuICAgIF1cbiAgKTtcblxuICByZXR1cm4ge3dvcmxkLCBlcmMyMCwgdG9rZW5EYXRhfTtcbn1cbiJdfQ==
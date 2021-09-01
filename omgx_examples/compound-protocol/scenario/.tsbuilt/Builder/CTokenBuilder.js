"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCToken = void 0;
const CoreValue_1 = require("../CoreValue");
const Command_1 = require("../Command");
const Networks_1 = require("../Networks");
const Contract_1 = require("../Contract");
const CErc20Contract = Contract_1.getContract('CErc20Immutable');
const CErc20Delegator = Contract_1.getContract('CErc20Delegator');
const CErc20DelegatorScenario = Contract_1.getTestContract('CErc20DelegatorScenario');
const CEtherContract = Contract_1.getContract('CEther');
const CErc20ScenarioContract = Contract_1.getTestContract('CErc20Scenario');
const CEtherScenarioContract = Contract_1.getTestContract('CEtherScenario');
const CEvilContract = Contract_1.getTestContract('CEvil');
async function buildCToken(world, from, params) {
    const fetchers = [
        new Command_1.Fetcher(`
      #### CErc20Delegator

      * "CErc20Delegator symbol:<String> name:<String> underlying:<Address> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address> implementation:<Address> becomeImplementationData:<String>" - The real deal CToken
        * E.g. "CToken Deploy CErc20Delegator cDAI \"Compound DAI\" (Erc20 DAI Address) (Comptroller Address) (InterestRateModel Address) 1.0 8 Geoff (CToken CDaiDelegate Address) "0x0123434anyByTes314535q" "
    `, 'CErc20Delegator', [
            new Command_1.Arg('symbol', CoreValue_1.getStringV),
            new Command_1.Arg('name', CoreValue_1.getStringV),
            new Command_1.Arg('underlying', CoreValue_1.getAddressV),
            new Command_1.Arg('comptroller', CoreValue_1.getAddressV),
            new Command_1.Arg('interestRateModel', CoreValue_1.getAddressV),
            new Command_1.Arg('initialExchangeRate', CoreValue_1.getExpNumberV),
            new Command_1.Arg('decimals', CoreValue_1.getNumberV),
            new Command_1.Arg('admin', CoreValue_1.getAddressV),
            new Command_1.Arg('implementation', CoreValue_1.getAddressV),
            new Command_1.Arg('becomeImplementationData', CoreValue_1.getStringV)
        ], async (world, { symbol, name, underlying, comptroller, interestRateModel, initialExchangeRate, decimals, admin, implementation, becomeImplementationData }) => {
            return {
                invokation: await CErc20Delegator.deploy(world, from, [
                    underlying.val,
                    comptroller.val,
                    interestRateModel.val,
                    initialExchangeRate.val,
                    name.val,
                    symbol.val,
                    decimals.val,
                    admin.val,
                    implementation.val,
                    becomeImplementationData.val
                ]),
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                underlying: underlying.val,
                contract: 'CErc20Delegator',
                initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                admin: admin.val
            };
        }),
        new Command_1.Fetcher(`
      #### CErc20DelegatorScenario

      * "CErc20DelegatorScenario symbol:<String> name:<String> underlying:<Address> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address> implementation:<Address> becomeImplementationData:<String>" - A CToken Scenario for local testing
        * E.g. "CToken Deploy CErc20DelegatorScenario cDAI \"Compound DAI\" (Erc20 DAI Address) (Comptroller Address) (InterestRateModel Address) 1.0 8 Geoff (CToken CDaiDelegate Address) "0x0123434anyByTes314535q" "
    `, 'CErc20DelegatorScenario', [
            new Command_1.Arg('symbol', CoreValue_1.getStringV),
            new Command_1.Arg('name', CoreValue_1.getStringV),
            new Command_1.Arg('underlying', CoreValue_1.getAddressV),
            new Command_1.Arg('comptroller', CoreValue_1.getAddressV),
            new Command_1.Arg('interestRateModel', CoreValue_1.getAddressV),
            new Command_1.Arg('initialExchangeRate', CoreValue_1.getExpNumberV),
            new Command_1.Arg('decimals', CoreValue_1.getNumberV),
            new Command_1.Arg('admin', CoreValue_1.getAddressV),
            new Command_1.Arg('implementation', CoreValue_1.getAddressV),
            new Command_1.Arg('becomeImplementationData', CoreValue_1.getStringV)
        ], async (world, { symbol, name, underlying, comptroller, interestRateModel, initialExchangeRate, decimals, admin, implementation, becomeImplementationData }) => {
            return {
                invokation: await CErc20DelegatorScenario.deploy(world, from, [
                    underlying.val,
                    comptroller.val,
                    interestRateModel.val,
                    initialExchangeRate.val,
                    name.val,
                    symbol.val,
                    decimals.val,
                    admin.val,
                    implementation.val,
                    becomeImplementationData.val
                ]),
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                underlying: underlying.val,
                contract: 'CErc20DelegatorScenario',
                initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                admin: admin.val
            };
        }),
        new Command_1.Fetcher(`
        #### Scenario

        * "Scenario symbol:<String> name:<String> underlying:<Address> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address>" - A CToken Scenario for local testing
          * E.g. "CToken Deploy Scenario cZRX \"Compound ZRX\" (Erc20 ZRX Address) (Comptroller Address) (InterestRateModel Address) 1.0 8"
      `, "Scenario", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("underlying", CoreValue_1.getAddressV),
            new Command_1.Arg("comptroller", CoreValue_1.getAddressV),
            new Command_1.Arg("interestRateModel", CoreValue_1.getAddressV),
            new Command_1.Arg("initialExchangeRate", CoreValue_1.getExpNumberV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV),
            new Command_1.Arg("admin", CoreValue_1.getAddressV)
        ], async (world, { symbol, name, underlying, comptroller, interestRateModel, initialExchangeRate, decimals, admin }) => {
            return {
                invokation: await CErc20ScenarioContract.deploy(world, from, [underlying.val, comptroller.val, interestRateModel.val, initialExchangeRate.val, name.val, symbol.val, decimals.val, admin.val]),
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                underlying: underlying.val,
                contract: 'CErc20Scenario',
                initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                admin: admin.val
            };
        }),
        new Command_1.Fetcher(`
        #### CEtherScenario

        * "CEtherScenario symbol:<String> name:<String> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address>" - A CToken Scenario for local testing
          * E.g. "CToken Deploy CEtherScenario cETH \"Compound Ether\" (Comptroller Address) (InterestRateModel Address) 1.0 8"
      `, "CEtherScenario", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("comptroller", CoreValue_1.getAddressV),
            new Command_1.Arg("interestRateModel", CoreValue_1.getAddressV),
            new Command_1.Arg("initialExchangeRate", CoreValue_1.getExpNumberV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV),
            new Command_1.Arg("admin", CoreValue_1.getAddressV)
        ], async (world, { symbol, name, comptroller, interestRateModel, initialExchangeRate, decimals, admin }) => {
            return {
                invokation: await CEtherScenarioContract.deploy(world, from, [name.val, symbol.val, decimals.val, admin.val, comptroller.val, interestRateModel.val, initialExchangeRate.val]),
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                underlying: "",
                contract: 'CEtherScenario',
                initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                admin: admin.val
            };
        }),
        new Command_1.Fetcher(`
        #### CEther

        * "CEther symbol:<String> name:<String> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address>" - A CToken Scenario for local testing
          * E.g. "CToken Deploy CEther cETH \"Compound Ether\" (Comptroller Address) (InterestRateModel Address) 1.0 8"
      `, "CEther", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("comptroller", CoreValue_1.getAddressV),
            new Command_1.Arg("interestRateModel", CoreValue_1.getAddressV),
            new Command_1.Arg("initialExchangeRate", CoreValue_1.getExpNumberV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV),
            new Command_1.Arg("admin", CoreValue_1.getAddressV)
        ], async (world, { symbol, name, comptroller, interestRateModel, initialExchangeRate, decimals, admin }) => {
            return {
                invokation: await CEtherContract.deploy(world, from, [comptroller.val, interestRateModel.val, initialExchangeRate.val, name.val, symbol.val, decimals.val, admin.val]),
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                underlying: "",
                contract: 'CEther',
                initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                admin: admin.val
            };
        }),
        new Command_1.Fetcher(`
        #### CErc20

        * "CErc20 symbol:<String> name:<String> underlying:<Address> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address>" - A official CToken contract
          * E.g. "CToken Deploy CErc20 cZRX \"Compound ZRX\" (Erc20 ZRX Address) (Comptroller Address) (InterestRateModel Address) 1.0 8"
      `, "CErc20", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("underlying", CoreValue_1.getAddressV),
            new Command_1.Arg("comptroller", CoreValue_1.getAddressV),
            new Command_1.Arg("interestRateModel", CoreValue_1.getAddressV),
            new Command_1.Arg("initialExchangeRate", CoreValue_1.getExpNumberV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV),
            new Command_1.Arg("admin", CoreValue_1.getAddressV)
        ], async (world, { symbol, name, underlying, comptroller, interestRateModel, initialExchangeRate, decimals, admin }) => {
            return {
                invokation: await CErc20Contract.deploy(world, from, [underlying.val, comptroller.val, interestRateModel.val, initialExchangeRate.val, name.val, symbol.val, decimals.val, admin.val]),
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                underlying: underlying.val,
                contract: 'CErc20',
                initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                admin: admin.val
            };
        }),
        new Command_1.Fetcher(`
        #### CEvil

        * "CEvil symbol:<String> name:<String> underlying:<Address> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address>" - A malicious CToken contract
          * E.g. "CToken Deploy CEvil cEVL \"Compound EVL\" (Erc20 ZRX Address) (Comptroller Address) (InterestRateModel Address) 1.0 8"
      `, "CEvil", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("underlying", CoreValue_1.getAddressV),
            new Command_1.Arg("comptroller", CoreValue_1.getAddressV),
            new Command_1.Arg("interestRateModel", CoreValue_1.getAddressV),
            new Command_1.Arg("initialExchangeRate", CoreValue_1.getExpNumberV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV),
            new Command_1.Arg("admin", CoreValue_1.getAddressV)
        ], async (world, { symbol, name, underlying, comptroller, interestRateModel, initialExchangeRate, decimals, admin }) => {
            return {
                invokation: await CEvilContract.deploy(world, from, [underlying.val, comptroller.val, interestRateModel.val, initialExchangeRate.val, name.val, symbol.val, decimals.val, admin.val]),
                name: name.val,
                symbol: symbol.val,
                decimals: decimals.toNumber(),
                underlying: underlying.val,
                contract: 'CEvil',
                initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                admin: admin.val
            };
        }),
        new Command_1.Fetcher(`
        #### Standard

        * "symbol:<String> name:<String> underlying:<Address> comptroller:<Address> interestRateModel:<Address> initialExchangeRate:<Number> decimals:<Number> admin: <Address>" - A official CToken contract
          * E.g. "CToken Deploy Standard cZRX \"Compound ZRX\" (Erc20 ZRX Address) (Comptroller Address) (InterestRateModel Address) 1.0 8"
      `, "Standard", [
            new Command_1.Arg("symbol", CoreValue_1.getStringV),
            new Command_1.Arg("name", CoreValue_1.getStringV),
            new Command_1.Arg("underlying", CoreValue_1.getAddressV),
            new Command_1.Arg("comptroller", CoreValue_1.getAddressV),
            new Command_1.Arg("interestRateModel", CoreValue_1.getAddressV),
            new Command_1.Arg("initialExchangeRate", CoreValue_1.getExpNumberV),
            new Command_1.Arg("decimals", CoreValue_1.getNumberV),
            new Command_1.Arg("admin", CoreValue_1.getAddressV)
        ], async (world, { symbol, name, underlying, comptroller, interestRateModel, initialExchangeRate, decimals, admin }) => {
            // Note: we're going to use the scenario contract as the standard deployment on local networks
            if (world.isLocalNetwork()) {
                return {
                    invokation: await CErc20ScenarioContract.deploy(world, from, [underlying.val, comptroller.val, interestRateModel.val, initialExchangeRate.val, name.val, symbol.val, decimals.val, admin.val]),
                    name: name.val,
                    symbol: symbol.val,
                    decimals: decimals.toNumber(),
                    underlying: underlying.val,
                    contract: 'CErc20Scenario',
                    initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                    admin: admin.val
                };
            }
            else {
                return {
                    invokation: await CErc20Contract.deploy(world, from, [underlying.val, comptroller.val, interestRateModel.val, initialExchangeRate.val, name.val, symbol.val, decimals.val, admin.val]),
                    name: name.val,
                    symbol: symbol.val,
                    decimals: decimals.toNumber(),
                    underlying: underlying.val,
                    contract: 'CErc20Immutable',
                    initial_exchange_rate_mantissa: initialExchangeRate.encode().toString(),
                    admin: admin.val
                };
            }
        }, { catchall: true })
    ];
    let tokenData = await Command_1.getFetcherValue("DeployCToken", fetchers, world, params);
    let invokation = tokenData.invokation;
    delete tokenData.invokation;
    if (invokation.error) {
        throw invokation.error;
    }
    const cToken = invokation.value;
    tokenData.address = cToken._address;
    world = await Networks_1.storeAndSaveContract(world, cToken, tokenData.symbol, invokation, [
        { index: ['cTokens', tokenData.symbol], data: tokenData },
        { index: ['Tokens', tokenData.symbol], data: tokenData }
    ]);
    return { world, cToken, tokenData };
}
exports.buildCToken = buildCToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1Rva2VuQnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9CdWlsZGVyL0NUb2tlbkJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0EsNENBQWtGO0FBRWxGLHdDQUEyRDtBQUMzRCwwQ0FBbUQ7QUFDbkQsMENBQTJEO0FBRTNELE1BQU0sY0FBYyxHQUFHLHNCQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN0RCxNQUFNLGVBQWUsR0FBRyxzQkFBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdkQsTUFBTSx1QkFBdUIsR0FBRywwQkFBZSxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDM0UsTUFBTSxjQUFjLEdBQUcsc0JBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QyxNQUFNLHNCQUFzQixHQUFHLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNqRSxNQUFNLHNCQUFzQixHQUFHLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNqRSxNQUFNLGFBQWEsR0FBRywwQkFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBY3hDLEtBQUssVUFBVSxXQUFXLENBQy9CLEtBQVksRUFDWixJQUFZLEVBQ1osTUFBYTtJQUViLE1BQU0sUUFBUSxHQUFHO1FBQ2YsSUFBSSxpQkFBTyxDQWVYOzs7OztLQUtDLEVBQ0MsaUJBQWlCLEVBQ2pCO1lBQ0UsSUFBSSxhQUFHLENBQUMsUUFBUSxFQUFFLHNCQUFVLENBQUM7WUFDN0IsSUFBSSxhQUFHLENBQUMsTUFBTSxFQUFFLHNCQUFVLENBQUM7WUFDM0IsSUFBSSxhQUFHLENBQUMsWUFBWSxFQUFFLHVCQUFXLENBQUM7WUFDbEMsSUFBSSxhQUFHLENBQUMsYUFBYSxFQUFFLHVCQUFXLENBQUM7WUFDbkMsSUFBSSxhQUFHLENBQUMsbUJBQW1CLEVBQUUsdUJBQVcsQ0FBQztZQUN6QyxJQUFJLGFBQUcsQ0FBQyxxQkFBcUIsRUFBRSx5QkFBYSxDQUFD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TSxDQUFDO0lBQ2pDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUVwQyxLQUFLLEdBQUcsTUFBTSwrQkFBb0IsQ0FDaEMsS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLENBQUMsTUFBTSxFQUNoQixVQUFVLEVBQ1Y7UUFDRSxFQUFFLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtRQUN6RCxFQUFFLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtLQUN6RCxDQUNGLENBQUM7SUFFRixPQUFPLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUMsQ0FBQztBQUNwQyxDQUFDO0FBeFhELGtDQXdYQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50IH0gZnJvbSAnLi4vRXZlbnQnO1xuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuLi9Xb3JsZCc7XG5pbXBvcnQgeyBDRXJjMjBEZWxlZ2F0b3IsIENFcmMyMERlbGVnYXRvclNjZW5hcmlvIH0gZnJvbSAnLi4vQ29udHJhY3QvQ0VyYzIwRGVsZWdhdG9yJztcbmltcG9ydCB7IENUb2tlbiB9IGZyb20gJy4uL0NvbnRyYWN0L0NUb2tlbic7XG5pbXBvcnQgeyBJbnZva2F0aW9uLCBpbnZva2UgfSBmcm9tICcuLi9JbnZva2F0aW9uJztcbmltcG9ydCB7IGdldEFkZHJlc3NWLCBnZXRFeHBOdW1iZXJWLCBnZXROdW1iZXJWLCBnZXRTdHJpbmdWIH0gZnJvbSAnLi4vQ29yZVZhbHVlJztcbmltcG9ydCB7IEFkZHJlc3NWLCBOdW1iZXJWLCBTdHJpbmdWIH0gZnJvbSAnLi4vVmFsdWUnO1xuaW1wb3J0IHsgQXJnLCBGZXRjaGVyLCBnZXRGZXRjaGVyVmFsdWUgfSBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7IHN0b3JlQW5kU2F2ZUNvbnRyYWN0IH0gZnJvbSAnLi4vTmV0d29ya3MnO1xuaW1wb3J0IHsgZ2V0Q29udHJhY3QsIGdldFRlc3RDb250cmFjdCB9IGZyb20gJy4uL0NvbnRyYWN0JztcblxuY29uc3QgQ0VyYzIwQ29udHJhY3QgPSBnZXRDb250cmFjdCgnQ0VyYzIwSW1tdXRhYmxlJyk7XG5jb25zdCBDRXJjMjBEZWxlZ2F0b3IgPSBnZXRDb250cmFjdCgnQ0VyYzIwRGVsZWdhdG9yJyk7XG5jb25zdCBDRXJjMjBEZWxlZ2F0b3JTY2VuYXJpbyA9IGdldFRlc3RDb250cmFjdCgnQ0VyYzIwRGVsZWdhdG9yU2NlbmFyaW8nKTtcbmNvbnN0IENFdGhlckNvbnRyYWN0ID0gZ2V0Q29udHJhY3QoJ0NFdGhlcicpO1xuY29uc3QgQ0VyYzIwU2NlbmFyaW9Db250cmFjdCA9IGdldFRlc3RDb250cmFjdCgnQ0VyYzIwU2NlbmFyaW8nKTtcbmNvbnN0IENFdGhlclNjZW5hcmlvQ29udHJhY3QgPSBnZXRUZXN0Q29udHJhY3QoJ0NFdGhlclNjZW5hcmlvJyk7XG5jb25zdCBDRXZpbENvbnRyYWN0ID0gZ2V0VGVzdENvbnRyYWN0KCdDRXZpbCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRva2VuRGF0YSB7XG4gIGludm9rYXRpb246IEludm9rYXRpb248Q1Rva2VuPjtcbiAgbmFtZTogc3RyaW5nO1xuICBzeW1ib2w6IHN0cmluZztcbiAgZGVjaW1hbHM/OiBudW1iZXI7XG4gIHVuZGVybHlpbmc/OiBzdHJpbmc7XG4gIGFkZHJlc3M/OiBzdHJpbmc7XG4gIGNvbnRyYWN0OiBzdHJpbmc7XG4gIGluaXRpYWxfZXhjaGFuZ2VfcmF0ZV9tYW50aXNzYT86IHN0cmluZztcbiAgYWRtaW4/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZENUb2tlbihcbiAgd29ybGQ6IFdvcmxkLFxuICBmcm9tOiBzdHJpbmcsXG4gIHBhcmFtczogRXZlbnRcbik6IFByb21pc2U8eyB3b3JsZDogV29ybGQ7IGNUb2tlbjogQ1Rva2VuOyB0b2tlbkRhdGE6IFRva2VuRGF0YSB9PiB7XG4gIGNvbnN0IGZldGNoZXJzID0gW1xuICAgIG5ldyBGZXRjaGVyPFxuICAgICAge1xuICAgICAgICBzeW1ib2w6IFN0cmluZ1Y7XG4gICAgICAgIG5hbWU6IFN0cmluZ1Y7XG4gICAgICAgIGRlY2ltYWxzOiBOdW1iZXJWO1xuICAgICAgICB1bmRlcmx5aW5nOiBBZGRyZXNzVjtcbiAgICAgICAgY29tcHRyb2xsZXI6IEFkZHJlc3NWO1xuICAgICAgICBpbnRlcmVzdFJhdGVNb2RlbDogQWRkcmVzc1Y7XG4gICAgICAgIGluaXRpYWxFeGNoYW5nZVJhdGU6IE51bWJlclY7XG4gICAgICAgIGFkbWluOiBBZGRyZXNzVjtcbiAgICAgICAgaW1wbGVtZW50YXRpb246IEFkZHJlc3NWO1xuICAgICAgICBiZWNvbWVJbXBsZW1lbnRhdGlvbkRhdGE6IFN0cmluZ1Y7XG4gICAgICB9LFxuICAgICAgVG9rZW5EYXRhXG4gICAgPihcbiAgICBgXG4gICAgICAjIyMjIENFcmMyMERlbGVnYXRvclxuXG4gICAgICAqIFwiQ0VyYzIwRGVsZWdhdG9yIHN5bWJvbDo8U3RyaW5nPiBuYW1lOjxTdHJpbmc+IHVuZGVybHlpbmc6PEFkZHJlc3M+IGNvbXB0cm9sbGVyOjxBZGRyZXNzPiBpbnRlcmVzdFJhdGVNb2RlbDo8QWRkcmVzcz4gaW5pdGlhbEV4Y2hhbmdlUmF0ZTo8TnVtYmVyPiBkZWNpbWFsczo8TnVtYmVyPiBhZG1pbjogPEFkZHJlc3M+IGltcGxlbWVudGF0aW9uOjxBZGRyZXNzPiBiZWNvbWVJbXBsZW1lbnRhdGlvbkRhdGE6PFN0cmluZz5cIiAtIFRoZSByZWFsIGRlYWwgQ1Rva2VuXG4gICAgICAgICogRS5nLiBcIkNUb2tlbiBEZXBsb3kgQ0VyYzIwRGVsZWdhdG9yIGNEQUkgXFxcIkNvbXBvdW5kIERBSVxcXCIgKEVyYzIwIERBSSBBZGRyZXNzKSAoQ29tcHRyb2xsZXIgQWRkcmVzcykgKEludGVyZXN0UmF0ZU1vZGVsIEFkZHJlc3MpIDEuMCA4IEdlb2ZmIChDVG9rZW4gQ0RhaURlbGVnYXRlIEFkZHJlc3MpIFwiMHgwMTIzNDM0YW55QnlUZXMzMTQ1MzVxXCIgXCJcbiAgICBgLFxuICAgICAgJ0NFcmMyMERlbGVnYXRvcicsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoJ3N5bWJvbCcsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoJ3VuZGVybHlpbmcnLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoJ2NvbXB0cm9sbGVyJywgZ2V0QWRkcmVzc1YpLFxuICAgICAgICBuZXcgQXJnKCdpbnRlcmVzdFJhdGVNb2RlbCcsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZygnaW5pdGlhbEV4Y2hhbmdlUmF0ZScsIGdldEV4cE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKCdkZWNpbWFscycsIGdldE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKCdhZG1pbicsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZygnaW1wbGVtZW50YXRpb24nLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoJ2JlY29tZUltcGxlbWVudGF0aW9uRGF0YScsIGdldFN0cmluZ1YpXG4gICAgICBdLFxuICAgICAgYXN5bmMgKFxuICAgICAgICB3b3JsZCxcbiAgICAgICAge1xuICAgICAgICAgIHN5bWJvbCxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIHVuZGVybHlpbmcsXG4gICAgICAgICAgY29tcHRyb2xsZXIsXG4gICAgICAgICAgaW50ZXJlc3RSYXRlTW9kZWwsXG4gICAgICAgICAgaW5pdGlhbEV4Y2hhbmdlUmF0ZSxcbiAgICAgICAgICBkZWNpbWFscyxcbiAgICAgICAgICBhZG1pbixcbiAgICAgICAgICBpbXBsZW1lbnRhdGlvbixcbiAgICAgICAgICBiZWNvbWVJbXBsZW1lbnRhdGlvbkRhdGFcbiAgICAgICAgfVxuICAgICAgKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ0VyYzIwRGVsZWdhdG9yLmRlcGxveTxDRXJjMjBEZWxlZ2F0b3I+KHdvcmxkLCBmcm9tLCBbXG4gICAgICAgICAgICB1bmRlcmx5aW5nLnZhbCxcbiAgICAgICAgICAgIGNvbXB0cm9sbGVyLnZhbCxcbiAgICAgICAgICAgIGludGVyZXN0UmF0ZU1vZGVsLnZhbCxcbiAgICAgICAgICAgIGluaXRpYWxFeGNoYW5nZVJhdGUudmFsLFxuICAgICAgICAgICAgbmFtZS52YWwsXG4gICAgICAgICAgICBzeW1ib2wudmFsLFxuICAgICAgICAgICAgZGVjaW1hbHMudmFsLFxuICAgICAgICAgICAgYWRtaW4udmFsLFxuICAgICAgICAgICAgaW1wbGVtZW50YXRpb24udmFsLFxuICAgICAgICAgICAgYmVjb21lSW1wbGVtZW50YXRpb25EYXRhLnZhbFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICAgIHN5bWJvbDogc3ltYm9sLnZhbCxcbiAgICAgICAgICBkZWNpbWFsczogZGVjaW1hbHMudG9OdW1iZXIoKSxcbiAgICAgICAgICB1bmRlcmx5aW5nOiB1bmRlcmx5aW5nLnZhbCxcbiAgICAgICAgICBjb250cmFjdDogJ0NFcmMyMERlbGVnYXRvcicsXG4gICAgICAgICAgaW5pdGlhbF9leGNoYW5nZV9yYXRlX21hbnRpc3NhOiBpbml0aWFsRXhjaGFuZ2VSYXRlLmVuY29kZSgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgYWRtaW46IGFkbWluLnZhbFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjxcbiAgICAgIHtcbiAgICAgICAgc3ltYm9sOiBTdHJpbmdWO1xuICAgICAgICBuYW1lOiBTdHJpbmdWO1xuICAgICAgICBkZWNpbWFsczogTnVtYmVyVjtcbiAgICAgICAgdW5kZXJseWluZzogQWRkcmVzc1Y7XG4gICAgICAgIGNvbXB0cm9sbGVyOiBBZGRyZXNzVjtcbiAgICAgICAgaW50ZXJlc3RSYXRlTW9kZWw6IEFkZHJlc3NWO1xuICAgICAgICBpbml0aWFsRXhjaGFuZ2VSYXRlOiBOdW1iZXJWO1xuICAgICAgICBhZG1pbjogQWRkcmVzc1Y7XG4gICAgICAgIGltcGxlbWVudGF0aW9uOiBBZGRyZXNzVjtcbiAgICAgICAgYmVjb21lSW1wbGVtZW50YXRpb25EYXRhOiBTdHJpbmdWO1xuICAgICAgfSxcbiAgICAgIFRva2VuRGF0YVxuICAgID4oXG4gICAgYFxuICAgICAgIyMjIyBDRXJjMjBEZWxlZ2F0b3JTY2VuYXJpb1xuXG4gICAgICAqIFwiQ0VyYzIwRGVsZWdhdG9yU2NlbmFyaW8gc3ltYm9sOjxTdHJpbmc+IG5hbWU6PFN0cmluZz4gdW5kZXJseWluZzo8QWRkcmVzcz4gY29tcHRyb2xsZXI6PEFkZHJlc3M+IGludGVyZXN0UmF0ZU1vZGVsOjxBZGRyZXNzPiBpbml0aWFsRXhjaGFuZ2VSYXRlOjxOdW1iZXI+IGRlY2ltYWxzOjxOdW1iZXI+IGFkbWluOiA8QWRkcmVzcz4gaW1wbGVtZW50YXRpb246PEFkZHJlc3M+IGJlY29tZUltcGxlbWVudGF0aW9uRGF0YTo8U3RyaW5nPlwiIC0gQSBDVG9rZW4gU2NlbmFyaW8gZm9yIGxvY2FsIHRlc3RpbmdcbiAgICAgICAgKiBFLmcuIFwiQ1Rva2VuIERlcGxveSBDRXJjMjBEZWxlZ2F0b3JTY2VuYXJpbyBjREFJIFxcXCJDb21wb3VuZCBEQUlcXFwiIChFcmMyMCBEQUkgQWRkcmVzcykgKENvbXB0cm9sbGVyIEFkZHJlc3MpIChJbnRlcmVzdFJhdGVNb2RlbCBBZGRyZXNzKSAxLjAgOCBHZW9mZiAoQ1Rva2VuIENEYWlEZWxlZ2F0ZSBBZGRyZXNzKSBcIjB4MDEyMzQzNGFueUJ5VGVzMzE0NTM1cVwiIFwiXG4gICAgYCxcbiAgICAgICdDRXJjMjBEZWxlZ2F0b3JTY2VuYXJpbycsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoJ3N5bWJvbCcsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoJ3VuZGVybHlpbmcnLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoJ2NvbXB0cm9sbGVyJywgZ2V0QWRkcmVzc1YpLFxuICAgICAgICBuZXcgQXJnKCdpbnRlcmVzdFJhdGVNb2RlbCcsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZygnaW5pdGlhbEV4Y2hhbmdlUmF0ZScsIGdldEV4cE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKCdkZWNpbWFscycsIGdldE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKCdhZG1pbicsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZygnaW1wbGVtZW50YXRpb24nLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoJ2JlY29tZUltcGxlbWVudGF0aW9uRGF0YScsIGdldFN0cmluZ1YpXG4gICAgICBdLFxuICAgICAgYXN5bmMgKFxuICAgICAgICB3b3JsZCxcbiAgICAgICAge1xuICAgICAgICAgIHN5bWJvbCxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIHVuZGVybHlpbmcsXG4gICAgICAgICAgY29tcHRyb2xsZXIsXG4gICAgICAgICAgaW50ZXJlc3RSYXRlTW9kZWwsXG4gICAgICAgICAgaW5pdGlhbEV4Y2hhbmdlUmF0ZSxcbiAgICAgICAgICBkZWNpbWFscyxcbiAgICAgICAgICBhZG1pbixcbiAgICAgICAgICBpbXBsZW1lbnRhdGlvbixcbiAgICAgICAgICBiZWNvbWVJbXBsZW1lbnRhdGlvbkRhdGFcbiAgICAgICAgfVxuICAgICAgKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ0VyYzIwRGVsZWdhdG9yU2NlbmFyaW8uZGVwbG95PENFcmMyMERlbGVnYXRvclNjZW5hcmlvPih3b3JsZCwgZnJvbSwgW1xuICAgICAgICAgICAgdW5kZXJseWluZy52YWwsXG4gICAgICAgICAgICBjb21wdHJvbGxlci52YWwsXG4gICAgICAgICAgICBpbnRlcmVzdFJhdGVNb2RlbC52YWwsXG4gICAgICAgICAgICBpbml0aWFsRXhjaGFuZ2VSYXRlLnZhbCxcbiAgICAgICAgICAgIG5hbWUudmFsLFxuICAgICAgICAgICAgc3ltYm9sLnZhbCxcbiAgICAgICAgICAgIGRlY2ltYWxzLnZhbCxcbiAgICAgICAgICAgIGFkbWluLnZhbCxcbiAgICAgICAgICAgIGltcGxlbWVudGF0aW9uLnZhbCxcbiAgICAgICAgICAgIGJlY29tZUltcGxlbWVudGF0aW9uRGF0YS52YWxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgZGVjaW1hbHM6IGRlY2ltYWxzLnRvTnVtYmVyKCksXG4gICAgICAgICAgdW5kZXJseWluZzogdW5kZXJseWluZy52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDRXJjMjBEZWxlZ2F0b3JTY2VuYXJpbycsXG4gICAgICAgICAgaW5pdGlhbF9leGNoYW5nZV9yYXRlX21hbnRpc3NhOiBpbml0aWFsRXhjaGFuZ2VSYXRlLmVuY29kZSgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgYWRtaW46IGFkbWluLnZhbFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7c3ltYm9sOiBTdHJpbmdWLCBuYW1lOiBTdHJpbmdWLCBkZWNpbWFsczogTnVtYmVyViwgdW5kZXJseWluZzogQWRkcmVzc1YsIGNvbXB0cm9sbGVyOiBBZGRyZXNzViwgaW50ZXJlc3RSYXRlTW9kZWw6IEFkZHJlc3NWLCBpbml0aWFsRXhjaGFuZ2VSYXRlOiBOdW1iZXJWLCBhZG1pbjogQWRkcmVzc1Z9LCBUb2tlbkRhdGE+KGBcbiAgICAgICAgIyMjIyBTY2VuYXJpb1xuXG4gICAgICAgICogXCJTY2VuYXJpbyBzeW1ib2w6PFN0cmluZz4gbmFtZTo8U3RyaW5nPiB1bmRlcmx5aW5nOjxBZGRyZXNzPiBjb21wdHJvbGxlcjo8QWRkcmVzcz4gaW50ZXJlc3RSYXRlTW9kZWw6PEFkZHJlc3M+IGluaXRpYWxFeGNoYW5nZVJhdGU6PE51bWJlcj4gZGVjaW1hbHM6PE51bWJlcj4gYWRtaW46IDxBZGRyZXNzPlwiIC0gQSBDVG9rZW4gU2NlbmFyaW8gZm9yIGxvY2FsIHRlc3RpbmdcbiAgICAgICAgICAqIEUuZy4gXCJDVG9rZW4gRGVwbG95IFNjZW5hcmlvIGNaUlggXFxcIkNvbXBvdW5kIFpSWFxcXCIgKEVyYzIwIFpSWCBBZGRyZXNzKSAoQ29tcHRyb2xsZXIgQWRkcmVzcykgKEludGVyZXN0UmF0ZU1vZGVsIEFkZHJlc3MpIDEuMCA4XCJcbiAgICAgIGAsXG4gICAgICBcIlNjZW5hcmlvXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJzeW1ib2xcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJuYW1lXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwidW5kZXJseWluZ1wiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJpbnRlcmVzdFJhdGVNb2RlbFwiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJpbml0aWFsRXhjaGFuZ2VSYXRlXCIsIGdldEV4cE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKFwiZGVjaW1hbHNcIiwgZ2V0TnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJhZG1pblwiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtzeW1ib2wsIG5hbWUsIHVuZGVybHlpbmcsIGNvbXB0cm9sbGVyLCBpbnRlcmVzdFJhdGVNb2RlbCwgaW5pdGlhbEV4Y2hhbmdlUmF0ZSwgZGVjaW1hbHMsIGFkbWlufSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IENFcmMyMFNjZW5hcmlvQ29udHJhY3QuZGVwbG95PENUb2tlbj4od29ybGQsIGZyb20sIFt1bmRlcmx5aW5nLnZhbCwgY29tcHRyb2xsZXIudmFsLCBpbnRlcmVzdFJhdGVNb2RlbC52YWwsIGluaXRpYWxFeGNoYW5nZVJhdGUudmFsLCBuYW1lLnZhbCwgc3ltYm9sLnZhbCwgZGVjaW1hbHMudmFsLCBhZG1pbi52YWxdKSxcbiAgICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgZGVjaW1hbHM6IGRlY2ltYWxzLnRvTnVtYmVyKCksXG4gICAgICAgICAgdW5kZXJseWluZzogdW5kZXJseWluZy52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDRXJjMjBTY2VuYXJpbycsXG4gICAgICAgICAgaW5pdGlhbF9leGNoYW5nZV9yYXRlX21hbnRpc3NhOiBpbml0aWFsRXhjaGFuZ2VSYXRlLmVuY29kZSgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgYWRtaW46IGFkbWluLnZhbFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7c3ltYm9sOiBTdHJpbmdWLCBuYW1lOiBTdHJpbmdWLCBkZWNpbWFsczogTnVtYmVyViwgYWRtaW46IEFkZHJlc3NWLCBjb21wdHJvbGxlcjogQWRkcmVzc1YsIGludGVyZXN0UmF0ZU1vZGVsOiBBZGRyZXNzViwgaW5pdGlhbEV4Y2hhbmdlUmF0ZTogTnVtYmVyVn0sIFRva2VuRGF0YT4oYFxuICAgICAgICAjIyMjIENFdGhlclNjZW5hcmlvXG5cbiAgICAgICAgKiBcIkNFdGhlclNjZW5hcmlvIHN5bWJvbDo8U3RyaW5nPiBuYW1lOjxTdHJpbmc+IGNvbXB0cm9sbGVyOjxBZGRyZXNzPiBpbnRlcmVzdFJhdGVNb2RlbDo8QWRkcmVzcz4gaW5pdGlhbEV4Y2hhbmdlUmF0ZTo8TnVtYmVyPiBkZWNpbWFsczo8TnVtYmVyPiBhZG1pbjogPEFkZHJlc3M+XCIgLSBBIENUb2tlbiBTY2VuYXJpbyBmb3IgbG9jYWwgdGVzdGluZ1xuICAgICAgICAgICogRS5nLiBcIkNUb2tlbiBEZXBsb3kgQ0V0aGVyU2NlbmFyaW8gY0VUSCBcXFwiQ29tcG91bmQgRXRoZXJcXFwiIChDb21wdHJvbGxlciBBZGRyZXNzKSAoSW50ZXJlc3RSYXRlTW9kZWwgQWRkcmVzcykgMS4wIDhcIlxuICAgICAgYCxcbiAgICAgIFwiQ0V0aGVyU2NlbmFyaW9cIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcInN5bWJvbFwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcIm5hbWVcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJpbnRlcmVzdFJhdGVNb2RlbFwiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJpbml0aWFsRXhjaGFuZ2VSYXRlXCIsIGdldEV4cE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKFwiZGVjaW1hbHNcIiwgZ2V0TnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJhZG1pblwiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtzeW1ib2wsIG5hbWUsIGNvbXB0cm9sbGVyLCBpbnRlcmVzdFJhdGVNb2RlbCwgaW5pdGlhbEV4Y2hhbmdlUmF0ZSwgZGVjaW1hbHMsIGFkbWlufSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IENFdGhlclNjZW5hcmlvQ29udHJhY3QuZGVwbG95PENUb2tlbj4od29ybGQsIGZyb20sIFtuYW1lLnZhbCwgc3ltYm9sLnZhbCwgZGVjaW1hbHMudmFsLCBhZG1pbi52YWwsIGNvbXB0cm9sbGVyLnZhbCwgaW50ZXJlc3RSYXRlTW9kZWwudmFsLCBpbml0aWFsRXhjaGFuZ2VSYXRlLnZhbF0pLFxuICAgICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICAgIHN5bWJvbDogc3ltYm9sLnZhbCxcbiAgICAgICAgICBkZWNpbWFsczogZGVjaW1hbHMudG9OdW1iZXIoKSxcbiAgICAgICAgICB1bmRlcmx5aW5nOiBcIlwiLFxuICAgICAgICAgIGNvbnRyYWN0OiAnQ0V0aGVyU2NlbmFyaW8nLFxuICAgICAgICAgIGluaXRpYWxfZXhjaGFuZ2VfcmF0ZV9tYW50aXNzYTogaW5pdGlhbEV4Y2hhbmdlUmF0ZS5lbmNvZGUoKS50b1N0cmluZygpLFxuICAgICAgICAgIGFkbWluOiBhZG1pbi52YWxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8e3N5bWJvbDogU3RyaW5nViwgbmFtZTogU3RyaW5nViwgZGVjaW1hbHM6IE51bWJlclYsIGFkbWluOiBBZGRyZXNzViwgY29tcHRyb2xsZXI6IEFkZHJlc3NWLCBpbnRlcmVzdFJhdGVNb2RlbDogQWRkcmVzc1YsIGluaXRpYWxFeGNoYW5nZVJhdGU6IE51bWJlclZ9LCBUb2tlbkRhdGE+KGBcbiAgICAgICAgIyMjIyBDRXRoZXJcblxuICAgICAgICAqIFwiQ0V0aGVyIHN5bWJvbDo8U3RyaW5nPiBuYW1lOjxTdHJpbmc+IGNvbXB0cm9sbGVyOjxBZGRyZXNzPiBpbnRlcmVzdFJhdGVNb2RlbDo8QWRkcmVzcz4gaW5pdGlhbEV4Y2hhbmdlUmF0ZTo8TnVtYmVyPiBkZWNpbWFsczo8TnVtYmVyPiBhZG1pbjogPEFkZHJlc3M+XCIgLSBBIENUb2tlbiBTY2VuYXJpbyBmb3IgbG9jYWwgdGVzdGluZ1xuICAgICAgICAgICogRS5nLiBcIkNUb2tlbiBEZXBsb3kgQ0V0aGVyIGNFVEggXFxcIkNvbXBvdW5kIEV0aGVyXFxcIiAoQ29tcHRyb2xsZXIgQWRkcmVzcykgKEludGVyZXN0UmF0ZU1vZGVsIEFkZHJlc3MpIDEuMCA4XCJcbiAgICAgIGAsXG4gICAgICBcIkNFdGhlclwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwic3ltYm9sXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwibmFtZVwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImludGVyZXN0UmF0ZU1vZGVsXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImluaXRpYWxFeGNoYW5nZVJhdGVcIiwgZ2V0RXhwTnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJkZWNpbWFsc1wiLCBnZXROdW1iZXJWKSxcbiAgICAgICAgbmV3IEFyZyhcImFkbWluXCIsIGdldEFkZHJlc3NWKVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge3N5bWJvbCwgbmFtZSwgY29tcHRyb2xsZXIsIGludGVyZXN0UmF0ZU1vZGVsLCBpbml0aWFsRXhjaGFuZ2VSYXRlLCBkZWNpbWFscywgYWRtaW59KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ0V0aGVyQ29udHJhY3QuZGVwbG95PENUb2tlbj4od29ybGQsIGZyb20sIFtjb21wdHJvbGxlci52YWwsIGludGVyZXN0UmF0ZU1vZGVsLnZhbCwgaW5pdGlhbEV4Y2hhbmdlUmF0ZS52YWwsIG5hbWUudmFsLCBzeW1ib2wudmFsLCBkZWNpbWFscy52YWwsIGFkbWluLnZhbF0pLFxuICAgICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICAgIHN5bWJvbDogc3ltYm9sLnZhbCxcbiAgICAgICAgICBkZWNpbWFsczogZGVjaW1hbHMudG9OdW1iZXIoKSxcbiAgICAgICAgICB1bmRlcmx5aW5nOiBcIlwiLFxuICAgICAgICAgIGNvbnRyYWN0OiAnQ0V0aGVyJyxcbiAgICAgICAgICBpbml0aWFsX2V4Y2hhbmdlX3JhdGVfbWFudGlzc2E6IGluaXRpYWxFeGNoYW5nZVJhdGUuZW5jb2RlKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICBhZG1pbjogYWRtaW4udmFsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHtzeW1ib2w6IFN0cmluZ1YsIG5hbWU6IFN0cmluZ1YsIGRlY2ltYWxzOiBOdW1iZXJWLCBhZG1pbjogQWRkcmVzc1YsIHVuZGVybHlpbmc6IEFkZHJlc3NWLCBjb21wdHJvbGxlcjogQWRkcmVzc1YsIGludGVyZXN0UmF0ZU1vZGVsOiBBZGRyZXNzViwgaW5pdGlhbEV4Y2hhbmdlUmF0ZTogTnVtYmVyVn0sIFRva2VuRGF0YT4oYFxuICAgICAgICAjIyMjIENFcmMyMFxuXG4gICAgICAgICogXCJDRXJjMjAgc3ltYm9sOjxTdHJpbmc+IG5hbWU6PFN0cmluZz4gdW5kZXJseWluZzo8QWRkcmVzcz4gY29tcHRyb2xsZXI6PEFkZHJlc3M+IGludGVyZXN0UmF0ZU1vZGVsOjxBZGRyZXNzPiBpbml0aWFsRXhjaGFuZ2VSYXRlOjxOdW1iZXI+IGRlY2ltYWxzOjxOdW1iZXI+IGFkbWluOiA8QWRkcmVzcz5cIiAtIEEgb2ZmaWNpYWwgQ1Rva2VuIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiQ1Rva2VuIERlcGxveSBDRXJjMjAgY1pSWCBcXFwiQ29tcG91bmQgWlJYXFxcIiAoRXJjMjAgWlJYIEFkZHJlc3MpIChDb21wdHJvbGxlciBBZGRyZXNzKSAoSW50ZXJlc3RSYXRlTW9kZWwgQWRkcmVzcykgMS4wIDhcIlxuICAgICAgYCxcbiAgICAgIFwiQ0VyYzIwXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJzeW1ib2xcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJuYW1lXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwidW5kZXJseWluZ1wiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJjb21wdHJvbGxlclwiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJpbnRlcmVzdFJhdGVNb2RlbFwiLCBnZXRBZGRyZXNzViksXG4gICAgICAgIG5ldyBBcmcoXCJpbml0aWFsRXhjaGFuZ2VSYXRlXCIsIGdldEV4cE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKFwiZGVjaW1hbHNcIiwgZ2V0TnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJhZG1pblwiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHtzeW1ib2wsIG5hbWUsIHVuZGVybHlpbmcsIGNvbXB0cm9sbGVyLCBpbnRlcmVzdFJhdGVNb2RlbCwgaW5pdGlhbEV4Y2hhbmdlUmF0ZSwgZGVjaW1hbHMsIGFkbWlufSkgPT4ge1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ0VyYzIwQ29udHJhY3QuZGVwbG95PENUb2tlbj4od29ybGQsIGZyb20sIFt1bmRlcmx5aW5nLnZhbCwgY29tcHRyb2xsZXIudmFsLCBpbnRlcmVzdFJhdGVNb2RlbC52YWwsIGluaXRpYWxFeGNoYW5nZVJhdGUudmFsLCBuYW1lLnZhbCwgc3ltYm9sLnZhbCwgZGVjaW1hbHMudmFsLCBhZG1pbi52YWxdKSxcbiAgICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgZGVjaW1hbHM6IGRlY2ltYWxzLnRvTnVtYmVyKCksXG4gICAgICAgICAgdW5kZXJseWluZzogdW5kZXJseWluZy52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDRXJjMjAnLFxuICAgICAgICAgIGluaXRpYWxfZXhjaGFuZ2VfcmF0ZV9tYW50aXNzYTogaW5pdGlhbEV4Y2hhbmdlUmF0ZS5lbmNvZGUoKS50b1N0cmluZygpLFxuICAgICAgICAgIGFkbWluOiBhZG1pbi52YWxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8e3N5bWJvbDogU3RyaW5nViwgbmFtZTogU3RyaW5nViwgZGVjaW1hbHM6IE51bWJlclYsIGFkbWluOiBBZGRyZXNzViwgdW5kZXJseWluZzogQWRkcmVzc1YsIGNvbXB0cm9sbGVyOiBBZGRyZXNzViwgaW50ZXJlc3RSYXRlTW9kZWw6IEFkZHJlc3NWLCBpbml0aWFsRXhjaGFuZ2VSYXRlOiBOdW1iZXJWfSwgVG9rZW5EYXRhPihgXG4gICAgICAgICMjIyMgQ0V2aWxcblxuICAgICAgICAqIFwiQ0V2aWwgc3ltYm9sOjxTdHJpbmc+IG5hbWU6PFN0cmluZz4gdW5kZXJseWluZzo8QWRkcmVzcz4gY29tcHRyb2xsZXI6PEFkZHJlc3M+IGludGVyZXN0UmF0ZU1vZGVsOjxBZGRyZXNzPiBpbml0aWFsRXhjaGFuZ2VSYXRlOjxOdW1iZXI+IGRlY2ltYWxzOjxOdW1iZXI+IGFkbWluOiA8QWRkcmVzcz5cIiAtIEEgbWFsaWNpb3VzIENUb2tlbiBjb250cmFjdFxuICAgICAgICAgICogRS5nLiBcIkNUb2tlbiBEZXBsb3kgQ0V2aWwgY0VWTCBcXFwiQ29tcG91bmQgRVZMXFxcIiAoRXJjMjAgWlJYIEFkZHJlc3MpIChDb21wdHJvbGxlciBBZGRyZXNzKSAoSW50ZXJlc3RSYXRlTW9kZWwgQWRkcmVzcykgMS4wIDhcIlxuICAgICAgYCxcbiAgICAgIFwiQ0V2aWxcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcInN5bWJvbFwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcIm5hbWVcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJ1bmRlcmx5aW5nXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImludGVyZXN0UmF0ZU1vZGVsXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImluaXRpYWxFeGNoYW5nZVJhdGVcIiwgZ2V0RXhwTnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJkZWNpbWFsc1wiLCBnZXROdW1iZXJWKSxcbiAgICAgICAgbmV3IEFyZyhcImFkbWluXCIsIGdldEFkZHJlc3NWKVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge3N5bWJvbCwgbmFtZSwgdW5kZXJseWluZywgY29tcHRyb2xsZXIsIGludGVyZXN0UmF0ZU1vZGVsLCBpbml0aWFsRXhjaGFuZ2VSYXRlLCBkZWNpbWFscywgYWRtaW59KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ0V2aWxDb250cmFjdC5kZXBsb3k8Q1Rva2VuPih3b3JsZCwgZnJvbSwgW3VuZGVybHlpbmcudmFsLCBjb21wdHJvbGxlci52YWwsIGludGVyZXN0UmF0ZU1vZGVsLnZhbCwgaW5pdGlhbEV4Y2hhbmdlUmF0ZS52YWwsIG5hbWUudmFsLCBzeW1ib2wudmFsLCBkZWNpbWFscy52YWwsIGFkbWluLnZhbF0pLFxuICAgICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICAgIHN5bWJvbDogc3ltYm9sLnZhbCxcbiAgICAgICAgICBkZWNpbWFsczogZGVjaW1hbHMudG9OdW1iZXIoKSxcbiAgICAgICAgICB1bmRlcmx5aW5nOiB1bmRlcmx5aW5nLnZhbCxcbiAgICAgICAgICBjb250cmFjdDogJ0NFdmlsJyxcbiAgICAgICAgICBpbml0aWFsX2V4Y2hhbmdlX3JhdGVfbWFudGlzc2E6IGluaXRpYWxFeGNoYW5nZVJhdGUuZW5jb2RlKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICBhZG1pbjogYWRtaW4udmFsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHtzeW1ib2w6IFN0cmluZ1YsIG5hbWU6IFN0cmluZ1YsIGRlY2ltYWxzOiBOdW1iZXJWLCBhZG1pbjogQWRkcmVzc1YsIHVuZGVybHlpbmc6IEFkZHJlc3NWLCBjb21wdHJvbGxlcjogQWRkcmVzc1YsIGludGVyZXN0UmF0ZU1vZGVsOiBBZGRyZXNzViwgaW5pdGlhbEV4Y2hhbmdlUmF0ZTogTnVtYmVyVn0sIFRva2VuRGF0YT4oYFxuICAgICAgICAjIyMjIFN0YW5kYXJkXG5cbiAgICAgICAgKiBcInN5bWJvbDo8U3RyaW5nPiBuYW1lOjxTdHJpbmc+IHVuZGVybHlpbmc6PEFkZHJlc3M+IGNvbXB0cm9sbGVyOjxBZGRyZXNzPiBpbnRlcmVzdFJhdGVNb2RlbDo8QWRkcmVzcz4gaW5pdGlhbEV4Y2hhbmdlUmF0ZTo8TnVtYmVyPiBkZWNpbWFsczo8TnVtYmVyPiBhZG1pbjogPEFkZHJlc3M+XCIgLSBBIG9mZmljaWFsIENUb2tlbiBjb250cmFjdFxuICAgICAgICAgICogRS5nLiBcIkNUb2tlbiBEZXBsb3kgU3RhbmRhcmQgY1pSWCBcXFwiQ29tcG91bmQgWlJYXFxcIiAoRXJjMjAgWlJYIEFkZHJlc3MpIChDb21wdHJvbGxlciBBZGRyZXNzKSAoSW50ZXJlc3RSYXRlTW9kZWwgQWRkcmVzcykgMS4wIDhcIlxuICAgICAgYCxcbiAgICAgIFwiU3RhbmRhcmRcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcInN5bWJvbFwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcIm5hbWVcIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJ1bmRlcmx5aW5nXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImNvbXB0cm9sbGVyXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImludGVyZXN0UmF0ZU1vZGVsXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImluaXRpYWxFeGNoYW5nZVJhdGVcIiwgZ2V0RXhwTnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJkZWNpbWFsc1wiLCBnZXROdW1iZXJWKSxcbiAgICAgICAgbmV3IEFyZyhcImFkbWluXCIsIGdldEFkZHJlc3NWKVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge3N5bWJvbCwgbmFtZSwgdW5kZXJseWluZywgY29tcHRyb2xsZXIsIGludGVyZXN0UmF0ZU1vZGVsLCBpbml0aWFsRXhjaGFuZ2VSYXRlLCBkZWNpbWFscywgYWRtaW59KSA9PiB7XG4gICAgICAgIC8vIE5vdGU6IHdlJ3JlIGdvaW5nIHRvIHVzZSB0aGUgc2NlbmFyaW8gY29udHJhY3QgYXMgdGhlIHN0YW5kYXJkIGRlcGxveW1lbnQgb24gbG9jYWwgbmV0d29ya3NcbiAgICAgICAgaWYgKHdvcmxkLmlzTG9jYWxOZXR3b3JrKCkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ0VyYzIwU2NlbmFyaW9Db250cmFjdC5kZXBsb3k8Q1Rva2VuPih3b3JsZCwgZnJvbSwgW3VuZGVybHlpbmcudmFsLCBjb21wdHJvbGxlci52YWwsIGludGVyZXN0UmF0ZU1vZGVsLnZhbCwgaW5pdGlhbEV4Y2hhbmdlUmF0ZS52YWwsIG5hbWUudmFsLCBzeW1ib2wudmFsLCBkZWNpbWFscy52YWwsIGFkbWluLnZhbF0pLFxuICAgICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgICBkZWNpbWFsczogZGVjaW1hbHMudG9OdW1iZXIoKSxcbiAgICAgICAgICAgIHVuZGVybHlpbmc6IHVuZGVybHlpbmcudmFsLFxuICAgICAgICAgICAgY29udHJhY3Q6ICdDRXJjMjBTY2VuYXJpbycsXG4gICAgICAgICAgICBpbml0aWFsX2V4Y2hhbmdlX3JhdGVfbWFudGlzc2E6IGluaXRpYWxFeGNoYW5nZVJhdGUuZW5jb2RlKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGFkbWluOiBhZG1pbi52YWxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBDRXJjMjBDb250cmFjdC5kZXBsb3k8Q1Rva2VuPih3b3JsZCwgZnJvbSwgW3VuZGVybHlpbmcudmFsLCBjb21wdHJvbGxlci52YWwsIGludGVyZXN0UmF0ZU1vZGVsLnZhbCwgaW5pdGlhbEV4Y2hhbmdlUmF0ZS52YWwsIG5hbWUudmFsLCBzeW1ib2wudmFsLCBkZWNpbWFscy52YWwsIGFkbWluLnZhbF0pLFxuICAgICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgICBzeW1ib2w6IHN5bWJvbC52YWwsXG4gICAgICAgICAgICBkZWNpbWFsczogZGVjaW1hbHMudG9OdW1iZXIoKSxcbiAgICAgICAgICAgIHVuZGVybHlpbmc6IHVuZGVybHlpbmcudmFsLFxuICAgICAgICAgICAgY29udHJhY3Q6ICdDRXJjMjBJbW11dGFibGUnLFxuICAgICAgICAgICAgaW5pdGlhbF9leGNoYW5nZV9yYXRlX21hbnRpc3NhOiBpbml0aWFsRXhjaGFuZ2VSYXRlLmVuY29kZSgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBhZG1pbjogYWRtaW4udmFsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtjYXRjaGFsbDogdHJ1ZX1cbiAgICApXG4gIF07XG5cbiAgbGV0IHRva2VuRGF0YSA9IGF3YWl0IGdldEZldGNoZXJWYWx1ZTxhbnksIFRva2VuRGF0YT4oXCJEZXBsb3lDVG9rZW5cIiwgZmV0Y2hlcnMsIHdvcmxkLCBwYXJhbXMpO1xuICBsZXQgaW52b2thdGlvbiA9IHRva2VuRGF0YS5pbnZva2F0aW9uO1xuICBkZWxldGUgdG9rZW5EYXRhLmludm9rYXRpb247XG5cbiAgaWYgKGludm9rYXRpb24uZXJyb3IpIHtcbiAgICB0aHJvdyBpbnZva2F0aW9uLmVycm9yO1xuICB9XG5cbiAgY29uc3QgY1Rva2VuID0gaW52b2thdGlvbi52YWx1ZSE7XG4gIHRva2VuRGF0YS5hZGRyZXNzID0gY1Rva2VuLl9hZGRyZXNzO1xuXG4gIHdvcmxkID0gYXdhaXQgc3RvcmVBbmRTYXZlQ29udHJhY3QoXG4gICAgd29ybGQsXG4gICAgY1Rva2VuLFxuICAgIHRva2VuRGF0YS5zeW1ib2wsXG4gICAgaW52b2thdGlvbixcbiAgICBbXG4gICAgICB7IGluZGV4OiBbJ2NUb2tlbnMnLCB0b2tlbkRhdGEuc3ltYm9sXSwgZGF0YTogdG9rZW5EYXRhIH0sXG4gICAgICB7IGluZGV4OiBbJ1Rva2VucycsIHRva2VuRGF0YS5zeW1ib2xdLCBkYXRhOiB0b2tlbkRhdGEgfVxuICAgIF1cbiAgKTtcblxuICByZXR1cm4ge3dvcmxkLCBjVG9rZW4sIHRva2VuRGF0YX07XG59XG4iXX0=
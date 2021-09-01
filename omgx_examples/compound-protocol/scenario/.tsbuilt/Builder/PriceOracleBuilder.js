"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPriceOracle = exports.buildPriceOracle = void 0;
const CoreValue_1 = require("../CoreValue");
const Command_1 = require("../Command");
const Networks_1 = require("../Networks");
const Contract_1 = require("../Contract");
const FixedPriceOracle = Contract_1.getTestContract('FixedPriceOracle');
const SimplePriceOracle = Contract_1.getContract('SimplePriceOracle');
const AnchorPriceOracle = Contract_1.getContract('AnchorPriceOracle');
const NotPriceOracle = Contract_1.getTestContract('NotPriceOracle');
const PriceOracleInterface = Contract_1.getTestContract('PriceOracle');
async function buildPriceOracle(world, from, event) {
    const fetchers = [
        new Command_1.Fetcher(`
        #### Fixed

        * "Fixed price:<Exp>" - Fixed price
          * E.g. "PriceOracle Deploy (Fixed 20.0)"
      `, "Fixed", [
            new Command_1.Arg("price", CoreValue_1.getExpNumberV),
        ], async (world, { price }) => {
            return {
                invokation: await FixedPriceOracle.deploy(world, from, [price.val]),
                description: "Fixed Price Oracle"
            };
        }),
        new Command_1.Fetcher(`
        #### Simple

        * "Simple" - The a simple price oracle that has a harness price setter
          * E.g. "PriceOracle Deploy Simple"
      `, "Simple", [], async (world, {}) => {
            return {
                invokation: await SimplePriceOracle.deploy(world, from, []),
                description: "Simple Price Oracle"
            };
        }),
        new Command_1.Fetcher(`
        #### Anchor

        * "Anchor <poster:Address>" - The anchor price oracle that caps price movements to anchors
          * E.g. "PriceOracle Deploy Anchor 0x..."
      `, "Anchor", [
            new Command_1.Arg("poster", CoreValue_1.getAddressV)
        ], async (world, { poster }) => {
            return {
                invokation: await AnchorPriceOracle.deploy(world, from, [poster.val]),
                description: "Anchor Price Oracle",
                poster: poster.val
            };
        }),
        new Command_1.Fetcher(`
        #### NotPriceOracle

        * "NotPriceOracle" - Not actually a price oracle
          * E.g. "PriceOracle Deploy NotPriceOracle"
      `, "NotPriceOracle", [], async (world, {}) => {
            return {
                invokation: await NotPriceOracle.deploy(world, from, []),
                description: "Not a Price Oracle"
            };
        })
    ];
    let priceOracleData = await Command_1.getFetcherValue("DeployPriceOracle", fetchers, world, event);
    let invokation = priceOracleData.invokation;
    delete priceOracleData.invokation;
    if (invokation.error) {
        throw invokation.error;
    }
    const priceOracle = invokation.value;
    priceOracleData.address = priceOracle._address;
    world = await Networks_1.storeAndSaveContract(world, priceOracle, 'PriceOracle', invokation, [
        { index: ['PriceOracle'], data: priceOracleData }
    ]);
    return { world, priceOracle, priceOracleData };
}
exports.buildPriceOracle = buildPriceOracle;
async function setPriceOracle(world, event) {
    const fetchers = [
        new Command_1.Fetcher(`
        #### Standard

        * "Standard" - The standard price oracle
          * E.g. "PriceOracle Set Standard \"0x...\" \"Standard Price Oracle\""
      `, "Standard", [
            new Command_1.Arg("address", CoreValue_1.getAddressV),
            new Command_1.Arg("description", CoreValue_1.getStringV),
        ], async (world, { address, description }) => {
            return {
                contract: await PriceOracleInterface.at(world, address.val),
                description: description.val
            };
        })
    ];
    let priceOracleData = await Command_1.getFetcherValue("SetPriceOracle", fetchers, world, event);
    let priceOracle = priceOracleData.contract;
    delete priceOracleData.contract;
    priceOracleData.address = priceOracle._address;
    world = await Networks_1.storeAndSaveContract(world, priceOracle, 'PriceOracle', null, [
        { index: ['PriceOracle'], data: priceOracleData }
    ]);
    return { world, priceOracle, priceOracleData };
}
exports.setPriceOracle = setPriceOracle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpY2VPcmFjbGVCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0J1aWxkZXIvUHJpY2VPcmFjbGVCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLDRDQUlzQjtBQVF0Qix3Q0FBeUQ7QUFDekQsMENBQWlEO0FBQ2pELDBDQUF5RDtBQUV6RCxNQUFNLGdCQUFnQixHQUFHLDBCQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM3RCxNQUFNLGlCQUFpQixHQUFHLHNCQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUMzRCxNQUFNLGlCQUFpQixHQUFHLHNCQUFXLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUMzRCxNQUFNLGNBQWMsR0FBRywwQkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDekQsTUFBTSxvQkFBb0IsR0FBRywwQkFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBU3JELEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxLQUFZLEVBQUUsSUFBWSxFQUFFLEtBQVk7SUFDN0UsTUFBTSxRQUFRLEdBQUc7UUFDZixJQUFJLGlCQUFPLENBQW9DOzs7OztPQUs1QyxFQUNELE9BQU8sRUFDUDtZQUNFLElBQUksYUFBRyxDQUFDLE9BQU8sRUFBRSx5QkFBYSxDQUFDO1NBQ2hDLEVBQ0QsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBQyxFQUFFLEVBQUU7WUFDdkIsT0FBTztnQkFDTCxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQWMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEYsV0FBVyxFQUFFLG9CQUFvQjthQUNsQyxDQUFDO1FBQ0osQ0FBQyxDQUNGO1FBQ0QsSUFBSSxpQkFBTyxDQUFzQjs7Ozs7T0FLOUIsRUFDRCxRQUFRLEVBQ1IsRUFBRSxFQUNGLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFF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LENBQUM7SUFFaEMsZUFBZSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBRS9DLEtBQUssR0FBRyxNQUFNLCtCQUFvQixDQUNoQyxLQUFLLEVBQ0wsV0FBVyxFQUNYLGFBQWEsRUFDYixJQUFJLEVBQ0o7UUFDRSxFQUFFLEtBQUssRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUU7S0FDbEQsQ0FDRixDQUFDO0lBRUYsT0FBTyxFQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFDLENBQUM7QUFDL0MsQ0FBQztBQXZDRCx3Q0F1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50fSBmcm9tICcuLi9FdmVudCc7XG5pbXBvcnQge2FkZEFjdGlvbiwgV29ybGR9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7UHJpY2VPcmFjbGV9IGZyb20gJy4uL0NvbnRyYWN0L1ByaWNlT3JhY2xlJztcbmltcG9ydCB7SW52b2thdGlvbiwgaW52b2tlfSBmcm9tICcuLi9JbnZva2F0aW9uJztcbmltcG9ydCB7XG4gIGdldEFkZHJlc3NWLFxuICBnZXRFeHBOdW1iZXJWLFxuICBnZXRTdHJpbmdWXG59IGZyb20gJy4uL0NvcmVWYWx1ZSc7XG5pbXBvcnQge1xuICBBZGRyZXNzVixcbiAgRXZlbnRWLFxuICBOb3RoaW5nVixcbiAgTnVtYmVyVixcbiAgU3RyaW5nVlxufSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQge0FyZywgRmV0Y2hlciwgZ2V0RmV0Y2hlclZhbHVlfSBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7c3RvcmVBbmRTYXZlQ29udHJhY3R9IGZyb20gJy4uL05ldHdvcmtzJztcbmltcG9ydCB7Z2V0Q29udHJhY3QsIGdldFRlc3RDb250cmFjdH0gZnJvbSAnLi4vQ29udHJhY3QnO1xuXG5jb25zdCBGaXhlZFByaWNlT3JhY2xlID0gZ2V0VGVzdENvbnRyYWN0KCdGaXhlZFByaWNlT3JhY2xlJyk7XG5jb25zdCBTaW1wbGVQcmljZU9yYWNsZSA9IGdldENvbnRyYWN0KCdTaW1wbGVQcmljZU9yYWNsZScpO1xuY29uc3QgQW5jaG9yUHJpY2VPcmFjbGUgPSBnZXRDb250cmFjdCgnQW5jaG9yUHJpY2VPcmFjbGUnKTtcbmNvbnN0IE5vdFByaWNlT3JhY2xlID0gZ2V0VGVzdENvbnRyYWN0KCdOb3RQcmljZU9yYWNsZScpO1xuY29uc3QgUHJpY2VPcmFjbGVJbnRlcmZhY2UgPSBnZXRUZXN0Q29udHJhY3QoJ1ByaWNlT3JhY2xlJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJpY2VPcmFjbGVEYXRhIHtcbiAgaW52b2thdGlvbj86IEludm9rYXRpb248UHJpY2VPcmFjbGU+LFxuICBjb250cmFjdD86IFByaWNlT3JhY2xlLFxuICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICBhZGRyZXNzPzogc3RyaW5nXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZFByaWNlT3JhY2xlKHdvcmxkOiBXb3JsZCwgZnJvbTogc3RyaW5nLCBldmVudDogRXZlbnQpOiBQcm9taXNlPHt3b3JsZDogV29ybGQsIHByaWNlT3JhY2xlOiBQcmljZU9yYWNsZSwgcHJpY2VPcmFjbGVEYXRhOiBQcmljZU9yYWNsZURhdGF9PiB7XG4gIGNvbnN0IGZldGNoZXJzID0gW1xuICAgIG5ldyBGZXRjaGVyPHtwcmljZTogTnVtYmVyVn0sIFByaWNlT3JhY2xlRGF0YT4oYFxuICAgICAgICAjIyMjIEZpeGVkXG5cbiAgICAgICAgKiBcIkZpeGVkIHByaWNlOjxFeHA+XCIgLSBGaXhlZCBwcmljZVxuICAgICAgICAgICogRS5nLiBcIlByaWNlT3JhY2xlIERlcGxveSAoRml4ZWQgMjAuMClcIlxuICAgICAgYCxcbiAgICAgIFwiRml4ZWRcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcInByaWNlXCIsIGdldEV4cE51bWJlclYpLFxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge3ByaWNlfSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IEZpeGVkUHJpY2VPcmFjbGUuZGVwbG95PFByaWNlT3JhY2xlPih3b3JsZCwgZnJvbSwgW3ByaWNlLnZhbF0pLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkZpeGVkIFByaWNlIE9yYWNsZVwiXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7fSwgUHJpY2VPcmFjbGVEYXRhPihgXG4gICAgICAgICMjIyMgU2ltcGxlXG5cbiAgICAgICAgKiBcIlNpbXBsZVwiIC0gVGhlIGEgc2ltcGxlIHByaWNlIG9yYWNsZSB0aGF0IGhhcyBhIGhhcm5lc3MgcHJpY2Ugc2V0dGVyXG4gICAgICAgICAgKiBFLmcuIFwiUHJpY2VPcmFjbGUgRGVwbG95IFNpbXBsZVwiXG4gICAgICBgLFxuICAgICAgXCJTaW1wbGVcIixcbiAgICAgIFtdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7fSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IFNpbXBsZVByaWNlT3JhY2xlLmRlcGxveTxQcmljZU9yYWNsZT4od29ybGQsIGZyb20sIFtdKSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJTaW1wbGUgUHJpY2UgT3JhY2xlXCJcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHtwb3N0ZXI6IEFkZHJlc3NWfSwgUHJpY2VPcmFjbGVEYXRhPihgXG4gICAgICAgICMjIyMgQW5jaG9yXG5cbiAgICAgICAgKiBcIkFuY2hvciA8cG9zdGVyOkFkZHJlc3M+XCIgLSBUaGUgYW5jaG9yIHByaWNlIG9yYWNsZSB0aGF0IGNhcHMgcHJpY2UgbW92ZW1lbnRzIHRvIGFuY2hvcnNcbiAgICAgICAgICAqIEUuZy4gXCJQcmljZU9yYWNsZSBEZXBsb3kgQW5jaG9yIDB4Li4uXCJcbiAgICAgIGAsXG4gICAgICBcIkFuY2hvclwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwicG9zdGVyXCIsIGdldEFkZHJlc3NWKVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge3Bvc3Rlcn0pID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBBbmNob3JQcmljZU9yYWNsZS5kZXBsb3k8UHJpY2VPcmFjbGU+KHdvcmxkLCBmcm9tLCBbcG9zdGVyLnZhbF0pLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkFuY2hvciBQcmljZSBPcmFjbGVcIixcbiAgICAgICAgICBwb3N0ZXI6IHBvc3Rlci52YWxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuICAgIG5ldyBGZXRjaGVyPHt9LCBQcmljZU9yYWNsZURhdGE+KGBcbiAgICAgICAgIyMjIyBOb3RQcmljZU9yYWNsZVxuXG4gICAgICAgICogXCJOb3RQcmljZU9yYWNsZVwiIC0gTm90IGFjdHVhbGx5IGEgcHJpY2Ugb3JhY2xlXG4gICAgICAgICAgKiBFLmcuIFwiUHJpY2VPcmFjbGUgRGVwbG95IE5vdFByaWNlT3JhY2xlXCJcbiAgICAgIGAsXG4gICAgICBcIk5vdFByaWNlT3JhY2xlXCIsXG4gICAgICBbXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge30pID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBOb3RQcmljZU9yYWNsZS5kZXBsb3k8UHJpY2VPcmFjbGU+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiTm90IGEgUHJpY2UgT3JhY2xlXCJcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApXG4gIF07XG5cbiAgbGV0IHByaWNlT3JhY2xlRGF0YSA9IGF3YWl0IGdldEZldGNoZXJWYWx1ZTxhbnksIFByaWNlT3JhY2xlRGF0YT4oXCJEZXBsb3lQcmljZU9yYWNsZVwiLCBmZXRjaGVycywgd29ybGQsIGV2ZW50KTtcbiAgbGV0IGludm9rYXRpb24gPSBwcmljZU9yYWNsZURhdGEuaW52b2thdGlvbiE7XG4gIGRlbGV0ZSBwcmljZU9yYWNsZURhdGEuaW52b2thdGlvbjtcblxuICBpZiAoaW52b2thdGlvbi5lcnJvcikge1xuICAgIHRocm93IGludm9rYXRpb24uZXJyb3I7XG4gIH1cbiAgY29uc3QgcHJpY2VPcmFjbGUgPSBpbnZva2F0aW9uLnZhbHVlITtcbiAgcHJpY2VPcmFjbGVEYXRhLmFkZHJlc3MgPSBwcmljZU9yYWNsZS5fYWRkcmVzcztcblxuICB3b3JsZCA9IGF3YWl0IHN0b3JlQW5kU2F2ZUNvbnRyYWN0KFxuICAgIHdvcmxkLFxuICAgIHByaWNlT3JhY2xlLFxuICAgICdQcmljZU9yYWNsZScsXG4gICAgaW52b2thdGlvbixcbiAgICBbXG4gICAgICB7IGluZGV4OiBbJ1ByaWNlT3JhY2xlJ10sIGRhdGE6IHByaWNlT3JhY2xlRGF0YSB9XG4gICAgXVxuICApO1xuXG4gIHJldHVybiB7d29ybGQsIHByaWNlT3JhY2xlLCBwcmljZU9yYWNsZURhdGF9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UHJpY2VPcmFjbGUod29ybGQ6IFdvcmxkLCBldmVudDogRXZlbnQpOiBQcm9taXNlPHt3b3JsZDogV29ybGQsIHByaWNlT3JhY2xlOiBQcmljZU9yYWNsZSwgcHJpY2VPcmFjbGVEYXRhOiBQcmljZU9yYWNsZURhdGF9PiB7XG4gIGNvbnN0IGZldGNoZXJzID0gW1xuICAgIG5ldyBGZXRjaGVyPHthZGRyZXNzOiBBZGRyZXNzViwgZGVzY3JpcHRpb246IFN0cmluZ1Z9LCBQcmljZU9yYWNsZURhdGE+KGBcbiAgICAgICAgIyMjIyBTdGFuZGFyZFxuXG4gICAgICAgICogXCJTdGFuZGFyZFwiIC0gVGhlIHN0YW5kYXJkIHByaWNlIG9yYWNsZVxuICAgICAgICAgICogRS5nLiBcIlByaWNlT3JhY2xlIFNldCBTdGFuZGFyZCBcXFwiMHguLi5cXFwiIFxcXCJTdGFuZGFyZCBQcmljZSBPcmFjbGVcXFwiXCJcbiAgICAgIGAsXG4gICAgICBcIlN0YW5kYXJkXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJhZGRyZXNzXCIsIGdldEFkZHJlc3NWKSxcbiAgICAgICAgbmV3IEFyZyhcImRlc2NyaXB0aW9uXCIsIGdldFN0cmluZ1YpLFxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwge2FkZHJlc3MsIGRlc2NyaXB0aW9ufSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvbnRyYWN0OiBhd2FpdCBQcmljZU9yYWNsZUludGVyZmFjZS5hdDxQcmljZU9yYWNsZT4od29ybGQsIGFkZHJlc3MudmFsKSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24udmFsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgKVxuICBdO1xuXG4gIGxldCBwcmljZU9yYWNsZURhdGEgPSBhd2FpdCBnZXRGZXRjaGVyVmFsdWU8YW55LCBQcmljZU9yYWNsZURhdGE+KFwiU2V0UHJpY2VPcmFjbGVcIiwgZmV0Y2hlcnMsIHdvcmxkLCBldmVudCk7XG4gIGxldCBwcmljZU9yYWNsZSA9IHByaWNlT3JhY2xlRGF0YS5jb250cmFjdCE7XG4gIGRlbGV0ZSBwcmljZU9yYWNsZURhdGEuY29udHJhY3Q7XG5cbiAgcHJpY2VPcmFjbGVEYXRhLmFkZHJlc3MgPSBwcmljZU9yYWNsZS5fYWRkcmVzcztcblxuICB3b3JsZCA9IGF3YWl0IHN0b3JlQW5kU2F2ZUNvbnRyYWN0KFxuICAgIHdvcmxkLFxuICAgIHByaWNlT3JhY2xlLFxuICAgICdQcmljZU9yYWNsZScsXG4gICAgbnVsbCxcbiAgICBbXG4gICAgICB7IGluZGV4OiBbJ1ByaWNlT3JhY2xlJ10sIGRhdGE6IHByaWNlT3JhY2xlRGF0YSB9XG4gICAgXVxuICApO1xuXG4gIHJldHVybiB7d29ybGQsIHByaWNlT3JhY2xlLCBwcmljZU9yYWNsZURhdGF9O1xufVxuIl19
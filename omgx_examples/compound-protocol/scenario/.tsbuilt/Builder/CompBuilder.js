"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComp = void 0;
const CoreValue_1 = require("../CoreValue");
const Command_1 = require("../Command");
const Networks_1 = require("../Networks");
const Contract_1 = require("../Contract");
const CompContract = Contract_1.getContract('Comp');
const CompScenarioContract = Contract_1.getContract('CompScenario');
async function buildComp(world, from, params) {
    const fetchers = [
        new Command_1.Fetcher(`
      #### Scenario

      * "Comp Deploy Scenario account:<Address>" - Deploys Scenario Comp Token
        * E.g. "Comp Deploy Scenario Geoff"
    `, 'Scenario', [
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { account }) => {
            return {
                invokation: await CompScenarioContract.deploy(world, from, [account.val]),
                contract: 'CompScenario',
                symbol: 'COMP',
                name: 'Compound Governance Token',
                decimals: 18
            };
        }),
        new Command_1.Fetcher(`
      #### Comp

      * "Comp Deploy account:<Address>" - Deploys Comp Token
        * E.g. "Comp Deploy Geoff"
    `, 'Comp', [
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { account }) => {
            if (world.isLocalNetwork()) {
                return {
                    invokation: await CompScenarioContract.deploy(world, from, [account.val]),
                    contract: 'CompScenario',
                    symbol: 'COMP',
                    name: 'Compound Governance Token',
                    decimals: 18
                };
            }
            else {
                return {
                    invokation: await CompContract.deploy(world, from, [account.val]),
                    contract: 'Comp',
                    symbol: 'COMP',
                    name: 'Compound Governance Token',
                    decimals: 18
                };
            }
        }, { catchall: true })
    ];
    let tokenData = await Command_1.getFetcherValue("DeployComp", fetchers, world, params);
    let invokation = tokenData.invokation;
    delete tokenData.invokation;
    if (invokation.error) {
        throw invokation.error;
    }
    const comp = invokation.value;
    tokenData.address = comp._address;
    world = await Networks_1.storeAndSaveContract(world, comp, 'Comp', invokation, [
        { index: ['Comp'], data: tokenData },
        { index: ['Tokens', tokenData.symbol], data: tokenData }
    ]);
    tokenData.invokation = invokation;
    return { world, comp, tokenData };
}
exports.buildComp = buildComp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcEJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvQnVpbGRlci9Db21wQnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSw0Q0FBMkM7QUFFM0Msd0NBQTJEO0FBQzNELDBDQUFtRDtBQUNuRCwwQ0FBMEM7QUFFMUMsTUFBTSxZQUFZLEdBQUcsc0JBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QyxNQUFNLG9CQUFvQixHQUFHLHNCQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7QUFXbEQsS0FBSyxVQUFVLFNBQVMsQ0FDN0IsS0FBWSxFQUNaLElBQVksRUFDWixNQUFhO0lBRWIsTUFBTSxRQUFRLEdBQUc7UUFDZixJQUFJLGlCQUFPLENBQ1Q7Ozs7O0tBS0QsRUFDQyxVQUFVLEVBQ1Y7WUFDRSxJQUFJLGFBQUcsQ0FBQyxTQUFTLEVBQUUsdUJBQVcsQ0FBQztTQUNoQyxFQUNELEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO1lBQzNCLE9BQU87Z0JBQ0wsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUMsTUFBTSxDQUFlLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZGLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixNQUFNLEVBQUUsTUFBTTtnQkFDZCxJQUFJLEVBQUUsMkJBQTJCO2dCQUNqQyxRQUFRLEVBQUUsRUFBRTthQUNiLENBQUM7UUFDSixDQUFDLENBQ0Y7UUFFRCxJQUFJLGlCQUFPLENBQ1Q7Ozs7O0tBS0QsRUFDQyxNQUFNLEVBQ047WUFDRSxJQUFJLGFBQUcsQ0FBQyxTQUFTLEVBQUUsdUJBQVcsQ0FBQztTQUNoQyxFQUNELEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO1lBQzNCLElBQUksS0FBSyxDQUFDLGNBQWMsRUFBRSxFQUFFO2dCQUMxQixPQUFPO29CQUNMLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDLE1BQU0sQ0FBZSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN2RixRQUFRLEVBQUUsY0FBYztvQkFDeEIsTUFBTSxFQUFFLE1BQU07b0JBQ2QsSUFBSSxFQUFFLDJCQUEyQjtvQkFDakMsUUFBUSxFQUFFLEVBQUU7aUJBQ2IsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLE9BQU87b0JBQ0wsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBTyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN2RSxRQUFRLEVBQUUsTUFBTTtvQkFDaEIsTUFBTSxFQUFFLE1BQU07b0JBQ2QsSUFBSSxFQUFFLDJCQUEyQjtvQkFDakMsUUFBUSxFQUFFLEVBQUU7aUJBQ2IsQ0FBQzthQUNIO1FBQ0gsQ0FBQyxFQUNELEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUNuQjtLQUNGLENBQUM7SUFFRixJQUFJLFNBQVMsR0FBRyxNQUFNLHlCQUFlLENBQWlCLFlBQVksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzdGLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7SUFDdEMsT0FBTyxTQUFTLENBQUMsVUFBVSxDQUFDO0lBRTVCLElBQUksVUFBVSxDQUFDLEtBQUssRUFBRTtRQUNwQixNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUM7S0FDeEI7SUFFRCxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsS0FBTSxDQUFDO0lBQy9CLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUVsQyxLQUFLLEdBQUcsTUFBTSwrQkFBb0IsQ0FDaEMsS0FBSyxFQUNMLElBQUksRUFDSixNQUFNLEVBQ04sVUFBVSxFQUNWO1FBQ0UsRUFBRSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO1FBQ3BDLEVBQUUsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0tBQ3pELENBQ0YsQ0FBQztJQUVGLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBRWxDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUF2RkQsOEJBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnQgfSBmcm9tICcuLi9FdmVudCc7XG5pbXBvcnQgeyBXb3JsZCwgYWRkQWN0aW9uIH0gZnJvbSAnLi4vV29ybGQnO1xuaW1wb3J0IHsgQ29tcCwgQ29tcFNjZW5hcmlvIH0gZnJvbSAnLi4vQ29udHJhY3QvQ29tcCc7XG5pbXBvcnQgeyBJbnZva2F0aW9uIH0gZnJvbSAnLi4vSW52b2thdGlvbic7XG5pbXBvcnQgeyBnZXRBZGRyZXNzViB9IGZyb20gJy4uL0NvcmVWYWx1ZSc7XG5pbXBvcnQgeyBTdHJpbmdWLCBBZGRyZXNzViB9IGZyb20gJy4uL1ZhbHVlJztcbmltcG9ydCB7IEFyZywgRmV0Y2hlciwgZ2V0RmV0Y2hlclZhbHVlIH0gZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgeyBzdG9yZUFuZFNhdmVDb250cmFjdCB9IGZyb20gJy4uL05ldHdvcmtzJztcbmltcG9ydCB7IGdldENvbnRyYWN0IH0gZnJvbSAnLi4vQ29udHJhY3QnO1xuXG5jb25zdCBDb21wQ29udHJhY3QgPSBnZXRDb250cmFjdCgnQ29tcCcpO1xuY29uc3QgQ29tcFNjZW5hcmlvQ29udHJhY3QgPSBnZXRDb250cmFjdCgnQ29tcFNjZW5hcmlvJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9rZW5EYXRhIHtcbiAgaW52b2thdGlvbjogSW52b2thdGlvbjxDb21wPjtcbiAgY29udHJhY3Q6IHN0cmluZztcbiAgYWRkcmVzcz86IHN0cmluZztcbiAgc3ltYm9sOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgZGVjaW1hbHM/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZENvbXAoXG4gIHdvcmxkOiBXb3JsZCxcbiAgZnJvbTogc3RyaW5nLFxuICBwYXJhbXM6IEV2ZW50XG4pOiBQcm9taXNlPHsgd29ybGQ6IFdvcmxkOyBjb21wOiBDb21wOyB0b2tlbkRhdGE6IFRva2VuRGF0YSB9PiB7XG4gIGNvbnN0IGZldGNoZXJzID0gW1xuICAgIG5ldyBGZXRjaGVyPHsgYWNjb3VudDogQWRkcmVzc1YgfSwgVG9rZW5EYXRhPihcbiAgICAgIGBcbiAgICAgICMjIyMgU2NlbmFyaW9cblxuICAgICAgKiBcIkNvbXAgRGVwbG95IFNjZW5hcmlvIGFjY291bnQ6PEFkZHJlc3M+XCIgLSBEZXBsb3lzIFNjZW5hcmlvIENvbXAgVG9rZW5cbiAgICAgICAgKiBFLmcuIFwiQ29tcCBEZXBsb3kgU2NlbmFyaW8gR2VvZmZcIlxuICAgIGAsXG4gICAgICAnU2NlbmFyaW8nLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiYWNjb3VudFwiLCBnZXRBZGRyZXNzViksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IGFjY291bnQgfSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXBTY2VuYXJpb0NvbnRyYWN0LmRlcGxveTxDb21wU2NlbmFyaW8+KHdvcmxkLCBmcm9tLCBbYWNjb3VudC52YWxdKSxcbiAgICAgICAgICBjb250cmFjdDogJ0NvbXBTY2VuYXJpbycsXG4gICAgICAgICAgc3ltYm9sOiAnQ09NUCcsXG4gICAgICAgICAgbmFtZTogJ0NvbXBvdW5kIEdvdmVybmFuY2UgVG9rZW4nLFxuICAgICAgICAgIGRlY2ltYWxzOiAxOFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7IGFjY291bnQ6IEFkZHJlc3NWIH0sIFRva2VuRGF0YT4oXG4gICAgICBgXG4gICAgICAjIyMjIENvbXBcblxuICAgICAgKiBcIkNvbXAgRGVwbG95IGFjY291bnQ6PEFkZHJlc3M+XCIgLSBEZXBsb3lzIENvbXAgVG9rZW5cbiAgICAgICAgKiBFLmcuIFwiQ29tcCBEZXBsb3kgR2VvZmZcIlxuICAgIGAsXG4gICAgICAnQ29tcCcsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJhY2NvdW50XCIsIGdldEFkZHJlc3NWKSxcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgYWNjb3VudCB9KSA9PiB7XG4gICAgICAgIGlmICh3b3JsZC5pc0xvY2FsTmV0d29yaygpKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXBTY2VuYXJpb0NvbnRyYWN0LmRlcGxveTxDb21wU2NlbmFyaW8+KHdvcmxkLCBmcm9tLCBbYWNjb3VudC52YWxdKSxcbiAgICAgICAgICAgIGNvbnRyYWN0OiAnQ29tcFNjZW5hcmlvJyxcbiAgICAgICAgICAgIHN5bWJvbDogJ0NPTVAnLFxuICAgICAgICAgICAgbmFtZTogJ0NvbXBvdW5kIEdvdmVybmFuY2UgVG9rZW4nLFxuICAgICAgICAgICAgZGVjaW1hbHM6IDE4XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcENvbnRyYWN0LmRlcGxveTxDb21wPih3b3JsZCwgZnJvbSwgW2FjY291bnQudmFsXSksXG4gICAgICAgICAgICBjb250cmFjdDogJ0NvbXAnLFxuICAgICAgICAgICAgc3ltYm9sOiAnQ09NUCcsXG4gICAgICAgICAgICBuYW1lOiAnQ29tcG91bmQgR292ZXJuYW5jZSBUb2tlbicsXG4gICAgICAgICAgICBkZWNpbWFsczogMThcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeyBjYXRjaGFsbDogdHJ1ZSB9XG4gICAgKVxuICBdO1xuXG4gIGxldCB0b2tlbkRhdGEgPSBhd2FpdCBnZXRGZXRjaGVyVmFsdWU8YW55LCBUb2tlbkRhdGE+KFwiRGVwbG95Q29tcFwiLCBmZXRjaGVycywgd29ybGQsIHBhcmFtcyk7XG4gIGxldCBpbnZva2F0aW9uID0gdG9rZW5EYXRhLmludm9rYXRpb247XG4gIGRlbGV0ZSB0b2tlbkRhdGEuaW52b2thdGlvbjtcblxuICBpZiAoaW52b2thdGlvbi5lcnJvcikge1xuICAgIHRocm93IGludm9rYXRpb24uZXJyb3I7XG4gIH1cblxuICBjb25zdCBjb21wID0gaW52b2thdGlvbi52YWx1ZSE7XG4gIHRva2VuRGF0YS5hZGRyZXNzID0gY29tcC5fYWRkcmVzcztcblxuICB3b3JsZCA9IGF3YWl0IHN0b3JlQW5kU2F2ZUNvbnRyYWN0KFxuICAgIHdvcmxkLFxuICAgIGNvbXAsXG4gICAgJ0NvbXAnLFxuICAgIGludm9rYXRpb24sXG4gICAgW1xuICAgICAgeyBpbmRleDogWydDb21wJ10sIGRhdGE6IHRva2VuRGF0YSB9LFxuICAgICAgeyBpbmRleDogWydUb2tlbnMnLCB0b2tlbkRhdGEuc3ltYm9sXSwgZGF0YTogdG9rZW5EYXRhIH1cbiAgICBdXG4gICk7XG5cbiAgdG9rZW5EYXRhLmludm9rYXRpb24gPSBpbnZva2F0aW9uO1xuXG4gIHJldHVybiB7IHdvcmxkLCBjb21wLCB0b2tlbkRhdGEgfTtcbn1cbiJdfQ==
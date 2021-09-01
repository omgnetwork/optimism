"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTimelock = void 0;
const CoreValue_1 = require("../CoreValue");
const Command_1 = require("../Command");
const Networks_1 = require("../Networks");
const Contract_1 = require("../Contract");
const TimelockContract = Contract_1.getContract('Timelock');
const TimelockScenarioContract = Contract_1.getTestContract('TimelockHarness');
const TimelockTestContract = Contract_1.getTestContract('TimelockTest');
async function buildTimelock(world, from, event) {
    const fetchers = [
        new Command_1.Fetcher(`
        #### Scenario

        * "Scenario admin:<Address> delay:<Number>" - The Timelock Scenario for local testing
          * E.g. "Timelock Deploy Scenario Geoff 604800"
      `, 'Scenario', [new Command_1.Arg('admin', CoreValue_1.getAddressV), new Command_1.Arg('delay', CoreValue_1.getNumberV)], async (world, { admin, delay }) => ({
            invokation: await TimelockScenarioContract.deploy(world, from, [admin.val, delay.val]),
            contract: 'TimelockScenario',
            description: 'Scenario Timelock',
            admin: admin.val,
            delay: delay.val
        })),
        new Command_1.Fetcher(`
        #### Standard

        * "Standard admin:<Address> delay:<Number>" - The standard Timelock contract
          * E.g. "Timelock Deploy Standard Geoff 604800"
      `, 'Standard', [new Command_1.Arg('admin', CoreValue_1.getAddressV), new Command_1.Arg('delay', CoreValue_1.getNumberV)], async (world, { admin, delay }) => ({
            invokation: await TimelockContract.deploy(world, from, [admin.val, delay.val]),
            contract: 'Timelock',
            description: 'Standard Timelock',
            admin: admin.val,
            delay: delay.val
        })),
        new Command_1.Fetcher(`
        #### Test

        * "Test admin:<Address> delay:<Number>" - The a standard Timelock contract with a lower minimum delay for testing
          * E.g. "Timelock Deploy Test Geoff 120"
      `, 'Test', [new Command_1.Arg('admin', CoreValue_1.getAddressV), new Command_1.Arg('delay', CoreValue_1.getNumberV)], async (world, { admin, delay }) => ({
            invokation: await TimelockTestContract.deploy(world, from, [admin.val, delay.val]),
            contract: 'Timelock',
            description: 'Test Timelock',
            admin: admin.val,
            delay: delay.val
        })),
        new Command_1.Fetcher(`
        #### Default

        * "name:<String>" - The standard Timelock contract
          * E.g. "Timelock Deploy Geoff 604800"
      `, 'Default', [new Command_1.Arg('admin', CoreValue_1.getAddressV), new Command_1.Arg('delay', CoreValue_1.getNumberV)], async (world, { admin, delay }) => {
            if (world.isLocalNetwork()) {
                // Note: we're going to use the scenario contract as the standard deployment on local networks
                return {
                    invokation: await TimelockScenarioContract.deploy(world, from, [admin.val, delay.val]),
                    contract: 'TimelockScenario',
                    description: 'Scenario Timelock',
                    admin: admin.val,
                    delay: delay.val
                };
            }
            else {
                return {
                    invokation: await TimelockContract.deploy(world, from, [admin.val, delay.val]),
                    contract: 'Timelock',
                    description: 'Standard Timelock',
                    admin: admin.val,
                    delay: delay.val
                };
            }
        }, { catchall: true })
    ];
    const timelockData = await Command_1.getFetcherValue('DeployTimelock', fetchers, world, event);
    const invokation = timelockData.invokation;
    delete timelockData.invokation;
    if (invokation.error) {
        throw invokation.error;
    }
    const timelock = invokation.value;
    timelockData.address = timelock._address;
    world = await Networks_1.storeAndSaveContract(world, timelock, 'Timelock', invokation, [
        {
            index: ['Timelock'],
            data: {
                address: timelock._address,
                contract: timelockData.contract,
                description: timelockData.description
            }
        }
    ]);
    return { world, timelock, timelockData };
}
exports.buildTimelock = buildTimelock;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZWxvY2tCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0J1aWxkZXIvVGltZWxvY2tCdWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLDRDQUF1RDtBQUV2RCx3Q0FBMkQ7QUFDM0QsMENBQW1EO0FBQ25ELDBDQUEyRDtBQUUzRCxNQUFNLGdCQUFnQixHQUFHLHNCQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakQsTUFBTSx3QkFBd0IsR0FBRywwQkFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDcEUsTUFBTSxvQkFBb0IsR0FBRywwQkFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBV3RELEtBQUssVUFBVSxhQUFhLENBQ2pDLEtBQVksRUFDWixJQUFZLEVBQ1osS0FBWTtJQUVaLE1BQU0sUUFBUSxHQUFHO1FBQ2YsSUFBSSxpQkFBTyxDQUNUOzs7OztPQUtDLEVBQ0QsVUFBVSxFQUNWLENBQUMsSUFBSSxhQUFHLENBQUMsT0FBTyxFQUFFLHVCQUFXLENBQUMsRUFBRSxJQUFJLGFBQUcsQ0FBQyxPQUFPLEVBQUUsc0JBQVUsQ0FBQyxDQUFDLEVBQzdELEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEMsVUFBVSxFQUFFLE1BQU0sd0JBQXdCLENBQUMsTUFBTSxDQUFXLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoRyxRQUFRLEVBQUUsa0JBQWtCO1lBQzVCLFdBQVcsRUFBRSxtQkFBbUI7WUFDaEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2hCLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRztTQUNqQixDQUFDLENBQ0g7UUFDRCxJQUFJLGlCQUFPLENBQ1Q7Ozs7O09BS0MsRUFDRCxVQUFVLEVBQ1YsQ0FBQyxJQUFJ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VSxDQUFDLEtBQUssRUFBRTtRQUNwQixNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUM7S0FDeEI7SUFDRCxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsS0FBTSxDQUFDO0lBQ25DLFlBQVksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUV6QyxLQUFLLEdBQUcsTUFBTSwrQkFBb0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUU7UUFDMUU7WUFDRSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDbkIsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSxRQUFRLENBQUMsUUFBUTtnQkFDMUIsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRO2dCQUMvQixXQUFXLEVBQUUsWUFBWSxDQUFDLFdBQVc7YUFDdEM7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxDQUFDO0FBQzNDLENBQUM7QUFoSEQsc0NBZ0hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnQgfSBmcm9tICcuLi9FdmVudCc7XG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7IFRpbWVsb2NrIH0gZnJvbSAnLi4vQ29udHJhY3QvVGltZWxvY2snO1xuaW1wb3J0IHsgSW52b2thdGlvbiB9IGZyb20gJy4uL0ludm9rYXRpb24nO1xuaW1wb3J0IHsgZ2V0QWRkcmVzc1YsIGdldE51bWJlclYgfSBmcm9tICcuLi9Db3JlVmFsdWUnO1xuaW1wb3J0IHsgQWRkcmVzc1YsIE51bWJlclYgfSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQgeyBBcmcsIEZldGNoZXIsIGdldEZldGNoZXJWYWx1ZSB9IGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHsgc3RvcmVBbmRTYXZlQ29udHJhY3QgfSBmcm9tICcuLi9OZXR3b3Jrcyc7XG5pbXBvcnQgeyBnZXRDb250cmFjdCwgZ2V0VGVzdENvbnRyYWN0IH0gZnJvbSAnLi4vQ29udHJhY3QnO1xuXG5jb25zdCBUaW1lbG9ja0NvbnRyYWN0ID0gZ2V0Q29udHJhY3QoJ1RpbWVsb2NrJyk7XG5jb25zdCBUaW1lbG9ja1NjZW5hcmlvQ29udHJhY3QgPSBnZXRUZXN0Q29udHJhY3QoJ1RpbWVsb2NrSGFybmVzcycpO1xuY29uc3QgVGltZWxvY2tUZXN0Q29udHJhY3QgPSBnZXRUZXN0Q29udHJhY3QoJ1RpbWVsb2NrVGVzdCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVsb2NrRGF0YSB7XG4gIGludm9rYXRpb246IEludm9rYXRpb248VGltZWxvY2s+O1xuICBjb250cmFjdDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBhZGRyZXNzPzogc3RyaW5nO1xuICBhZG1pbjogc3RyaW5nO1xuICBkZWxheTogc3RyaW5nIHwgbnVtYmVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRUaW1lbG9jayhcbiAgd29ybGQ6IFdvcmxkLFxuICBmcm9tOiBzdHJpbmcsXG4gIGV2ZW50OiBFdmVudFxuKTogUHJvbWlzZTx7IHdvcmxkOiBXb3JsZDsgdGltZWxvY2s6IFRpbWVsb2NrOyB0aW1lbG9ja0RhdGE6IFRpbWVsb2NrRGF0YSB9PiB7XG4gIGNvbnN0IGZldGNoZXJzID0gW1xuICAgIG5ldyBGZXRjaGVyPHsgYWRtaW46IEFkZHJlc3NWOyBkZWxheTogTnVtYmVyViB9LCBUaW1lbG9ja0RhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFNjZW5hcmlvXG5cbiAgICAgICAgKiBcIlNjZW5hcmlvIGFkbWluOjxBZGRyZXNzPiBkZWxheTo8TnVtYmVyPlwiIC0gVGhlIFRpbWVsb2NrIFNjZW5hcmlvIGZvciBsb2NhbCB0ZXN0aW5nXG4gICAgICAgICAgKiBFLmcuIFwiVGltZWxvY2sgRGVwbG95IFNjZW5hcmlvIEdlb2ZmIDYwNDgwMFwiXG4gICAgICBgLFxuICAgICAgJ1NjZW5hcmlvJyxcbiAgICAgIFtuZXcgQXJnKCdhZG1pbicsIGdldEFkZHJlc3NWKSwgbmV3IEFyZygnZGVsYXknLCBnZXROdW1iZXJWKV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgYWRtaW4sIGRlbGF5IH0pID0+ICh7XG4gICAgICAgIGludm9rYXRpb246IGF3YWl0IFRpbWVsb2NrU2NlbmFyaW9Db250cmFjdC5kZXBsb3k8VGltZWxvY2s+KHdvcmxkLCBmcm9tLCBbYWRtaW4udmFsLCBkZWxheS52YWxdKSxcbiAgICAgICAgY29udHJhY3Q6ICdUaW1lbG9ja1NjZW5hcmlvJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTY2VuYXJpbyBUaW1lbG9jaycsXG4gICAgICAgIGFkbWluOiBhZG1pbi52YWwsXG4gICAgICAgIGRlbGF5OiBkZWxheS52YWxcbiAgICAgIH0pXG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7IGFkbWluOiBBZGRyZXNzVjsgZGVsYXk6IE51bWJlclYgfSwgVGltZWxvY2tEYXRhPihcbiAgICAgIGBcbiAgICAgICAgIyMjIyBTdGFuZGFyZFxuXG4gICAgICAgICogXCJTdGFuZGFyZCBhZG1pbjo8QWRkcmVzcz4gZGVsYXk6PE51bWJlcj5cIiAtIFRoZSBzdGFuZGFyZCBUaW1lbG9jayBjb250cmFjdFxuICAgICAgICAgICogRS5nLiBcIlRpbWVsb2NrIERlcGxveSBTdGFuZGFyZCBHZW9mZiA2MDQ4MDBcIlxuICAgICAgYCxcbiAgICAgICdTdGFuZGFyZCcsXG4gICAgICBbbmV3IEFyZygnYWRtaW4nLCBnZXRBZGRyZXNzViksIG5ldyBBcmcoJ2RlbGF5JywgZ2V0TnVtYmVyVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IGFkbWluLCBkZWxheSB9KSA9PiAoe1xuICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBUaW1lbG9ja0NvbnRyYWN0LmRlcGxveTxUaW1lbG9jaz4od29ybGQsIGZyb20sIFthZG1pbi52YWwsIGRlbGF5LnZhbF0pLFxuICAgICAgICBjb250cmFjdDogJ1RpbWVsb2NrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTdGFuZGFyZCBUaW1lbG9jaycsXG4gICAgICAgIGFkbWluOiBhZG1pbi52YWwsXG4gICAgICAgIGRlbGF5OiBkZWxheS52YWxcbiAgICAgIH0pXG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7IGFkbWluOiBBZGRyZXNzVjsgZGVsYXk6IE51bWJlclYgfSwgVGltZWxvY2tEYXRhPihcbiAgICAgIGBcbiAgICAgICAgIyMjIyBUZXN0XG5cbiAgICAgICAgKiBcIlRlc3QgYWRtaW46PEFkZHJlc3M+IGRlbGF5OjxOdW1iZXI+XCIgLSBUaGUgYSBzdGFuZGFyZCBUaW1lbG9jayBjb250cmFjdCB3aXRoIGEgbG93ZXIgbWluaW11bSBkZWxheSBmb3IgdGVzdGluZ1xuICAgICAgICAgICogRS5nLiBcIlRpbWVsb2NrIERlcGxveSBUZXN0IEdlb2ZmIDEyMFwiXG4gICAgICBgLFxuICAgICAgJ1Rlc3QnLFxuICAgICAgW25ldyBBcmcoJ2FkbWluJywgZ2V0QWRkcmVzc1YpLCBuZXcgQXJnKCdkZWxheScsIGdldE51bWJlclYpXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBhZG1pbiwgZGVsYXkgfSkgPT4gKHtcbiAgICAgICAgaW52b2thdGlvbjogYXdhaXQgVGltZWxvY2tUZXN0Q29udHJhY3QuZGVwbG95PFRpbWVsb2NrPih3b3JsZCwgZnJvbSwgW2FkbWluLnZhbCwgZGVsYXkudmFsXSksXG4gICAgICAgIGNvbnRyYWN0OiAnVGltZWxvY2snLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1Rlc3QgVGltZWxvY2snLFxuICAgICAgICBhZG1pbjogYWRtaW4udmFsLFxuICAgICAgICBkZWxheTogZGVsYXkudmFsXG4gICAgICB9KVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8eyBhZG1pbjogQWRkcmVzc1Y7IGRlbGF5OiBOdW1iZXJWIH0sIFRpbWVsb2NrRGF0YT4oXG4gICAgICBgXG4gICAgICAgICMjIyMgRGVmYXVsdFxuXG4gICAgICAgICogXCJuYW1lOjxTdHJpbmc+XCIgLSBUaGUgc3RhbmRhcmQgVGltZWxvY2sgY29udHJhY3RcbiAgICAgICAgICAqIEUuZy4gXCJUaW1lbG9jayBEZXBsb3kgR2VvZmYgNjA0ODAwXCJcbiAgICAgIGAsXG4gICAgICAnRGVmYXVsdCcsXG4gICAgICBbbmV3IEFyZygnYWRtaW4nLCBnZXRBZGRyZXNzViksIG5ldyBBcmcoJ2RlbGF5JywgZ2V0TnVtYmVyVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IGFkbWluLCBkZWxheSB9KSA9PiB7XG4gICAgICAgIGlmICh3b3JsZC5pc0xvY2FsTmV0d29yaygpKSB7XG4gICAgICAgICAgLy8gTm90ZTogd2UncmUgZ29pbmcgdG8gdXNlIHRoZSBzY2VuYXJpbyBjb250cmFjdCBhcyB0aGUgc3RhbmRhcmQgZGVwbG95bWVudCBvbiBsb2NhbCBuZXR3b3Jrc1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBUaW1lbG9ja1NjZW5hcmlvQ29udHJhY3QuZGVwbG95PFRpbWVsb2NrPih3b3JsZCwgZnJvbSwgW2FkbWluLnZhbCwgZGVsYXkudmFsXSksXG4gICAgICAgICAgICBjb250cmFjdDogJ1RpbWVsb2NrU2NlbmFyaW8nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTY2VuYXJpbyBUaW1lbG9jaycsXG4gICAgICAgICAgICBhZG1pbjogYWRtaW4udmFsLFxuICAgICAgICAgICAgZGVsYXk6IGRlbGF5LnZhbFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IFRpbWVsb2NrQ29udHJhY3QuZGVwbG95PFRpbWVsb2NrPih3b3JsZCwgZnJvbSwgW2FkbWluLnZhbCwgZGVsYXkudmFsXSksXG4gICAgICAgICAgICBjb250cmFjdDogJ1RpbWVsb2NrJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU3RhbmRhcmQgVGltZWxvY2snLFxuICAgICAgICAgICAgYWRtaW46IGFkbWluLnZhbCxcbiAgICAgICAgICAgIGRlbGF5OiBkZWxheS52YWxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeyBjYXRjaGFsbDogdHJ1ZSB9XG4gICAgKVxuICBdO1xuXG4gIGNvbnN0IHRpbWVsb2NrRGF0YSA9IGF3YWl0IGdldEZldGNoZXJWYWx1ZTxhbnksIFRpbWVsb2NrRGF0YT4oJ0RlcGxveVRpbWVsb2NrJywgZmV0Y2hlcnMsIHdvcmxkLCBldmVudCk7XG4gIGNvbnN0IGludm9rYXRpb24gPSB0aW1lbG9ja0RhdGEuaW52b2thdGlvbjtcbiAgZGVsZXRlIHRpbWVsb2NrRGF0YS5pbnZva2F0aW9uO1xuXG4gIGlmIChpbnZva2F0aW9uLmVycm9yKSB7XG4gICAgdGhyb3cgaW52b2thdGlvbi5lcnJvcjtcbiAgfVxuICBjb25zdCB0aW1lbG9jayA9IGludm9rYXRpb24udmFsdWUhO1xuICB0aW1lbG9ja0RhdGEuYWRkcmVzcyA9IHRpbWVsb2NrLl9hZGRyZXNzO1xuXG4gIHdvcmxkID0gYXdhaXQgc3RvcmVBbmRTYXZlQ29udHJhY3Qod29ybGQsIHRpbWVsb2NrLCAnVGltZWxvY2snLCBpbnZva2F0aW9uLCBbXG4gICAge1xuICAgICAgaW5kZXg6IFsnVGltZWxvY2snXSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgYWRkcmVzczogdGltZWxvY2suX2FkZHJlc3MsXG4gICAgICAgIGNvbnRyYWN0OiB0aW1lbG9ja0RhdGEuY29udHJhY3QsXG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aW1lbG9ja0RhdGEuZGVzY3JpcHRpb25cbiAgICAgIH1cbiAgICB9XG4gIF0pO1xuXG4gIHJldHVybiB7IHdvcmxkLCB0aW1lbG9jaywgdGltZWxvY2tEYXRhIH07XG59XG4iXX0=
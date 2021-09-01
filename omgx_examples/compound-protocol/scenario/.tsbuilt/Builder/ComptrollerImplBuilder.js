"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComptrollerImpl = void 0;
const CoreValue_1 = require("../CoreValue");
const Command_1 = require("../Command");
const Networks_1 = require("../Networks");
const Contract_1 = require("../Contract");
const ComptrollerG1Contract = Contract_1.getContract('ComptrollerG1');
const ComptrollerScenarioG1Contract = Contract_1.getTestContract('ComptrollerScenarioG1');
const ComptrollerG2Contract = Contract_1.getContract('ComptrollerG2');
const ComptrollerScenarioG2Contract = Contract_1.getContract('ComptrollerScenarioG2');
const ComptrollerG3Contract = Contract_1.getContract('ComptrollerG3');
const ComptrollerScenarioG3Contract = Contract_1.getContract('ComptrollerScenarioG3');
const ComptrollerG4Contract = Contract_1.getContract('ComptrollerG4');
const ComptrollerScenarioG4Contract = Contract_1.getContract('ComptrollerScenarioG4');
const ComptrollerG5Contract = Contract_1.getContract('ComptrollerG5');
const ComptrollerScenarioG5Contract = Contract_1.getContract('ComptrollerScenarioG5');
const ComptrollerG6Contract = Contract_1.getContract('ComptrollerG6');
const ComptrollerScenarioG6Contract = Contract_1.getContract('ComptrollerScenarioG6');
const ComptrollerScenarioContract = Contract_1.getTestContract('ComptrollerScenario');
const ComptrollerContract = Contract_1.getContract('Comptroller');
const ComptrollerBorkedContract = Contract_1.getTestContract('ComptrollerBorked');
async function buildComptrollerImpl(world, from, event) {
    const fetchers = [
        new Command_1.Fetcher(`
        #### ScenarioG1

        * "ScenarioG1 name:<String>" - The Comptroller Scenario for local testing (G1)
          * E.g. "ComptrollerImpl Deploy ScenarioG1 MyScen"
      `, 'ScenarioG1', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerScenarioG1Contract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerScenarioG1',
            description: 'ScenarioG1 Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### ScenarioG2

        * "ScenarioG2 name:<String>" - The Comptroller Scenario for local testing (G2)
          * E.g. "ComptrollerImpl Deploy ScenarioG2 MyScen"
      `, 'ScenarioG2', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerScenarioG2Contract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerScenarioG2Contract',
            description: 'ScenarioG2 Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### ScenarioG3

        * "ScenarioG3 name:<String>" - The Comptroller Scenario for local testing (G3)
          * E.g. "ComptrollerImpl Deploy ScenarioG3 MyScen"
      `, 'ScenarioG3', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerScenarioG3Contract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerScenarioG3Contract',
            description: 'ScenarioG3 Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### ScenarioG4
        * "ScenarioG4 name:<String>" - The Comptroller Scenario for local testing (G4)
          * E.g. "ComptrollerImpl Deploy ScenarioG4 MyScen"
      `, 'ScenarioG4', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerScenarioG4Contract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerScenarioG4Contract',
            description: 'ScenarioG4 Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### ScenarioG5
        * "ScenarioG5 name:<String>" - The Comptroller Scenario for local testing (G5)
          * E.g. "ComptrollerImpl Deploy ScenarioG5 MyScen"
      `, 'ScenarioG5', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerScenarioG5Contract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerScenarioG5Contract',
            description: 'ScenarioG5 Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### ScenarioG6
        * "ScenarioG6 name:<String>" - The Comptroller Scenario for local testing (G6)
          * E.g. "ComptrollerImpl Deploy ScenarioG6 MyScen"
      `, 'ScenarioG6', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerScenarioG6Contract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerScenarioG6Contract',
            description: 'ScenarioG6 Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### Scenario

        * "Scenario name:<String>" - The Comptroller Scenario for local testing
          * E.g. "ComptrollerImpl Deploy Scenario MyScen"
      `, 'Scenario', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerScenarioContract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerScenario',
            description: 'Scenario Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### StandardG1

        * "StandardG1 name:<String>" - The standard generation 1 Comptroller contract
          * E.g. "Comptroller Deploy StandardG1 MyStandard"
      `, 'StandardG1', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            return {
                invokation: await ComptrollerG1Contract.deploy(world, from, []),
                name: name.val,
                contract: 'ComptrollerG1',
                description: 'StandardG1 Comptroller Impl'
            };
        }),
        new Command_1.Fetcher(`
        #### StandardG2

        * "StandardG2 name:<String>" - The standard generation 2 Comptroller contract
          * E.g. "Comptroller Deploy StandardG2 MyStandard"
      `, 'StandardG2', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            return {
                invokation: await ComptrollerG2Contract.deploy(world, from, []),
                name: name.val,
                contract: 'ComptrollerG2',
                description: 'StandardG2 Comptroller Impl'
            };
        }),
        new Command_1.Fetcher(`
        #### StandardG3

        * "StandardG3 name:<String>" - The standard generation 3 Comptroller contract
          * E.g. "Comptroller Deploy StandardG3 MyStandard"
      `, 'StandardG3', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            return {
                invokation: await ComptrollerG3Contract.deploy(world, from, []),
                name: name.val,
                contract: 'ComptrollerG3',
                description: 'StandardG3 Comptroller Impl'
            };
        }),
        new Command_1.Fetcher(`
        #### StandardG4

        * "StandardG4 name:<String>" - The standard generation 4 Comptroller contract
          * E.g. "Comptroller Deploy StandardG4 MyStandard"
      `, 'StandardG4', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            return {
                invokation: await ComptrollerG4Contract.deploy(world, from, []),
                name: name.val,
                contract: 'ComptrollerG4',
                description: 'StandardG4 Comptroller Impl'
            };
        }),
        new Command_1.Fetcher(`
        #### StandardG5
        * "StandardG5 name:<String>" - The standard generation 5 Comptroller contract
          * E.g. "Comptroller Deploy StandardG5 MyStandard"
      `, 'StandardG5', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            return {
                invokation: await ComptrollerG5Contract.deploy(world, from, []),
                name: name.val,
                contract: 'ComptrollerG5',
                description: 'StandardG5 Comptroller Impl'
            };
        }),
        new Command_1.Fetcher(`
        #### StandardG6
        * "StandardG6 name:<String>" - The standard generation 6 Comptroller contract
          * E.g. "Comptroller Deploy StandardG6 MyStandard"
      `, 'StandardG6', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            return {
                invokation: await ComptrollerG6Contract.deploy(world, from, []),
                name: name.val,
                contract: 'ComptrollerG6',
                description: 'StandardG6 Comptroller Impl'
            };
        }),
        new Command_1.Fetcher(`
        #### Standard

        * "Standard name:<String>" - The standard Comptroller contract
          * E.g. "Comptroller Deploy Standard MyStandard"
      `, 'Standard', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            return {
                invokation: await ComptrollerContract.deploy(world, from, []),
                name: name.val,
                contract: 'Comptroller',
                description: 'Standard Comptroller Impl'
            };
        }),
        new Command_1.Fetcher(`
        #### Borked

        * "Borked name:<String>" - A Borked Comptroller for testing
          * E.g. "ComptrollerImpl Deploy Borked MyBork"
      `, 'Borked', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => ({
            invokation: await ComptrollerBorkedContract.deploy(world, from, []),
            name: name.val,
            contract: 'ComptrollerBorked',
            description: 'Borked Comptroller Impl'
        })),
        new Command_1.Fetcher(`
        #### Default

        * "name:<String>" - The standard Comptroller contract
          * E.g. "ComptrollerImpl Deploy MyDefault"
      `, 'Default', [new Command_1.Arg('name', CoreValue_1.getStringV)], async (world, { name }) => {
            if (world.isLocalNetwork()) {
                // Note: we're going to use the scenario contract as the standard deployment on local networks
                return {
                    invokation: await ComptrollerScenarioContract.deploy(world, from, []),
                    name: name.val,
                    contract: 'ComptrollerScenario',
                    description: 'Scenario Comptroller Impl'
                };
            }
            else {
                return {
                    invokation: await ComptrollerContract.deploy(world, from, []),
                    name: name.val,
                    contract: 'Comptroller',
                    description: 'Standard Comptroller Impl'
                };
            }
        }, { catchall: true })
    ];
    let comptrollerImplData = await Command_1.getFetcherValue('DeployComptrollerImpl', fetchers, world, event);
    let invokation = comptrollerImplData.invokation;
    delete comptrollerImplData.invokation;
    if (invokation.error) {
        throw invokation.error;
    }
    const comptrollerImpl = invokation.value;
    world = await Networks_1.storeAndSaveContract(world, comptrollerImpl, comptrollerImplData.name, invokation, [
        {
            index: ['Comptroller', comptrollerImplData.name],
            data: {
                address: comptrollerImpl._address,
                contract: comptrollerImplData.contract,
                description: comptrollerImplData.description
            }
        }
    ]);
    return { world, comptrollerImpl, comptrollerImplData };
}
exports.buildComptrollerImpl = buildComptrollerImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcHRyb2xsZXJJbXBsQnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9CdWlsZGVyL0NvbXB0cm9sbGVySW1wbEJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsNENBQWtGO0FBRWxGLHdDQUEyRDtBQUMzRCwwQ0FBbUQ7QUFDbkQsMENBQTJEO0FBRTNELE1BQU0scUJBQXFCLEdBQUcsc0JBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMzRCxNQUFNLDZCQUE2QixHQUFHLDBCQUFlLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUUvRSxNQUFNLHFCQUFxQixHQUFHLHNCQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDM0QsTUFBTSw2QkFBNkIsR0FBRyxzQkFBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFM0UsTUFBTSxxQkFBcUIsR0FBRyxzQkFBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzNELE1BQU0sNkJBQTZCLEdBQUcsc0JBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTNFLE1BQU0scUJBQXFCLEdBQUcsc0JBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMzRCxNQUFNLDZCQUE2QixHQUFHLHNCQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUUzRSxNQUFNLHFCQUFxQixHQUFHLHNCQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDM0QsTUFBTSw2QkFBNkIsR0FBRyxzQkFBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFM0UsTUFBTSxxQkFBcUIsR0FBRyxzQkFBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzNELE1BQU0sNkJBQTZCLEdBQUcsc0JBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRTNFLE1BQU0sMkJBQTJCLEdBQUcsMEJBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzNFLE1BQU0sbUJBQW1CLEdBQUcsc0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztB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TSxDQUFrQixLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztvQkFDOUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHO29CQUNkLFFBQVEsRUFBRSxhQUFhO29CQUN2QixXQUFXLEVBQUUsMkJBQTJCO2lCQUN6QyxDQUFDO2FBQ0g7UUFDSCxDQUFDLEVBQ0QsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQ25CO0tBQ0YsQ0FBQztJQUVGLElBQUksbUJBQW1CLEdBQUcsTUFBTSx5QkFBZSxDQUM3Qyx1QkFBdUIsRUFDdkIsUUFBUSxFQUNSLEtBQUssRUFDTCxLQUFLLENBQ04sQ0FBQztJQUNGLElBQUksVUFBVSxHQUFHLG1CQUFtQixDQUFDLFVBQVUsQ0FBQztJQUNoRCxPQUFPLG1CQUFtQixDQUFDLFVBQVUsQ0FBQztJQUV0QyxJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUU7UUFDcEIsTUFBTSxVQUFVLENBQUMsS0FBSyxDQUFDO0tBQ3hCO0lBQ0QsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLEtBQU0sQ0FBQztJQUUxQyxLQUFLLEdBQUcsTUFBTSwrQkFBb0IsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7UUFDL0Y7WUFDRSxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1lBQ2hELElBQUksRUFBRTtnQkFDSixPQUFPLEVBQUUsZUFBZSxDQUFDLFFBQVE7Z0JBQ2pDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxRQUFRO2dCQUN0QyxXQUFXLEVBQUUsbUJBQW1CLENBQUMsV0FBVzthQUM3QztTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztBQUN6RCxDQUFDO0FBdFVELG9EQXNVQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50IH0gZnJvbSAnLi4vRXZlbnQnO1xuaW1wb3J0IHsgYWRkQWN0aW9uLCBXb3JsZCB9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7IENvbXB0cm9sbGVySW1wbCB9IGZyb20gJy4uL0NvbnRyYWN0L0NvbXB0cm9sbGVySW1wbCc7XG5pbXBvcnQgeyBJbnZva2F0aW9uLCBpbnZva2UgfSBmcm9tICcuLi9JbnZva2F0aW9uJztcbmltcG9ydCB7IGdldEFkZHJlc3NWLCBnZXRFeHBOdW1iZXJWLCBnZXROdW1iZXJWLCBnZXRTdHJpbmdWIH0gZnJvbSAnLi4vQ29yZVZhbHVlJztcbmltcG9ydCB7IEFkZHJlc3NWLCBOdW1iZXJWLCBTdHJpbmdWIH0gZnJvbSAnLi4vVmFsdWUnO1xuaW1wb3J0IHsgQXJnLCBGZXRjaGVyLCBnZXRGZXRjaGVyVmFsdWUgfSBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7IHN0b3JlQW5kU2F2ZUNvbnRyYWN0IH0gZnJvbSAnLi4vTmV0d29ya3MnO1xuaW1wb3J0IHsgZ2V0Q29udHJhY3QsIGdldFRlc3RDb250cmFjdCB9IGZyb20gJy4uL0NvbnRyYWN0JztcblxuY29uc3QgQ29tcHRyb2xsZXJHMUNvbnRyYWN0ID0gZ2V0Q29udHJhY3QoJ0NvbXB0cm9sbGVyRzEnKTtcbmNvbnN0IENvbXB0cm9sbGVyU2NlbmFyaW9HMUNvbnRyYWN0ID0gZ2V0VGVzdENvbnRyYWN0KCdDb21wdHJvbGxlclNjZW5hcmlvRzEnKTtcblxuY29uc3QgQ29tcHRyb2xsZXJHMkNvbnRyYWN0ID0gZ2V0Q29udHJhY3QoJ0NvbXB0cm9sbGVyRzInKTtcbmNvbnN0IENvbXB0cm9sbGVyU2NlbmFyaW9HMkNvbnRyYWN0ID0gZ2V0Q29udHJhY3QoJ0NvbXB0cm9sbGVyU2NlbmFyaW9HMicpO1xuXG5jb25zdCBDb21wdHJvbGxlckczQ29udHJhY3QgPSBnZXRDb250cmFjdCgnQ29tcHRyb2xsZXJHMycpO1xuY29uc3QgQ29tcHRyb2xsZXJTY2VuYXJpb0czQ29udHJhY3QgPSBnZXRDb250cmFjdCgnQ29tcHRyb2xsZXJTY2VuYXJpb0czJyk7XG5cbmNvbnN0IENvbXB0cm9sbGVyRzRDb250cmFjdCA9IGdldENvbnRyYWN0KCdDb21wdHJvbGxlckc0Jyk7XG5jb25zdCBDb21wdHJvbGxlclNjZW5hcmlvRzRDb250cmFjdCA9IGdldENvbnRyYWN0KCdDb21wdHJvbGxlclNjZW5hcmlvRzQnKTtcblxuY29uc3QgQ29tcHRyb2xsZXJHNUNvbnRyYWN0ID0gZ2V0Q29udHJhY3QoJ0NvbXB0cm9sbGVyRzUnKTtcbmNvbnN0IENvbXB0cm9sbGVyU2NlbmFyaW9HNUNvbnRyYWN0ID0gZ2V0Q29udHJhY3QoJ0NvbXB0cm9sbGVyU2NlbmFyaW9HNScpO1xuXG5jb25zdCBDb21wdHJvbGxlckc2Q29udHJhY3QgPSBnZXRDb250cmFjdCgnQ29tcHRyb2xsZXJHNicpO1xuY29uc3QgQ29tcHRyb2xsZXJTY2VuYXJpb0c2Q29udHJhY3QgPSBnZXRDb250cmFjdCgnQ29tcHRyb2xsZXJTY2VuYXJpb0c2Jyk7XG5cbmNvbnN0IENvbXB0cm9sbGVyU2NlbmFyaW9Db250cmFjdCA9IGdldFRlc3RDb250cmFjdCgnQ29tcHRyb2xsZXJTY2VuYXJpbycpO1xuY29uc3QgQ29tcHRyb2xsZXJDb250cmFjdCA9IGdldENvbnRyYWN0KCdDb21wdHJvbGxlcicpO1xuXG5jb25zdCBDb21wdHJvbGxlckJvcmtlZENvbnRyYWN0ID0gZ2V0VGVzdENvbnRyYWN0KCdDb21wdHJvbGxlckJvcmtlZCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXB0cm9sbGVySW1wbERhdGEge1xuICBpbnZva2F0aW9uOiBJbnZva2F0aW9uPENvbXB0cm9sbGVySW1wbD47XG4gIG5hbWU6IHN0cmluZztcbiAgY29udHJhY3Q6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkQ29tcHRyb2xsZXJJbXBsKFxuICB3b3JsZDogV29ybGQsXG4gIGZyb206IHN0cmluZyxcbiAgZXZlbnQ6IEV2ZW50XG4pOiBQcm9taXNlPHsgd29ybGQ6IFdvcmxkOyBjb21wdHJvbGxlckltcGw6IENvbXB0cm9sbGVySW1wbDsgY29tcHRyb2xsZXJJbXBsRGF0YTogQ29tcHRyb2xsZXJJbXBsRGF0YSB9PiB7XG4gIGNvbnN0IGZldGNoZXJzID0gW1xuICAgIG5ldyBGZXRjaGVyPHsgbmFtZTogU3RyaW5nViB9LCBDb21wdHJvbGxlckltcGxEYXRhPihcbiAgICAgIGBcbiAgICAgICAgIyMjIyBTY2VuYXJpb0cxXG5cbiAgICAgICAgKiBcIlNjZW5hcmlvRzEgbmFtZTo8U3RyaW5nPlwiIC0gVGhlIENvbXB0cm9sbGVyIFNjZW5hcmlvIGZvciBsb2NhbCB0ZXN0aW5nIChHMSlcbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlckltcGwgRGVwbG95IFNjZW5hcmlvRzEgTXlTY2VuXCJcbiAgICAgIGAsXG4gICAgICAnU2NlbmFyaW9HMScsXG4gICAgICBbbmV3IEFyZygnbmFtZScsIGdldFN0cmluZ1YpXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBuYW1lIH0pID0+ICh7XG4gICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXB0cm9sbGVyU2NlbmFyaW9HMUNvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICBjb250cmFjdDogJ0NvbXB0cm9sbGVyU2NlbmFyaW9HMScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2NlbmFyaW9HMSBDb21wdHJvbGxlciBJbXBsJ1xuICAgICAgfSlcbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFNjZW5hcmlvRzJcblxuICAgICAgICAqIFwiU2NlbmFyaW9HMiBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgQ29tcHRyb2xsZXIgU2NlbmFyaW8gZm9yIGxvY2FsIHRlc3RpbmcgKEcyKVxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVySW1wbCBEZXBsb3kgU2NlbmFyaW9HMiBNeVNjZW5cIlxuICAgICAgYCxcbiAgICAgICdTY2VuYXJpb0cyJyxcbiAgICAgIFtuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IG5hbWUgfSkgPT4gKHtcbiAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJTY2VuYXJpb0cyQ29udHJhY3QuZGVwbG95PENvbXB0cm9sbGVySW1wbD4od29ybGQsIGZyb20sIFtdKSxcbiAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgIGNvbnRyYWN0OiAnQ29tcHRyb2xsZXJTY2VuYXJpb0cyQ29udHJhY3QnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1NjZW5hcmlvRzIgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgIH0pXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgbmFtZTogU3RyaW5nViB9LCBDb21wdHJvbGxlckltcGxEYXRhPihcbiAgICAgIGBcbiAgICAgICAgIyMjIyBTY2VuYXJpb0czXG5cbiAgICAgICAgKiBcIlNjZW5hcmlvRzMgbmFtZTo8U3RyaW5nPlwiIC0gVGhlIENvbXB0cm9sbGVyIFNjZW5hcmlvIGZvciBsb2NhbCB0ZXN0aW5nIChHMylcbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlckltcGwgRGVwbG95IFNjZW5hcmlvRzMgTXlTY2VuXCJcbiAgICAgIGAsXG4gICAgICAnU2NlbmFyaW9HMycsXG4gICAgICBbbmV3IEFyZygnbmFtZScsIGdldFN0cmluZ1YpXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBuYW1lIH0pID0+ICh7XG4gICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXB0cm9sbGVyU2NlbmFyaW9HM0NvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICBjb250cmFjdDogJ0NvbXB0cm9sbGVyU2NlbmFyaW9HM0NvbnRyYWN0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTY2VuYXJpb0czIENvbXB0cm9sbGVyIEltcGwnXG4gICAgICB9KVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7IG5hbWU6IFN0cmluZ1YgfSwgQ29tcHRyb2xsZXJJbXBsRGF0YT4oXG4gICAgICBgXG4gICAgICAgICMjIyMgU2NlbmFyaW9HNFxuICAgICAgICAqIFwiU2NlbmFyaW9HNCBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgQ29tcHRyb2xsZXIgU2NlbmFyaW8gZm9yIGxvY2FsIHRlc3RpbmcgKEc0KVxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVySW1wbCBEZXBsb3kgU2NlbmFyaW9HNCBNeVNjZW5cIlxuICAgICAgYCxcbiAgICAgICdTY2VuYXJpb0c0JyxcbiAgICAgIFtuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IG5hbWUgfSkgPT4gKHtcbiAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJTY2VuYXJpb0c0Q29udHJhY3QuZGVwbG95PENvbXB0cm9sbGVySW1wbD4od29ybGQsIGZyb20sIFtdKSxcbiAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgIGNvbnRyYWN0OiAnQ29tcHRyb2xsZXJTY2VuYXJpb0c0Q29udHJhY3QnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1NjZW5hcmlvRzQgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgIH0pXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgbmFtZTogU3RyaW5nViB9LCBDb21wdHJvbGxlckltcGxEYXRhPihcbiAgICAgIGBcbiAgICAgICAgIyMjIyBTY2VuYXJpb0c1XG4gICAgICAgICogXCJTY2VuYXJpb0c1IG5hbWU6PFN0cmluZz5cIiAtIFRoZSBDb21wdHJvbGxlciBTY2VuYXJpbyBmb3IgbG9jYWwgdGVzdGluZyAoRzUpXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXJJbXBsIERlcGxveSBTY2VuYXJpb0c1IE15U2NlblwiXG4gICAgICBgLFxuICAgICAgJ1NjZW5hcmlvRzUnLFxuICAgICAgW25ldyBBcmcoJ25hbWUnLCBnZXRTdHJpbmdWKV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgbmFtZSB9KSA9PiAoe1xuICAgICAgICBpbnZva2F0aW9uOiBhd2FpdCBDb21wdHJvbGxlclNjZW5hcmlvRzVDb250cmFjdC5kZXBsb3k8Q29tcHRyb2xsZXJJbXBsPih3b3JsZCwgZnJvbSwgW10pLFxuICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlclNjZW5hcmlvRzVDb250cmFjdCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2NlbmFyaW9HNSBDb21wdHJvbGxlciBJbXBsJ1xuICAgICAgfSlcbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFNjZW5hcmlvRzZcbiAgICAgICAgKiBcIlNjZW5hcmlvRzYgbmFtZTo8U3RyaW5nPlwiIC0gVGhlIENvbXB0cm9sbGVyIFNjZW5hcmlvIGZvciBsb2NhbCB0ZXN0aW5nIChHNilcbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlckltcGwgRGVwbG95IFNjZW5hcmlvRzYgTXlTY2VuXCJcbiAgICAgIGAsXG4gICAgICAnU2NlbmFyaW9HNicsXG4gICAgICBbbmV3IEFyZygnbmFtZScsIGdldFN0cmluZ1YpXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBuYW1lIH0pID0+ICh7XG4gICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXB0cm9sbGVyU2NlbmFyaW9HNkNvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICBjb250cmFjdDogJ0NvbXB0cm9sbGVyU2NlbmFyaW9HNkNvbnRyYWN0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTY2VuYXJpb0c2IENvbXB0cm9sbGVyIEltcGwnXG4gICAgICB9KVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7IG5hbWU6IFN0cmluZ1YgfSwgQ29tcHRyb2xsZXJJbXBsRGF0YT4oXG4gICAgICBgXG4gICAgICAgICMjIyMgU2NlbmFyaW9cblxuICAgICAgICAqIFwiU2NlbmFyaW8gbmFtZTo8U3RyaW5nPlwiIC0gVGhlIENvbXB0cm9sbGVyIFNjZW5hcmlvIGZvciBsb2NhbCB0ZXN0aW5nXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXJJbXBsIERlcGxveSBTY2VuYXJpbyBNeVNjZW5cIlxuICAgICAgYCxcbiAgICAgICdTY2VuYXJpbycsXG4gICAgICBbbmV3IEFyZygnbmFtZScsIGdldFN0cmluZ1YpXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBuYW1lIH0pID0+ICh7XG4gICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXB0cm9sbGVyU2NlbmFyaW9Db250cmFjdC5kZXBsb3k8Q29tcHRyb2xsZXJJbXBsPih3b3JsZCwgZnJvbSwgW10pLFxuICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlclNjZW5hcmlvJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTY2VuYXJpbyBDb21wdHJvbGxlciBJbXBsJ1xuICAgICAgfSlcbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFN0YW5kYXJkRzFcblxuICAgICAgICAqIFwiU3RhbmRhcmRHMSBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgc3RhbmRhcmQgZ2VuZXJhdGlvbiAxIENvbXB0cm9sbGVyIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgRGVwbG95IFN0YW5kYXJkRzEgTXlTdGFuZGFyZFwiXG4gICAgICBgLFxuICAgICAgJ1N0YW5kYXJkRzEnLFxuICAgICAgW25ldyBBcmcoJ25hbWUnLCBnZXRTdHJpbmdWKV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgbmFtZSB9KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJHMUNvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlckcxJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkRzEgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFN0YW5kYXJkRzJcblxuICAgICAgICAqIFwiU3RhbmRhcmRHMiBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgc3RhbmRhcmQgZ2VuZXJhdGlvbiAyIENvbXB0cm9sbGVyIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgRGVwbG95IFN0YW5kYXJkRzIgTXlTdGFuZGFyZFwiXG4gICAgICBgLFxuICAgICAgJ1N0YW5kYXJkRzInLFxuICAgICAgW25ldyBBcmcoJ25hbWUnLCBnZXRTdHJpbmdWKV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgbmFtZSB9KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJHMkNvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlckcyJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkRzIgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFN0YW5kYXJkRzNcblxuICAgICAgICAqIFwiU3RhbmRhcmRHMyBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgc3RhbmRhcmQgZ2VuZXJhdGlvbiAzIENvbXB0cm9sbGVyIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgRGVwbG95IFN0YW5kYXJkRzMgTXlTdGFuZGFyZFwiXG4gICAgICBgLFxuICAgICAgJ1N0YW5kYXJkRzMnLFxuICAgICAgW25ldyBBcmcoJ25hbWUnLCBnZXRTdHJpbmdWKV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgbmFtZSB9KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJHM0NvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlckczJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkRzMgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFN0YW5kYXJkRzRcblxuICAgICAgICAqIFwiU3RhbmRhcmRHNCBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgc3RhbmRhcmQgZ2VuZXJhdGlvbiA0IENvbXB0cm9sbGVyIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgRGVwbG95IFN0YW5kYXJkRzQgTXlTdGFuZGFyZFwiXG4gICAgICBgLFxuICAgICAgJ1N0YW5kYXJkRzQnLFxuICAgICAgW25ldyBBcmcoJ25hbWUnLCBnZXRTdHJpbmdWKV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgbmFtZSB9KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJHNENvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlckc0JyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkRzQgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuICBcbiAgICBuZXcgRmV0Y2hlcjx7IG5hbWU6IFN0cmluZ1YgfSwgQ29tcHRyb2xsZXJJbXBsRGF0YT4oXG4gICAgICBgXG4gICAgICAgICMjIyMgU3RhbmRhcmRHNVxuICAgICAgICAqIFwiU3RhbmRhcmRHNSBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgc3RhbmRhcmQgZ2VuZXJhdGlvbiA1IENvbXB0cm9sbGVyIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXIgRGVwbG95IFN0YW5kYXJkRzUgTXlTdGFuZGFyZFwiXG4gICAgICBgLFxuICAgICAgJ1N0YW5kYXJkRzUnLFxuICAgICAgW25ldyBBcmcoJ25hbWUnLCBnZXRTdHJpbmdWKV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgbmFtZSB9KSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJHNUNvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlckc1JyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkRzUgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFN0YW5kYXJkRzZcbiAgICAgICAgKiBcIlN0YW5kYXJkRzYgbmFtZTo8U3RyaW5nPlwiIC0gVGhlIHN0YW5kYXJkIGdlbmVyYXRpb24gNiBDb21wdHJvbGxlciBjb250cmFjdFxuICAgICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIERlcGxveSBTdGFuZGFyZEc2IE15U3RhbmRhcmRcIlxuICAgICAgYCxcbiAgICAgICdTdGFuZGFyZEc2JyxcbiAgICAgIFtuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IG5hbWUgfSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXB0cm9sbGVyRzZDb250cmFjdC5kZXBsb3k8Q29tcHRyb2xsZXJJbXBsPih3b3JsZCwgZnJvbSwgW10pLFxuICAgICAgICAgIG5hbWU6IG5hbWUudmFsLFxuICAgICAgICAgIGNvbnRyYWN0OiAnQ29tcHRyb2xsZXJHNicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTdGFuZGFyZEc2IENvbXB0cm9sbGVyIEltcGwnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgbmFtZTogU3RyaW5nViB9LCBDb21wdHJvbGxlckltcGxEYXRhPihcbiAgICAgIGBcbiAgICAgICAgIyMjIyBTdGFuZGFyZFxuXG4gICAgICAgICogXCJTdGFuZGFyZCBuYW1lOjxTdHJpbmc+XCIgLSBUaGUgc3RhbmRhcmQgQ29tcHRyb2xsZXIgY29udHJhY3RcbiAgICAgICAgICAqIEUuZy4gXCJDb21wdHJvbGxlciBEZXBsb3kgU3RhbmRhcmQgTXlTdGFuZGFyZFwiXG4gICAgICBgLFxuICAgICAgJ1N0YW5kYXJkJyxcbiAgICAgIFtuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IG5hbWUgfSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGludm9rYXRpb246IGF3YWl0IENvbXB0cm9sbGVyQ29udHJhY3QuZGVwbG95PENvbXB0cm9sbGVySW1wbD4od29ybGQsIGZyb20sIFtdKSxcbiAgICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgICBjb250cmFjdDogJ0NvbXB0cm9sbGVyJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkIENvbXB0cm9sbGVyIEltcGwnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgbmFtZTogU3RyaW5nViB9LCBDb21wdHJvbGxlckltcGxEYXRhPihcbiAgICAgIGBcbiAgICAgICAgIyMjIyBCb3JrZWRcblxuICAgICAgICAqIFwiQm9ya2VkIG5hbWU6PFN0cmluZz5cIiAtIEEgQm9ya2VkIENvbXB0cm9sbGVyIGZvciB0ZXN0aW5nXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXJJbXBsIERlcGxveSBCb3JrZWQgTXlCb3JrXCJcbiAgICAgIGAsXG4gICAgICAnQm9ya2VkJyxcbiAgICAgIFtuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IG5hbWUgfSkgPT4gKHtcbiAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJCb3JrZWRDb250cmFjdC5kZXBsb3k8Q29tcHRyb2xsZXJJbXBsPih3b3JsZCwgZnJvbSwgW10pLFxuICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgY29udHJhY3Q6ICdDb21wdHJvbGxlckJvcmtlZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQm9ya2VkIENvbXB0cm9sbGVyIEltcGwnXG4gICAgICB9KVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8eyBuYW1lOiBTdHJpbmdWIH0sIENvbXB0cm9sbGVySW1wbERhdGE+KFxuICAgICAgYFxuICAgICAgICAjIyMjIERlZmF1bHRcblxuICAgICAgICAqIFwibmFtZTo8U3RyaW5nPlwiIC0gVGhlIHN0YW5kYXJkIENvbXB0cm9sbGVyIGNvbnRyYWN0XG4gICAgICAgICAgKiBFLmcuIFwiQ29tcHRyb2xsZXJJbXBsIERlcGxveSBNeURlZmF1bHRcIlxuICAgICAgYCxcbiAgICAgICdEZWZhdWx0JyxcbiAgICAgIFtuZXcgQXJnKCduYW1lJywgZ2V0U3RyaW5nVildLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IG5hbWUgfSkgPT4ge1xuICAgICAgICBpZiAod29ybGQuaXNMb2NhbE5ldHdvcmsoKSkge1xuICAgICAgICAgIC8vIE5vdGU6IHdlJ3JlIGdvaW5nIHRvIHVzZSB0aGUgc2NlbmFyaW8gY29udHJhY3QgYXMgdGhlIHN0YW5kYXJkIGRlcGxveW1lbnQgb24gbG9jYWwgbmV0d29ya3NcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJTY2VuYXJpb0NvbnRyYWN0LmRlcGxveTxDb21wdHJvbGxlckltcGw+KHdvcmxkLCBmcm9tLCBbXSksXG4gICAgICAgICAgICBuYW1lOiBuYW1lLnZhbCxcbiAgICAgICAgICAgIGNvbnRyYWN0OiAnQ29tcHRyb2xsZXJTY2VuYXJpbycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NjZW5hcmlvIENvbXB0cm9sbGVyIEltcGwnXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW52b2thdGlvbjogYXdhaXQgQ29tcHRyb2xsZXJDb250cmFjdC5kZXBsb3k8Q29tcHRyb2xsZXJJbXBsPih3b3JsZCwgZnJvbSwgW10pLFxuICAgICAgICAgICAgbmFtZTogbmFtZS52YWwsXG4gICAgICAgICAgICBjb250cmFjdDogJ0NvbXB0cm9sbGVyJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU3RhbmRhcmQgQ29tcHRyb2xsZXIgSW1wbCdcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgeyBjYXRjaGFsbDogdHJ1ZSB9XG4gICAgKVxuICBdO1xuXG4gIGxldCBjb21wdHJvbGxlckltcGxEYXRhID0gYXdhaXQgZ2V0RmV0Y2hlclZhbHVlPGFueSwgQ29tcHRyb2xsZXJJbXBsRGF0YT4oXG4gICAgJ0RlcGxveUNvbXB0cm9sbGVySW1wbCcsXG4gICAgZmV0Y2hlcnMsXG4gICAgd29ybGQsXG4gICAgZXZlbnRcbiAgKTtcbiAgbGV0IGludm9rYXRpb24gPSBjb21wdHJvbGxlckltcGxEYXRhLmludm9rYXRpb247XG4gIGRlbGV0ZSBjb21wdHJvbGxlckltcGxEYXRhLmludm9rYXRpb247XG5cbiAgaWYgKGludm9rYXRpb24uZXJyb3IpIHtcbiAgICB0aHJvdyBpbnZva2F0aW9uLmVycm9yO1xuICB9XG4gIGNvbnN0IGNvbXB0cm9sbGVySW1wbCA9IGludm9rYXRpb24udmFsdWUhO1xuXG4gIHdvcmxkID0gYXdhaXQgc3RvcmVBbmRTYXZlQ29udHJhY3Qod29ybGQsIGNvbXB0cm9sbGVySW1wbCwgY29tcHRyb2xsZXJJbXBsRGF0YS5uYW1lLCBpbnZva2F0aW9uLCBbXG4gICAge1xuICAgICAgaW5kZXg6IFsnQ29tcHRyb2xsZXInLCBjb21wdHJvbGxlckltcGxEYXRhLm5hbWVdLFxuICAgICAgZGF0YToge1xuICAgICAgICBhZGRyZXNzOiBjb21wdHJvbGxlckltcGwuX2FkZHJlc3MsXG4gICAgICAgIGNvbnRyYWN0OiBjb21wdHJvbGxlckltcGxEYXRhLmNvbnRyYWN0LFxuICAgICAgICBkZXNjcmlwdGlvbjogY29tcHRyb2xsZXJJbXBsRGF0YS5kZXNjcmlwdGlvblxuICAgICAgfVxuICAgIH1cbiAgXSk7XG5cbiAgcmV0dXJuIHsgd29ybGQsIGNvbXB0cm9sbGVySW1wbCwgY29tcHRyb2xsZXJJbXBsRGF0YSB9O1xufVxuIl19
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const request_1 = __importDefault(require("request"));
const truffle_flattener_1 = __importDefault(require("truffle-flattener"));
const Contract_1 = require("./Contract");
function getUrl(network) {
    let host = {
        kovan: 'api-kovan.etherscan.io',
        rinkeby: 'api-rinkeby.etherscan.io',
        ropsten: 'api-ropsten.etherscan.io',
        goerli: 'api-goerli.etherscan.io',
        mainnet: 'api.etherscan.io'
    }[network];
    if (!host) {
        throw new Error(`Unknown etherscan API host for network ${network}`);
    }
    return `https://${host}/api`;
}
function getConstructorABI(world, contractName) {
    let constructorAbi = world.getIn(['contractData', 'Constructors', contractName]);
    if (!constructorAbi) {
        throw new Error(`Unknown Constructor ABI for ${contractName} on ${world.network}. Try deploying again?`);
    }
    return constructorAbi;
}
function post(url, data) {
    return new Promise((resolve, reject) => {
        request_1.default.post(url, { form: data }, (err, httpResponse, body) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(body));
            }
        });
    });
}
function get(url, data) {
    return new Promise((resolve, reject) => {
        request_1.default.get(url, { form: data }, (err, httpResponse, body) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(body));
            }
        });
    });
}
async function sleep(timeout) {
    return new Promise((resolve, _reject) => {
        setTimeout(() => resolve(), timeout);
    });
}
async function checkStatus(world, url, token) {
    world.printer.printLine(`Checking status of ${token}...`);
    // Potential results:
    // { status: '0', message: 'NOTOK', result: 'Fail - Unable to verify' }
    // { status: '0', message: 'NOTOK', result: 'Pending in queue' }
    // { status: '1', message: 'OK', result: 'Pass - Verified' }
    let result = await get(url, {
        guid: token,
        module: "contract",
        action: "checkverifystatus"
    });
    if (world.verbose) {
        console.log(result);
    }
    if (result.result === "Pending in queue") {
        await sleep(5000);
        return await checkStatus(world, url, token);
    }
    if (result.result.startsWith('Fail')) {
        throw new Error(`Etherscan failed to verify contract: ${result.message} "${result.result}"`);
    }
    if (Number(result.status) !== 1) {
        throw new Error(`Etherscan Error: ${result.message} "${result.result}"`);
    }
    world.printer.printLine(`Verification result ${result.result}...`);
}
async function verify(world, apiKey, contractName, buildInfoName, address) {
    let contractAddress = address;
    let { networkContracts, version } = await Contract_1.getNetworkContracts(world);
    let networkContract = networkContracts[buildInfoName];
    if (!networkContract) {
        throw new Error(`Cannot find contract ${buildInfoName}, found: ${Object.keys(networkContracts)}`);
    }
    let sourceCode = await truffle_flattener_1.default([networkContract.path]);
    let compilerVersion = version.replace(/(\.Emscripten)|(\.clang)|(\.Darwin)|(\.appleclang)/gi, '');
    let constructorAbi = getConstructorABI(world, contractName);
    let url = getUrl(world.network);
    const verifyData = {
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: contractAddress,
        sourceCode: sourceCode,
        contractname: buildInfoName,
        compilerversion: `v${compilerVersion}`,
        optimizationUsed: '1',
        runs: '200',
        constructorArguements: constructorAbi.slice(2)
    };
    world.printer.printLine(`Verifying ${contractName} at ${address} with compiler version ${compilerVersion}...`);
    // Potential results
    // {"status":"0","message":"NOTOK","result":"Invalid constructor arguments provided. Please verify that they are in ABI-encoded format"}
    // {"status":"1","message":"OK","result":"usjpiyvmxtgwyee59wnycyiet7m3dba4ccdi6acdp8eddlzdde"}
    let result = await post(url, verifyData);
    if (Number(result.status) === 0 || result.message !== "OK") {
        if (result.result.includes('Contract source code already verified')) {
            world.printer.printLine(`Contract already verified`);
        }
        else {
            throw new Error(`Etherscan Error: ${result.message}: ${result.result}`);
        }
    }
    else {
        return await checkStatus(world, url, result.result);
    }
}
exports.verify = verify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSxzREFBOEI7QUFFOUIsMEVBQWlEO0FBQ2pELHlDQUErQztBQWEvQyxTQUFTLE1BQU0sQ0FBQyxPQUFlO0lBQzdCLElBQUksSUFBSSxHQUFHO1FBQ1QsS0FBSyxFQUFFLHdCQUF3QjtRQUMvQixPQUFPLEVBQUUsMEJBQTBCO1FBQ25DLE9BQU8sRUFBRSwwQkFBMEI7UUFDbkMsTUFBTSxFQUFFLHlCQUF5QjtRQUNqQyxPQUFPLEVBQUUsa0JBQWtCO0tBQzVCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFWCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUN0RTtJQUVELE9BQU8sV0FBVyxJQUFJLE1BQU0sQ0FBQztBQUMvQixDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxLQUFZLEVBQUUsWUFBb0I7SUFDM0QsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztJQUVqRixJQUFJLENBQUMsY0FBYyxFQUFFO1FBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLFlBQVksT0FBTyxLQUFLLENBQUMsT0FBTyx3QkFBd0IsQ0FBQyxDQUFDO0tBQzFHO0lBRUQsT0FBTyxjQUFjLENBQUM7QUFDeEIsQ0FBQztBQUVELFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJO0lBQ3JCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFFLENBQUMsR0FBRyxFQUFFLFlBQVksRUFB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SUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLElBQUksRUFBRTtRQUMxRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHVDQUF1QyxDQUFDLEVBQUU7WUFDbkUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUN0RDthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsTUFBTSxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtTQUN4RTtLQUNGO1NBQU07UUFDTCxPQUFPLE1BQU0sV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3JEO0FBQ0gsQ0FBQztBQTFDRCx3QkEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1dvcmxkfSBmcm9tICcuL1dvcmxkJztcbmltcG9ydCB7cmVhZEZpbGV9IGZyb20gJy4vRmlsZSc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdHJ1ZmZsZUZsYXR0ZW5lciBmcm9tICd0cnVmZmxlLWZsYXR0ZW5lcic7XG5pbXBvcnQge2dldE5ldHdvcmtDb250cmFjdHN9IGZyb20gJy4vQ29udHJhY3QnO1xuXG5pbnRlcmZhY2UgRGV2RG9jIHtcbiAgYXV0aG9yOiBzdHJpbmdcbiAgbWV0aG9kczogb2JqZWN0XG4gIHRpdGxlOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIFVzZXJEb2Mge1xuICBtZXRob2RzOiBvYmplY3RcbiAgbm90aWNlOiBzdHJpbmdcbn1cblxuZnVuY3Rpb24gZ2V0VXJsKG5ldHdvcms6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBob3N0ID0ge1xuICAgIGtvdmFuOiAnYXBpLWtvdmFuLmV0aGVyc2Nhbi5pbycsXG4gICAgcmlua2VieTogJ2FwaS1yaW5rZWJ5LmV0aGVyc2Nhbi5pbycsXG4gICAgcm9wc3RlbjogJ2FwaS1yb3BzdGVuLmV0aGVyc2Nhbi5pbycsXG4gICAgZ29lcmxpOiAnYXBpLWdvZXJsaS5ldGhlcnNjYW4uaW8nLFxuICAgIG1haW5uZXQ6ICdhcGkuZXRoZXJzY2FuLmlvJ1xuICB9W25ldHdvcmtdO1xuXG4gIGlmICghaG9zdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBldGhlcnNjYW4gQVBJIGhvc3QgZm9yIG5ldHdvcmsgJHtuZXR3b3JrfWApO1xuICB9XG5cbiAgcmV0dXJuIGBodHRwczovLyR7aG9zdH0vYXBpYDtcbn1cblxuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3JBQkkod29ybGQ6IFdvcmxkLCBjb250cmFjdE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBjb25zdHJ1Y3RvckFiaSA9IHdvcmxkLmdldEluKFsnY29udHJhY3REYXRhJywgJ0NvbnN0cnVjdG9ycycsIGNvbnRyYWN0TmFtZV0pO1xuXG4gIGlmICghY29uc3RydWN0b3JBYmkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gQ29uc3RydWN0b3IgQUJJIGZvciAke2NvbnRyYWN0TmFtZX0gb24gJHt3b3JsZC5uZXR3b3JrfS4gVHJ5IGRlcGxveWluZyBhZ2Fpbj9gKTtcbiAgfVxuXG4gIHJldHVybiBjb25zdHJ1Y3RvckFiaTtcbn1cblxuZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEpOiBQcm9taXNlPG9iamVjdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcXVlc3QucG9zdCh1cmwsIHtmb3JtOiBkYXRhfSwgKGVyciwgaHR0cFJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKGJvZHkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldCh1cmwsIGRhdGEpOiBQcm9taXNlPG9iamVjdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlcXVlc3QuZ2V0KHVybCwge2Zvcm06IGRhdGF9LCAoZXJyLCBodHRwUmVzcG9uc2UsIGJvZHkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UoYm9keSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuaW50ZXJmYWNlIFJlc3VsdCB7XG4gIHN0YXR1czogc3RyaW5nXG4gIG1lc3NhZ2U6IHN0cmluZ1xuICByZXN1bHQ6IHN0cmluZ1xufVxuXG5hc3luYyBmdW5jdGlvbiBzbGVlcCh0aW1lb3V0KTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgX3JlamVjdCkgPT4ge1xuICAgIHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZSgpLCB0aW1lb3V0KTtcbiAgfSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tTdGF0dXMod29ybGQ6IFdvcmxkLCB1cmw6IHN0cmluZywgdG9rZW46IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICB3b3JsZC5wcmludGVyLnByaW50TGluZShgQ2hlY2tpbmcgc3RhdHVzIG9mICR7dG9rZW59Li4uYCk7XG5cbiAgLy8gUG90ZW50aWFsIHJlc3VsdHM6XG4gIC8vIHsgc3RhdHVzOiAnMCcsIG1lc3NhZ2U6ICdOT1RPSycsIHJlc3VsdDogJ0ZhaWwgLSBVbmFibGUgdG8gdmVyaWZ5JyB9XG4gIC8vIHsgc3RhdHVzOiAnMCcsIG1lc3NhZ2U6ICdOT1RPSycsIHJlc3VsdDogJ1BlbmRpbmcgaW4gcXVldWUnIH1cbiAgLy8geyBzdGF0dXM6ICcxJywgbWVzc2FnZTogJ09LJywgcmVzdWx0OiAnUGFzcyAtIFZlcmlmaWVkJyB9XG5cbiAgbGV0IHJlc3VsdDogUmVzdWx0ID0gPFJlc3VsdD5hd2FpdCBnZXQodXJsLCB7XG4gICAgZ3VpZDogdG9rZW4sXG4gICAgbW9kdWxlOiBcImNvbnRyYWN0XCIsXG4gICAgYWN0aW9uOiBcImNoZWNrdmVyaWZ5c3RhdHVzXCJcbiAgfSk7XG5cbiAgaWYgKHdvcmxkLnZlcmJvc2UpIHtcbiAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICB9XG5cbiAgaWYgKHJlc3VsdC5yZXN1bHQgPT09IFwiUGVuZGluZyBpbiBxdWV1ZVwiKSB7XG4gICAgYXdhaXQgc2xlZXAoNTAwMCk7XG4gICAgcmV0dXJuIGF3YWl0IGNoZWNrU3RhdHVzKHdvcmxkLCB1cmwsIHRva2VuKTtcbiAgfVxuXG4gIGlmIChyZXN1bHQucmVzdWx0LnN0YXJ0c1dpdGgoJ0ZhaWwnKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXRoZXJzY2FuIGZhaWxlZCB0byB2ZXJpZnkgY29udHJhY3Q6ICR7cmVzdWx0Lm1lc3NhZ2V9IFwiJHtyZXN1bHQucmVzdWx0fVwiYClcbiAgfVxuXG4gIGlmIChOdW1iZXIocmVzdWx0LnN0YXR1cykgIT09IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV0aGVyc2NhbiBFcnJvcjogJHtyZXN1bHQubWVzc2FnZX0gXCIke3Jlc3VsdC5yZXN1bHR9XCJgKVxuICB9XG5cbiAgd29ybGQucHJpbnRlci5wcmludExpbmUoYFZlcmlmaWNhdGlvbiByZXN1bHQgJHtyZXN1bHQucmVzdWx0fS4uLmApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5KHdvcmxkOiBXb3JsZCwgYXBpS2V5OiBzdHJpbmcsIGNvbnRyYWN0TmFtZTogc3RyaW5nLCBidWlsZEluZm9OYW1lOiBzdHJpbmcsIGFkZHJlc3M6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgY29udHJhY3RBZGRyZXNzOiBzdHJpbmcgPSBhZGRyZXNzO1xuICBsZXQge25ldHdvcmtDb250cmFjdHMsIHZlcnNpb259ID0gYXdhaXQgZ2V0TmV0d29ya0NvbnRyYWN0cyh3b3JsZCk7XG4gIGxldCBuZXR3b3JrQ29udHJhY3QgPSBuZXR3b3JrQ29udHJhY3RzW2J1aWxkSW5mb05hbWVdO1xuICBpZiAoIW5ldHdvcmtDb250cmFjdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgY29udHJhY3QgJHtidWlsZEluZm9OYW1lfSwgZm91bmQ6ICR7T2JqZWN0LmtleXMobmV0d29ya0NvbnRyYWN0cyl9YClcbiAgfVxuICBsZXQgc291cmNlQ29kZTogc3RyaW5nID0gYXdhaXQgdHJ1ZmZsZUZsYXR0ZW5lcihbbmV0d29ya0NvbnRyYWN0LnBhdGhdKTtcbiAgbGV0IGNvbXBpbGVyVmVyc2lvbjogc3RyaW5nID0gdmVyc2lvbi5yZXBsYWNlKC8oXFwuRW1zY3JpcHRlbil8KFxcLmNsYW5nKXwoXFwuRGFyd2luKXwoXFwuYXBwbGVjbGFuZykvZ2ksICcnKTtcbiAgbGV0IGNvbnN0cnVjdG9yQWJpID0gZ2V0Q29uc3RydWN0b3JBQkkod29ybGQsIGNvbnRyYWN0TmFtZSk7XG4gIGxldCB1cmwgPSBnZXRVcmwod29ybGQubmV0d29yayk7XG5cbiAgY29uc3QgdmVyaWZ5RGF0YTogb2JqZWN0ID0ge1xuICAgIGFwaWtleTogYXBpS2V5LFxuICAgIG1vZHVsZTogJ2NvbnRyYWN0JyxcbiAgICBhY3Rpb246ICd2ZXJpZnlzb3VyY2Vjb2RlJyxcbiAgICBjb250cmFjdGFkZHJlc3M6IGNvbnRyYWN0QWRkcmVzcyxcbiAgICBzb3VyY2VDb2RlOiBzb3VyY2VDb2RlLFxuICAgIGNvbnRyYWN0bmFtZTogYnVpbGRJbmZvTmFtZSxcbiAgICBjb21waWxlcnZlcnNpb246IGB2JHtjb21waWxlclZlcnNpb259YCxcbiAgICBvcHRpbWl6YXRpb25Vc2VkOiAnMScsXG4gICAgcnVuczogJzIwMCcsXG4gICAgY29uc3RydWN0b3JBcmd1ZW1lbnRzOiBjb25zdHJ1Y3RvckFiaS5zbGljZSgyKVxuICB9O1xuXG4gIHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKGBWZXJpZnlpbmcgJHtjb250cmFjdE5hbWV9IGF0ICR7YWRkcmVzc30gd2l0aCBjb21waWxlciB2ZXJzaW9uICR7Y29tcGlsZXJWZXJzaW9ufS4uLmApO1xuXG4gIC8vIFBvdGVudGlhbCByZXN1bHRzXG4gIC8vIHtcInN0YXR1c1wiOlwiMFwiLFwibWVzc2FnZVwiOlwiTk9UT0tcIixcInJlc3VsdFwiOlwiSW52YWxpZCBjb25zdHJ1Y3RvciBhcmd1bWVudHMgcHJvdmlkZWQuIFBsZWFzZSB2ZXJpZnkgdGhhdCB0aGV5IGFyZSBpbiBBQkktZW5jb2RlZCBmb3JtYXRcIn1cbiAgLy8ge1wic3RhdHVzXCI6XCIxXCIsXCJtZXNzYWdlXCI6XCJPS1wiLFwicmVzdWx0XCI6XCJ1c2pwaXl2bXh0Z3d5ZWU1OXdueWN5aWV0N20zZGJhNGNjZGk2YWNkcDhlZGRsemRkZVwifVxuXG4gIGxldCByZXN1bHQ6IFJlc3VsdCA9IDxSZXN1bHQ+YXdhaXQgcG9zdCh1cmwsIHZlcmlmeURhdGEpO1xuXG4gIGlmIChOdW1iZXIocmVzdWx0LnN0YXR1cykgPT09IDAgfHwgcmVzdWx0Lm1lc3NhZ2UgIT09IFwiT0tcIikge1xuICAgIGlmIChyZXN1bHQucmVzdWx0LmluY2x1ZGVzKCdDb250cmFjdCBzb3VyY2UgY29kZSBhbHJlYWR5IHZlcmlmaWVkJykpIHtcbiAgICAgIHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKGBDb250cmFjdCBhbHJlYWR5IHZlcmlmaWVkYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXRoZXJzY2FuIEVycm9yOiAke3Jlc3VsdC5tZXNzYWdlfTogJHtyZXN1bHQucmVzdWx0fWApXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBhd2FpdCBjaGVja1N0YXR1cyh3b3JsZCwgdXJsLCByZXN1bHQucmVzdWx0KTtcbiAgfVxufVxuIl19
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkContracts = exports.decodeCall = exports.getPastEvents = exports.setContractName = exports.getTestContract = exports.getContract = void 0;
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const Invokation_1 = require("./Invokation");
const File_1 = require("./File");
function randomAddress() {
    return crypto.randomBytes(20).toString('hex');
}
class ContractStub {
    constructor(name, test) {
        this.name = name;
        this.test = test;
    }
    async deploy(world, from, args) {
        // XXXS Consider opts
        // ( world.web3.currentProvider && typeof(world.web3.currentProvider) !== 'string' && world.web3.currentProvider.opts ) || 
        const opts = { from: from };
        let invokationOpts = world.getInvokationOpts(opts);
        const networkContractABI = await world.saddle.abi(this.name);
        const constructorAbi = networkContractABI.find((x) => x.type === 'constructor');
        let inputs;
        if (constructorAbi) {
            inputs = constructorAbi.inputs;
        }
        else {
            inputs = [];
        }
        try {
            let contract;
            let receipt;
            if (world.dryRun) {
                let addr = randomAddress();
                console.log(`Dry run: Deploying ${this.name} at fake address ${addr}`);
                contract = new world.web3.eth.Contract(networkContractABI, addr);
                receipt = {
                    blockNumber: -1,
                    transactionHash: "0x",
                    events: {}
                };
            }
            else {
                ({ contract, receipt } = await world.saddle.deployFull(this.name, args, invokationOpts, world.web3));
                contract.constructorAbi = world.web3.eth.abi.encodeParameters(inputs, args);
                ;
            }
            return new Invokation_1.Invokation(contract, receipt, null, null);
        }
        catch (err) {
            return new Invokation_1.Invokation(null, null, err, null);
        }
    }
    async at(world, address) {
        const networkContractABI = await world.saddle.abi(this.name);
        // XXXS unknown?
        return (new world.web3.eth.Contract(networkContractABI, address));
    }
}
function getContract(name) {
    return new ContractStub(name, false);
}
exports.getContract = getContract;
function getTestContract(name) {
    return new ContractStub(name, true);
}
exports.getTestContract = getTestContract;
function setContractName(name, contract) {
    contract.name = name;
    return contract;
}
exports.setContractName = setContractName;
async function getPastEvents(world, contract, name, event, filter = {}) {
    const block = world.getIn(['contractData', 'Blocks', name]);
    if (!block) {
        throw new Error(`Cannot get events when missing deploy block for ${name}`);
    }
    return await contract.getPastEvents(event, { filter: filter, fromBlock: block, toBlock: 'latest' });
}
exports.getPastEvents = getPastEvents;
async function decodeCall(world, contract, input) {
    if (input.slice(0, 2) === '0x') {
        input = input.slice(2);
    }
    let functionSignature = input.slice(0, 8);
    let argsEncoded = input.slice(8);
    let funsMapped = contract._jsonInterface.reduce((acc, fun) => {
        if (fun.type === 'function') {
            let functionAbi = `${fun.name}(${(fun.inputs || []).map((i) => i.type).join(',')})`;
            let sig = world.web3.utils.sha3(functionAbi).slice(2, 10);
            return {
                ...acc,
                [sig]: fun
            };
        }
        else {
            return acc;
        }
    }, {});
    let abi = funsMapped[functionSignature];
    if (!abi) {
        throw new Error(`Cannot find function matching signature ${functionSignature}`);
    }
    let decoded = world.web3.eth.abi.decodeParameters(abi.inputs, argsEncoded);
    const args = abi.inputs.map((input) => {
        return `${input.name}=${decoded[input.name]}`;
    });
    world.printer.printLine(`\n${contract.name}.${abi.name}(\n\t${args.join("\n\t")}\n)`);
    return world;
}
exports.decodeCall = decodeCall;
// XXXS Handle
async function getNetworkContract(world, name) {
    let basePath = world.basePath || "";
    let network = world.network || "";
    let pizath = (name, ext) => path.join(basePath, '.build', `contracts.json`);
    let abi, bin;
    if (network == 'coverage') {
        let json = await File_1.readFile(world, pizath(name, 'json'), null, JSON.parse);
        abi = json.abi;
        bin = json.bytecode.substr(2);
    }
    else {
        let { networkContracts } = await getNetworkContracts(world);
        let networkContract = networkContracts[name];
        abi = JSON.parse(networkContract.abi);
        bin = networkContract.bin;
    }
    if (!bin) {
        throw new Error(`no bin for contract ${name} ${network}`);
    }
    return {
        abi: abi,
        bin: bin
    };
}
async function getNetworkContracts(world) {
    let basePath = world.basePath || "";
    let network = world.network || "";
    let contractsPath = path.join(basePath, '.build', `contracts.json`);
    let fullContracts = await File_1.readFile(world, contractsPath, null, JSON.parse);
    let version = fullContracts.version;
    let networkContracts = Object.entries(fullContracts.contracts).reduce((acc, [k, v]) => {
        let [path, contractName] = k.split(':');
        return {
            ...acc,
            [contractName]: {
                ...v,
                path: path
            }
        };
    }, {});
    return {
        networkContracts,
        version
    };
}
exports.getNetworkContracts = getNetworkContracts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvQ29udHJhY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUE2QjtBQUM3QiwrQ0FBaUM7QUFFakMsNkNBQTBDO0FBQzFDLGlDQUFrQztBQThCbEMsU0FBUyxhQUFhO0lBQ3BCLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVELE1BQU0sWUFBWTtJQUloQixZQUFZLElBQVksRUFBRSxJQUFhO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFJLEtBQVksRUFBRSxJQUFZLEVBQUUsSUFBVztRQUNyRCxxQkFBcUI7UUFDckIsMkhBQTJIO1FBQzNILE1BQU0sSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1FBRTVCLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRCxNQUFNLGtCQUFrQixHQUFHLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdELE1BQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsQ0FBQztRQUNoRixJQUFJLE1BQU0sQ0FBQztRQUVYLElBQUksY0FBYyxFQUFFO1lBQ2xCLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1NBQ2hDO2FBQU07WUFDTCxNQUFNLEdBQUcsRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJ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QUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNwRixJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFeEMsT0FBTztZQUNMLEdBQUcsR0FBRztZQUNOLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ2QsR0FBVyxDQUFDO2dCQUNaLElBQUksRUFBRSxJQUFJO2FBQ1g7U0FDRixDQUFDO0lBQ0osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRVAsT0FBTztRQUNMLGdCQUFnQjtRQUNoQixPQUFPO0tBQ1IsQ0FBQztBQUNKLENBQUM7QUF2QkQsa0RBdUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgV29ybGQgfSBmcm9tICcuL1dvcmxkJztcbmltcG9ydCB7IEludm9rYXRpb24gfSBmcm9tICcuL0ludm9rYXRpb24nO1xuaW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tICcuL0ZpbGUnO1xuaW1wb3J0IHsgQWJpSXRlbSB9IGZyb20gJ3dlYjMtdXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJhdyB7XG4gIGRhdGE6IHN0cmluZ1xuICB0b3BpY3M6IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnQge1xuICBldmVudDogc3RyaW5nXG4gIHNpZ25hdHVyZTogc3RyaW5nIHwgbnVsbFxuICBhZGRyZXNzOiBzdHJpbmdcbiAgcmV0dXJuVmFsdWVzOiBvYmplY3RcbiAgbG9nSW5kZXg6IG51bWJlclxuICB0cmFuc2FjdGlvbkluZGV4OiBudW1iZXJcbiAgYmxvY2tIYXNoOiBzdHJpbmdcbiAgYmxvY2tOdW1iZXI6IG51bWJlclxuICByYXc6IFJhd1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRyYWN0IHtcbiAgYWRkcmVzczogc3RyaW5nXG4gIF9hZGRyZXNzOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIG1ldGhvZHM6IGFueVxuICBfanNvbkludGVyZmFjZTogQWJpSXRlbVtdXG4gIGNvbnN0cnVjdG9yQWJpPzogc3RyaW5nXG4gIGdldFBhc3RFdmVudHM6IChldmVudDogc3RyaW5nLCBvcHRpb25zOiB7IGZpbHRlcjogb2JqZWN0LCBmcm9tQmxvY2s6IG51bWJlciwgdG9CbG9jazogbnVtYmVyIHwgc3RyaW5nIH0pID0+IEV2ZW50W11cbn1cblxuZnVuY3Rpb24gcmFuZG9tQWRkcmVzcygpOiBzdHJpbmcge1xuICByZXR1cm4gY3J5cHRvLnJhbmRvbUJ5dGVzKDIwKS50b1N0cmluZygnaGV4Jyk7XG59XG5cbmNsYXNzIENvbnRyYWN0U3R1YiB7XG4gIG5hbWU6IHN0cmluZztcbiAgdGVzdDogYm9vbGVhblxuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdGVzdDogYm9vbGVhbikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy50ZXN0ID0gdGVzdDtcbiAgfVxuXG4gIGFzeW5jIGRlcGxveTxUPih3b3JsZDogV29ybGQsIGZyb206IHN0cmluZywgYXJnczogYW55W10pOiBQcm9taXNlPEludm9rYXRpb248VD4+IHtcbiAgICAvLyBYWFhTIENvbnNpZGVyIG9wdHNcbiAgICAvLyAoIHdvcmxkLndlYjMuY3VycmVudFByb3ZpZGVyICYmIHR5cGVvZih3b3JsZC53ZWIzLmN1cnJlbnRQcm92aWRlcikgIT09ICdzdHJpbmcnICYmIHdvcmxkLndlYjMuY3VycmVudFByb3ZpZGVyLm9wdHMgKSB8fCBcbiAgICBjb25zdCBvcHRzID0geyBmcm9tOiBmcm9tIH07XG5cbiAgICBsZXQgaW52b2thdGlvbk9wdHMgPSB3b3JsZC5nZXRJbnZva2F0aW9uT3B0cyhvcHRzKTtcblxuICAgIGNvbnN0IG5ldHdvcmtDb250cmFjdEFCSSA9IGF3YWl0IHdvcmxkLnNhZGRsZS5hYmkodGhpcy5uYW1lKTtcbiAgICBjb25zdCBjb25zdHJ1Y3RvckFiaSA9IG5ldHdvcmtDb250cmFjdEFCSS5maW5kKCh4KSA9PiB4LnR5cGUgPT09ICdjb25zdHJ1Y3RvcicpO1xuICAgIGxldCBpbnB1dHM7XG5cbiAgICBpZiAoY29uc3RydWN0b3JBYmkpIHtcbiAgICAgIGlucHV0cyA9IGNvbnN0cnVjdG9yQWJpLmlucHV0cztcbiAgICB9IGVsc2Uge1xuICAgICAgaW5wdXRzID0gW107XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGxldCBjb250cmFjdDtcbiAgICAgIGxldCByZWNlaXB0O1xuXG4gICAgICBpZiAod29ybGQuZHJ5UnVuKSB7XG4gICAgICAgIGxldCBhZGRyID0gcmFuZG9tQWRkcmVzcygpO1xuICAgICAgICBjb25zb2xlLmxvZyhgRHJ5IHJ1bjogRGVwbG95aW5nICR7dGhpcy5uYW1lfSBhdCBmYWtlIGFkZHJlc3MgJHthZGRyfWApO1xuICAgICAgICBjb250cmFjdCA9IG5ldyB3b3JsZC53ZWIzLmV0aC5Db250cmFjdCg8YW55Pm5ldHdvcmtDb250cmFjdEFCSSwgYWRkcilcbiAgICAgICAgcmVjZWlwdCA9IHtcbiAgICAgICAgICBibG9ja051bWJlcjogLTEsXG4gICAgICAgICAgdHJhbnNhY3Rpb25IYXNoOiBcIjB4XCIsXG4gICAgICAgICAgZXZlbnRzOiB7fVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgKHsgY29udHJhY3QsIHJlY2VpcHQgfSA9IGF3YWl0IHdvcmxkLnNhZGRsZS5kZXBsb3lGdWxsKHRoaXMubmFtZSwgYXJncywgaW52b2thdGlvbk9wdHMsIHdvcmxkLndlYjMpKTtcbiAgICAgICAgY29udHJhY3QuY29uc3RydWN0b3JBYmkgPSB3b3JsZC53ZWIzLmV0aC5hYmkuZW5jb2RlUGFyYW1ldGVycyhpbnB1dHMsIGFyZ3MpOztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBJbnZva2F0aW9uPFQ+KGNvbnRyYWN0LCByZWNlaXB0LCBudWxsLCBudWxsKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiBuZXcgSW52b2thdGlvbjxUPihudWxsLCBudWxsLCBlcnIsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGF0PFQ+KHdvcmxkOiBXb3JsZCwgYWRkcmVzczogc3RyaW5nKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgbmV0d29ya0NvbnRyYWN0QUJJID0gYXdhaXQgd29ybGQuc2FkZGxlLmFiaSh0aGlzLm5hbWUpO1xuXG4gICAgLy8gWFhYUyB1bmtub3duP1xuICAgIHJldHVybiA8VD48dW5rbm93bj4obmV3IHdvcmxkLndlYjMuZXRoLkNvbnRyYWN0KDxhbnk+bmV0d29ya0NvbnRyYWN0QUJJLCBhZGRyZXNzKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRyYWN0KG5hbWU6IHN0cmluZyk6IENvbnRyYWN0U3R1YiB7XG4gIHJldHVybiBuZXcgQ29udHJhY3RTdHViKG5hbWUsIGZhbHNlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlc3RDb250cmFjdChuYW1lOiBzdHJpbmcpOiBDb250cmFjdFN0dWIge1xuICByZXR1cm4gbmV3IENvbnRyYWN0U3R1YihuYW1lLCB0cnVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENvbnRyYWN0TmFtZShuYW1lOiBzdHJpbmcsIGNvbnRyYWN0OiBDb250cmFjdCk6IENvbnRyYWN0IHtcbiAgY29udHJhY3QubmFtZSA9IG5hbWU7XG5cbiAgcmV0dXJuIGNvbnRyYWN0O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGFzdEV2ZW50cyh3b3JsZDogV29ybGQsIGNvbnRyYWN0OiBDb250cmFjdCwgbmFtZTogc3RyaW5nLCBldmVudDogc3RyaW5nLCBmaWx0ZXI6IG9iamVjdCA9IHt9KTogUHJvbWlzZTxFdmVudFtdPiB7XG4gIGNvbnN0IGJsb2NrID0gd29ybGQuZ2V0SW4oWydjb250cmFjdERhdGEnLCAnQmxvY2tzJywgbmFtZV0pO1xuICBpZiAoIWJsb2NrKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZ2V0IGV2ZW50cyB3aGVuIG1pc3NpbmcgZGVwbG95IGJsb2NrIGZvciAke25hbWV9YCk7XG4gIH1cblxuICByZXR1cm4gYXdhaXQgY29udHJhY3QuZ2V0UGFzdEV2ZW50cyhldmVudCwgeyBmaWx0ZXI6IGZpbHRlciwgZnJvbUJsb2NrOiBibG9jaywgdG9CbG9jazogJ2xhdGVzdCcgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNvZGVDYWxsKHdvcmxkOiBXb3JsZCwgY29udHJhY3Q6IENvbnRyYWN0LCBpbnB1dDogc3RyaW5nKTogUHJvbWlzZTxXb3JsZD4ge1xuICBpZiAoaW5wdXQuc2xpY2UoMCwgMikgPT09ICcweCcpIHtcbiAgICBpbnB1dCA9IGlucHV0LnNsaWNlKDIpO1xuICB9XG5cbiAgbGV0IGZ1bmN0aW9uU2lnbmF0dXJlID0gaW5wdXQuc2xpY2UoMCwgOCk7XG4gIGxldCBhcmdzRW5jb2RlZCA9IGlucHV0LnNsaWNlKDgpO1xuXG4gIGxldCBmdW5zTWFwcGVkID0gY29udHJhY3QuX2pzb25JbnRlcmZhY2UucmVkdWNlKChhY2MsIGZ1bikgPT4ge1xuICAgIGlmIChmdW4udHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGV0IGZ1bmN0aW9uQWJpID0gYCR7ZnVuLm5hbWV9KCR7KGZ1bi5pbnB1dHMgfHwgW10pLm1hcCgoaSkgPT4gaS50eXBlKS5qb2luKCcsJyl9KWA7XG4gICAgICBsZXQgc2lnID0gd29ybGQud2ViMy51dGlscy5zaGEzKGZ1bmN0aW9uQWJpKS5zbGljZSgyLCAxMCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmFjYyxcbiAgICAgICAgW3NpZ106IGZ1blxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9XG4gIH0sIHt9KTtcblxuICBsZXQgYWJpID0gZnVuc01hcHBlZFtmdW5jdGlvblNpZ25hdHVyZV07XG5cbiAgaWYgKCFhYmkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGZ1bmN0aW9uIG1hdGNoaW5nIHNpZ25hdHVyZSAke2Z1bmN0aW9uU2lnbmF0dXJlfWApO1xuICB9XG5cbiAgbGV0IGRlY29kZWQgPSB3b3JsZC53ZWIzLmV0aC5hYmkuZGVjb2RlUGFyYW1ldGVycyhhYmkuaW5wdXRzLCBhcmdzRW5jb2RlZCk7XG5cbiAgY29uc3QgYXJncyA9IGFiaS5pbnB1dHMubWFwKChpbnB1dCkgPT4ge1xuICAgIHJldHVybiBgJHtpbnB1dC5uYW1lfT0ke2RlY29kZWRbaW5wdXQubmFtZV19YDtcbiAgfSk7XG4gIHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKGBcXG4ke2NvbnRyYWN0Lm5hbWV9LiR7YWJpLm5hbWV9KFxcblxcdCR7YXJncy5qb2luKFwiXFxuXFx0XCIpfVxcbilgKTtcblxuICByZXR1cm4gd29ybGQ7XG59XG5cbi8vIFhYWFMgSGFuZGxlXG5hc3luYyBmdW5jdGlvbiBnZXROZXR3b3JrQ29udHJhY3Qod29ybGQ6IFdvcmxkLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHsgYWJpOiBhbnlbXSwgYmluOiBzdHJpbmcgfT4ge1xuICBsZXQgYmFzZVBhdGggPSB3b3JsZC5iYXNlUGF0aCB8fCBcIlwiXG4gIGxldCBuZXR3b3JrID0gd29ybGQubmV0d29yayB8fCBcIlwiXG5cbiAgbGV0IHBpemF0aCA9IChuYW1lLCBleHQpID0+IHBhdGguam9pbihiYXNlUGF0aCwgJy5idWlsZCcsIGBjb250cmFjdHMuanNvbmApO1xuICBsZXQgYWJpLCBiaW47XG4gIGlmIChuZXR3b3JrID09ICdjb3ZlcmFnZScpIHtcbiAgICBsZXQganNvbiA9IGF3YWl0IHJlYWRGaWxlKHdvcmxkLCBwaXphdGgobmFtZSwgJ2pzb24nKSwgbnVsbCwgSlNPTi5wYXJzZSk7XG4gICAgYWJpID0ganNvbi5hYmk7XG4gICAgYmluID0ganNvbi5ieXRlY29kZS5zdWJzdHIoMik7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHsgbmV0d29ya0NvbnRyYWN0cyB9ID0gYXdhaXQgZ2V0TmV0d29ya0NvbnRyYWN0cyh3b3JsZCk7XG4gICAgbGV0IG5ldHdvcmtDb250cmFjdCA9IG5ldHdvcmtDb250cmFjdHNbbmFtZV07XG4gICAgYWJpID0gSlNPTi5wYXJzZShuZXR3b3JrQ29udHJhY3QuYWJpKTtcbiAgICBiaW4gPSBuZXR3b3JrQ29udHJhY3QuYmluO1xuICB9XG4gIGlmICghYmluKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBubyBiaW4gZm9yIGNvbnRyYWN0ICR7bmFtZX0gJHtuZXR3b3JrfWApXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhYmk6IGFiaSxcbiAgICBiaW46IGJpblxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROZXR3b3JrQ29udHJhY3RzKHdvcmxkOiBXb3JsZCk6IFByb21pc2U8eyBuZXR3b3JrQ29udHJhY3RzOiBvYmplY3QsIHZlcnNpb246IHN0cmluZyB9PiB7XG4gIGxldCBiYXNlUGF0aCA9IHdvcmxkLmJhc2VQYXRoIHx8IFwiXCJcbiAgbGV0IG5ldHdvcmsgPSB3b3JsZC5uZXR3b3JrIHx8IFwiXCJcblxuICBsZXQgY29udHJhY3RzUGF0aCA9IHBhdGguam9pbihiYXNlUGF0aCwgJy5idWlsZCcsIGBjb250cmFjdHMuanNvbmApXG4gIGxldCBmdWxsQ29udHJhY3RzID0gYXdhaXQgcmVhZEZpbGUod29ybGQsIGNvbnRyYWN0c1BhdGgsIG51bGwsIEpTT04ucGFyc2UpO1xuICBsZXQgdmVyc2lvbiA9IGZ1bGxDb250cmFjdHMudmVyc2lvbjtcbiAgbGV0IG5ldHdvcmtDb250cmFjdHMgPSBPYmplY3QuZW50cmllcyhmdWxsQ29udHJhY3RzLmNvbnRyYWN0cykucmVkdWNlKChhY2MsIFtrLCB2XSkgPT4ge1xuICAgIGxldCBbcGF0aCwgY29udHJhY3ROYW1lXSA9IGsuc3BsaXQoJzonKTtcblxuICAgIHJldHVybiB7XG4gICAgICAuLi5hY2MsXG4gICAgICBbY29udHJhY3ROYW1lXToge1xuICAgICAgICAuLi48b2JqZWN0PnYsIC8vLyBYWFhTIFRPRE9cbiAgICAgICAgcGF0aDogcGF0aFxuICAgICAgfVxuICAgIH07XG4gIH0sIHt9KTtcblxuICByZXR1cm4ge1xuICAgIG5ldHdvcmtDb250cmFjdHMsXG4gICAgdmVyc2lvblxuICB9O1xufVxuIl19
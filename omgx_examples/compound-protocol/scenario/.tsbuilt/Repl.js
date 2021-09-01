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
const Printer_1 = require("./Printer");
const World_1 = require("./World");
const Assert_1 = require("./Assert");
const Completer_1 = require("./Completer");
const Networks_1 = require("./Networks");
const Accounts_1 = require("./Accounts");
const File_1 = require("./File");
const HistoricReadline_1 = require("./HistoricReadline");
const Runner_1 = require("./Runner");
const Parser_1 = require("./Parser");
const Hypothetical_1 = require("./Hypothetical");
const eth_saddle_1 = require("eth-saddle");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const basePath = process.env.proj_root || process.cwd();
const baseScenarioPath = path.join(basePath, 'spec', 'scenario');
const baseNetworksPath = path.join(basePath, 'networks');
const TOTAL_GAS = 8000000;
function questionPromise(rl) {
    return new Promise((resolve, reject) => {
        rl.question(" > ", (command) => {
            resolve(command);
        });
    });
}
async function loop(world, rl, macros) {
    let command = await questionPromise(rl);
    try {
        let newWorld = await Runner_1.runCommand(world, command, macros);
        return await loop(newWorld, rl, macros);
    }
    catch (err) {
        world.printer.printError(err);
        return await loop(world, rl, macros);
    }
}
function loadEnvVars() {
    return (process.env['env_vars'] || '').split(',').reduce((acc, keyValue) => {
        if (keyValue.length === 0) {
            return acc;
        }
        else {
            const [key, value] = keyValue.split('=');
            return {
                ...acc,
                [key]: value
            };
        }
    }, {});
}
async function repl() {
    // Uck, we need to load core macros :(
    const coreMacros = fs.readFileSync(path.join(baseScenarioPath, 'CoreMacros'), 'utf8');
    const macros = Parser_1.parse(coreMacros, { startRule: 'macros' });
    let script = process.env['script'];
    let network = process.env['network'];
    if (!network) {
        throw new Error(`Missing required "network" env argument`);
    }
    let world;
    let rl = await HistoricReadline_1.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: (line) => Completer_1.complete(world, macros, line),
        path: File_1.getNetworkPath(basePath, network, '-history', null)
    });
    const verbose = !!process.env['verbose'];
    const hypothetical = !!process.env['hypothetical'];
    let printer = new Printer_1.ReplPrinter(rl, verbose);
    let contractInfo;
    let saddle = await eth_saddle_1.getSaddle(network);
    let accounts = saddle.wallet_accounts.concat(saddle.accounts).filter((x) => !!x);
    world = await World_1.initWorld(Assert_1.throwExpect, printer, saddle.web3, saddle, network, accounts, basePath, TOTAL_GAS);
    [world, contractInfo] = await Networks_1.loadContracts(world);
    world = World_1.loadInvokationOpts(world);
    world = World_1.loadVerbose(world);
    world = World_1.loadDryRun(world);
    world = await World_1.loadSettings(world);
    printer.printLine(`Network: ${network}`);
    if (hypothetical) {
        const forkJsonPath = path.join(baseNetworksPath, `${network}-fork.json`);
        let forkJson;
        try {
            let forkJsonString = fs.readFileSync(forkJsonPath, 'utf8');
            forkJson = JSON.parse(forkJsonString);
        }
        catch (err) {
            throw new Error(`Cannot read fork configuration from \`${forkJsonPath}\`, ${err}`);
        }
        if (!forkJson['url']) {
            throw new Error(`Missing url in fork json`);
        }
        if (!forkJson['unlocked'] || !Array.isArray(forkJson.unlocked)) {
            throw new Error(`Missing unlocked in fork json`);
        }
        saddle.web3 = await Hypothetical_1.forkWeb3(saddle.web3, forkJson.url, forkJson.unlocked);
        saddle.accounts = forkJson.unlocked;
        console.log(`Running on fork ${forkJson.url} with unlocked accounts ${forkJson.unlocked.join(', ')}`);
    }
    if (accounts.length > 0) {
        printer.printLine(`Accounts:`);
        accounts.forEach((account, i) => {
            let aliases = world.settings.lookupAliases(account);
            aliases = aliases.concat(Accounts_1.accountAliases(i));
            printer.printLine(`\t${account} (${aliases.join(',')})`);
        });
    }
    if (contractInfo.length > 0) {
        world.printer.printLine(`Contracts:`);
        contractInfo.forEach((info) => world.printer.printLine(`\t${info}`));
    }
    printer.printLine(`Available macros: ${Object.keys(macros).toString()}`);
    printer.printLine(``);
    if (script) {
        const combined = script.split(',').reduce((acc, script) => {
            printer.printLine(`Running script: ${script}...`);
            const envVars = loadEnvVars();
            if (hypothetical) {
                envVars['hypo'] = true;
            }
            const scriptData = fs.readFileSync(script).toString();
            if (Object.keys(envVars).length > 0) {
                printer.printLine(`Env Vars:`);
            }
            const replacedScript = Object.entries(envVars).reduce((data, [key, val]) => {
                printer.printLine(`\t${key}: ${val}`);
                return data.split(`$${key}`).join(val);
            }, scriptData);
            const finalScript = replacedScript.replace(new RegExp(/\$[\w_]+/, 'g'), 'Nothing');
            return [...acc, ...finalScript.split("\n")];
        }, []);
        return await combined.reduce(async (acc, command) => {
            return await Runner_1.runCommand(await acc, command, macros);
        }, Promise.resolve(world));
        printer.printLine(`Script complete.`);
    }
    else {
        await loop(world, rl, macros);
    }
}
repl().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9SZXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUFzQztBQUN0QyxtQ0FRaUI7QUFDakIscUNBQXFDO0FBR3JDLDJDQUFxQztBQUNyQyx5Q0FBeUM7QUFDekMseUNBQXdEO0FBQ3hELGlDQUFnRDtBQUVoRCx5REFBbUQ7QUFDbkQscUNBQW9DO0FBQ3BDLHFDQUErQjtBQUMvQixpREFBd0M7QUFDeEMsMkNBQXFDO0FBR3JDLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFN0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3hELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2pFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFekQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDO0FBRTFCLFNBQVMsZUFBZSxDQUFDLEVBQUU7SUFDekIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELEtBQUssVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNO0lBQ25DLElBQUksT0FBTyxHQUFHLE1BQU0sZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXhDLElBQUk7UUFDRixJQUFJLFFBQVEs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VyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRW5GLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDLEVBQVksRUFBRSxDQUFDLENBQUM7UUFFakIsT0FBTyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNsRCxPQUFPLE1BQU0sbUJBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEQsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMzQixPQUFPLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDdkM7U0FBTTtRQUNMLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDL0I7QUFDSCxDQUFDO0FBRUQsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDckIsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtSZXBsUHJpbnRlcn0gZnJvbSAnLi9QcmludGVyJztcbmltcG9ydCB7XG4gIGFkZEludmFyaWFudCxcbiAgaW5pdFdvcmxkLFxuICBsb2FkSW52b2thdGlvbk9wdHMsXG4gIGxvYWREcnlSdW4sXG4gIGxvYWRTZXR0aW5ncyxcbiAgbG9hZFZlcmJvc2UsXG4gIFdvcmxkXG59IGZyb20gJy4vV29ybGQnO1xuaW1wb3J0IHt0aHJvd0V4cGVjdH0gZnJvbSAnLi9Bc3NlcnQnO1xuaW1wb3J0IHtNYWNyb3N9IGZyb20gJy4vTWFjcm8nO1xuaW1wb3J0IHtmb3JtYXRFdmVudH0gZnJvbSAnLi9Gb3JtYXR0ZXInO1xuaW1wb3J0IHtjb21wbGV0ZX0gZnJvbSAnLi9Db21wbGV0ZXInO1xuaW1wb3J0IHtsb2FkQ29udHJhY3RzfSBmcm9tICcuL05ldHdvcmtzJztcbmltcG9ydCB7YWNjb3VudEFsaWFzZXMsIGxvYWRBY2NvdW50c30gZnJvbSAnLi9BY2NvdW50cyc7XG5pbXBvcnQge2dldE5ldHdvcmtQYXRoLCByZWFkRmlsZX0gZnJvbSAnLi9GaWxlJztcbmltcG9ydCB7U3VjY2Vzc0ludmFyaWFudH0gZnJvbSAnLi9JbnZhcmlhbnQvU3VjY2Vzc0ludmFyaWFudCc7XG5pbXBvcnQge2NyZWF0ZUludGVyZmFjZX0gZnJvbSAnLi9IaXN0b3JpY1JlYWRsaW5lJztcbmltcG9ydCB7cnVuQ29tbWFuZH0gZnJvbSAnLi9SdW5uZXInO1xuaW1wb3J0IHtwYXJzZX0gZnJvbSAnLi9QYXJzZXInO1xuaW1wb3J0IHtmb3JrV2ViM30gZnJvbSAnLi9IeXBvdGhldGljYWwnO1xuaW1wb3J0IHtnZXRTYWRkbGV9IGZyb20gJ2V0aC1zYWRkbGUnO1xuaW1wb3J0IFdlYjMgZnJvbSAnd2ViMyc7XG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmNvbnN0IGJhc2VQYXRoID0gcHJvY2Vzcy5lbnYucHJval9yb290IHx8IHByb2Nlc3MuY3dkKCk7XG5jb25zdCBiYXNlU2NlbmFyaW9QYXRoID0gcGF0aC5qb2luKGJhc2VQYXRoLCAnc3BlYycsICdzY2VuYXJpbycpO1xuY29uc3QgYmFzZU5ldHdvcmtzUGF0aCA9IHBhdGguam9pbihiYXNlUGF0aCwgJ25ldHdvcmtzJyk7XG5cbmNvbnN0IFRPVEFMX0dBUyA9IDgwMDAwMDA7XG5cbmZ1bmN0aW9uIHF1ZXN0aW9uUHJvbWlzZShybCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgcmwucXVlc3Rpb24oXCIgPiBcIiwgKGNvbW1hbmQpID0+IHtcbiAgICAgIHJlc29sdmUoY29tbWFuZCk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb29wKHdvcmxkLCBybCwgbWFjcm9zKTogUHJvbWlzZTxhbnk+IHtcbiAgbGV0IGNvbW1hbmQgPSBhd2FpdCBxdWVzdGlvblByb21pc2UocmwpO1xuXG4gIHRyeSB7XG4gICAgbGV0IG5ld1dvcmxkID0gYXdhaXQgcnVuQ29tbWFuZCh3b3JsZCwgY29tbWFuZCwgbWFjcm9zKTtcblxuICAgIHJldHVybiBhd2FpdCBsb29wKG5ld1dvcmxkLCBybCwgbWFjcm9zKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgd29ybGQucHJpbnRlci5wcmludEVycm9yKGVycik7XG4gICAgcmV0dXJuIGF3YWl0IGxvb3Aod29ybGQsIHJsLCBtYWNyb3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRFbnZWYXJzKCk6IG9iamVjdCB7XG4gIHJldHVybiAocHJvY2Vzcy5lbnZbJ2Vudl92YXJzJ10gfHwgJycpLnNwbGl0KCcsJykucmVkdWNlKChhY2MsIGtleVZhbHVlKSA9PiB7XG4gICAgaWYgKGtleVZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0ga2V5VmFsdWUuc3BsaXQoJz0nKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uYWNjLFxuICAgICAgICBba2V5XTogdmFsdWVcbiAgICAgIH07XG4gICAgfVxuICB9LCB7fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlcGwoKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIFVjaywgd2UgbmVlZCB0byBsb2FkIGNvcmUgbWFjcm9zIDooXG4gIGNvbnN0IGNvcmVNYWNyb3MgPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKGJhc2VTY2VuYXJpb1BhdGgsICdDb3JlTWFjcm9zJyksICd1dGY4Jyk7XG5cbiAgY29uc3QgbWFjcm9zID0gPE1hY3Jvcz5wYXJzZShjb3JlTWFjcm9zLCB7c3RhcnRSdWxlOiAnbWFjcm9zJ30pO1xuXG4gIGxldCBzY3JpcHQgPSBwcm9jZXNzLmVudlsnc2NyaXB0J107XG5cbiAgbGV0IG5ldHdvcmsgPSBwcm9jZXNzLmVudlsnbmV0d29yayddO1xuXG4gIGlmICghbmV0d29yaykge1xuICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyByZXF1aXJlZCBcIm5ldHdvcmtcIiBlbnYgYXJndW1lbnRgKTtcbiAgfVxuXG4gIGxldCB3b3JsZDtcblxuICBsZXQgcmwgPSBhd2FpdCBjcmVhdGVJbnRlcmZhY2Uoe1xuICAgIGlucHV0OiBwcm9jZXNzLnN0ZGluLFxuICAgIG91dHB1dDogcHJvY2Vzcy5zdGRvdXQsXG4gICAgY29tcGxldGVyOiAobGluZSkgPT4gY29tcGxldGUod29ybGQsIG1hY3JvcywgbGluZSksXG4gICAgcGF0aDogZ2V0TmV0d29ya1BhdGgoYmFzZVBhdGgsIG5ldHdvcmssICctaGlzdG9yeScsIG51bGwpXG4gIH0pO1xuXG4gIGNvbnN0IHZlcmJvc2U6IGJvb2xlYW4gPSAhIXByb2Nlc3MuZW52Wyd2ZXJib3NlJ107XG4gIGNvbnN0IGh5cG90aGV0aWNhbDogYm9vbGVhbiA9ICEhcHJvY2Vzcy5lbnZbJ2h5cG90aGV0aWNhbCddO1xuXG4gIGxldCBwcmludGVyID0gbmV3IFJlcGxQcmludGVyKHJsLCB2ZXJib3NlKTtcbiAgbGV0IGNvbnRyYWN0SW5mbzogc3RyaW5nW107XG5cbiAgbGV0IHNhZGRsZSA9IGF3YWl0IGdldFNhZGRsZShuZXR3b3JrKTtcbiAgbGV0IGFjY291bnRzOiBzdHJpbmdbXSA9IHNhZGRsZS53YWxsZXRfYWNjb3VudHMuY29uY2F0KHNhZGRsZS5hY2NvdW50cykuZmlsdGVyKCh4KSA9PiAhIXgpO1xuXG4gIHdvcmxkID0gYXdhaXQgaW5pdFdvcmxkKHRocm93RXhwZWN0LCBwcmludGVyLCBzYWRkbGUud2ViMywgc2FkZGxlLCBuZXR3b3JrLCBhY2NvdW50cywgYmFzZVBhdGgsIFRPVEFMX0dBUyk7XG4gIFt3b3JsZCwgY29udHJhY3RJbmZvXSA9IGF3YWl0IGxvYWRDb250cmFjdHMod29ybGQpO1xuICB3b3JsZCA9IGxvYWRJbnZva2F0aW9uT3B0cyh3b3JsZCk7XG4gIHdvcmxkID0gbG9hZFZlcmJvc2Uod29ybGQpO1xuICB3b3JsZCA9IGxvYWREcnlSdW4od29ybGQpO1xuICB3b3JsZCA9IGF3YWl0IGxvYWRTZXR0aW5ncyh3b3JsZCk7XG5cbiAgcHJpbnRlci5wcmludExpbmUoYE5ldHdvcms6ICR7bmV0d29ya31gKTtcblxuICBpZiAoaHlwb3RoZXRpY2FsKSB7XG4gICAgY29uc3QgZm9ya0pzb25QYXRoID0gcGF0aC5qb2luKGJhc2VOZXR3b3Jrc1BhdGgsIGAke25ldHdvcmt9LWZvcmsuanNvbmApO1xuICAgIGxldCBmb3JrSnNvbjtcblxuICAgIHRyeSB7XG4gICAgICBsZXQgZm9ya0pzb25TdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMoZm9ya0pzb25QYXRoLCAndXRmOCcpO1xuICAgICAgZm9ya0pzb24gPSBKU09OLnBhcnNlKGZvcmtKc29uU3RyaW5nKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlYWQgZm9yayBjb25maWd1cmF0aW9uIGZyb20gXFxgJHtmb3JrSnNvblBhdGh9XFxgLCAke2Vycn1gKTtcbiAgICB9XG4gICAgaWYgKCFmb3JrSnNvblsndXJsJ10pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyB1cmwgaW4gZm9yayBqc29uYCk7XG4gICAgfVxuICAgIGlmICghZm9ya0pzb25bJ3VubG9ja2VkJ10gfHwgIUFycmF5LmlzQXJyYXkoZm9ya0pzb24udW5sb2NrZWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE1pc3NpbmcgdW5sb2NrZWQgaW4gZm9yayBqc29uYCk7XG4gICAgfVxuXG4gICAgc2FkZGxlLndlYjMgPSBhd2FpdCBmb3JrV2ViMyhzYWRkbGUud2ViMywgZm9ya0pzb24udXJsLCBmb3JrSnNvbi51bmxvY2tlZCk7XG4gICAgc2FkZGxlLmFjY291bnRzID0gZm9ya0pzb24udW5sb2NrZWQ7XG4gICAgY29uc29sZS5sb2coYFJ1bm5pbmcgb24gZm9yayAke2ZvcmtKc29uLnVybH0gd2l0aCB1bmxvY2tlZCBhY2NvdW50cyAke2ZvcmtKc29uLnVubG9ja2VkLmpvaW4oJywgJyl9YClcbiAgfVxuXG4gIGlmIChhY2NvdW50cy5sZW5ndGggPiAwKSB7XG4gICAgcHJpbnRlci5wcmludExpbmUoYEFjY291bnRzOmApO1xuICAgIGFjY291bnRzLmZvckVhY2goKGFjY291bnQsIGkpID0+IHtcbiAgICAgIGxldCBhbGlhc2VzID0gd29ybGQuc2V0dGluZ3MubG9va3VwQWxpYXNlcyhhY2NvdW50KTtcbiAgICAgIGFsaWFzZXMgPSBhbGlhc2VzLmNvbmNhdChhY2NvdW50QWxpYXNlcyhpKSk7XG5cbiAgICAgIHByaW50ZXIucHJpbnRMaW5lKGBcXHQke2FjY291bnR9ICgke2FsaWFzZXMuam9pbignLCcpfSlgKVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKGNvbnRyYWN0SW5mby5sZW5ndGggPiAwKSB7XG4gICAgd29ybGQucHJpbnRlci5wcmludExpbmUoYENvbnRyYWN0czpgKTtcbiAgICBjb250cmFjdEluZm8uZm9yRWFjaCgoaW5mbykgPT4gd29ybGQucHJpbnRlci5wcmludExpbmUoYFxcdCR7aW5mb31gKSk7XG4gIH1cblxuICBwcmludGVyLnByaW50TGluZShgQXZhaWxhYmxlIG1hY3JvczogJHtPYmplY3Qua2V5cyhtYWNyb3MpLnRvU3RyaW5nKCl9YCk7XG4gIHByaW50ZXIucHJpbnRMaW5lKGBgKTtcblxuICBpZiAoc2NyaXB0KSB7XG4gICAgY29uc3QgY29tYmluZWQgPSBzY3JpcHQuc3BsaXQoJywnKS5yZWR1Y2UoKGFjYywgc2NyaXB0KSA9PiB7XG4gICAgICBwcmludGVyLnByaW50TGluZShgUnVubmluZyBzY3JpcHQ6ICR7c2NyaXB0fS4uLmApO1xuICAgICAgY29uc3QgZW52VmFycyA9IGxvYWRFbnZWYXJzKCk7XG4gICAgICBpZiAoaHlwb3RoZXRpY2FsKSB7XG4gICAgICAgIGVudlZhcnNbJ2h5cG8nXSA9IHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBzY3JpcHREYXRhOiBzdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMoc2NyaXB0KS50b1N0cmluZygpO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMoZW52VmFycykubGVuZ3RoID4gMCkge1xuICAgICAgICBwcmludGVyLnByaW50TGluZShgRW52IFZhcnM6YCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlcGxhY2VkU2NyaXB0ID0gT2JqZWN0LmVudHJpZXMoZW52VmFycykucmVkdWNlKChkYXRhLCBba2V5LCB2YWxdKSA9PiB7XG4gICAgICAgIHByaW50ZXIucHJpbnRMaW5lKGBcXHQke2tleX06ICR7dmFsfWApO1xuXG4gICAgICAgIHJldHVybiBkYXRhLnNwbGl0KGAkJHtrZXl9YCkuam9pbih2YWwpO1xuICAgICAgfSwgc2NyaXB0RGF0YSk7XG5cbiAgICAgIGNvbnN0IGZpbmFsU2NyaXB0ID0gcmVwbGFjZWRTY3JpcHQucmVwbGFjZShuZXcgUmVnRXhwKC9cXCRbXFx3X10rLywgJ2cnKSwgJ05vdGhpbmcnKTtcblxuICAgICAgcmV0dXJuIFsuLi5hY2MsIC4uLmZpbmFsU2NyaXB0LnNwbGl0KFwiXFxuXCIpXTtcbiAgICB9LCA8c3RyaW5nW10+W10pO1xuXG4gICAgcmV0dXJuIGF3YWl0IGNvbWJpbmVkLnJlZHVjZShhc3luYyAoYWNjLCBjb21tYW5kKSA9PiB7XG4gICAgICByZXR1cm4gYXdhaXQgcnVuQ29tbWFuZChhd2FpdCBhY2MsIGNvbW1hbmQsIG1hY3Jvcyk7XG4gICAgfSwgUHJvbWlzZS5yZXNvbHZlKHdvcmxkKSk7XG4gICAgcHJpbnRlci5wcmludExpbmUoYFNjcmlwdCBjb21wbGV0ZS5gKTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBsb29wKHdvcmxkLCBybCwgbWFjcm9zKTtcbiAgfVxufVxuXG5yZXBsKCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59KTtcbiJdfQ==
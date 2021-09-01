"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webParse = exports.webWorld = void 0;
const World_1 = require("./World");
const Assert_1 = require("./Assert");
const Printer_1 = require("./Printer");
const Runner_1 = require("./Runner");
const Networks_1 = require("./Networks");
function networkFromId(id) {
    switch (id) {
        case 0:
            return 'olympic';
        case 1:
            return 'mainnet';
        case 2:
            return 'morden';
        case 3:
            return 'ropsten';
        case 4:
            return 'rinkeby';
        case 5:
            return 'goerli';
        case 8:
            return 'ubiq';
        case 42:
            return 'kovan';
        case 77:
            return 'sokol';
        case 99:
            return 'core';
        case 999:
            return 'development';
        default:
            return '';
    }
}
async function webWorld(web3, networksData, networksABIData, printerCallback) {
    let printer = new Printer_1.CallbackPrinter(printerCallback);
    let accounts;
    if (web3.currentProvider && typeof (web3.currentProvider) !== 'string') {
        // XXXS
        accounts = [web3.currentProvider.address];
    }
    const networkId = await web3.net.getId();
    const network = networkFromId(networkId);
    // XXXS
    const saddle = {
        web3: web3
    };
    let world = await World_1.initWorld(Assert_1.throwExpect, printer, web3, saddle, network, accounts, null, null);
    let networks = Networks_1.parseNetworkFile(networksData);
    let networksABI = Networks_1.parseNetworkFile(networksABIData);
    [world] = await Networks_1.loadContractData(world, networks, networksABI);
    // world = loadInvokationOpts(world);
    // world = loadVerbose(world);
    // world = loadDryRun(world);
    // world = await loadSettings(world);
    return world;
}
exports.webWorld = webWorld;
async function webParse(world, line) {
    return Runner_1.runCommand(world, line, {});
}
exports.webParse = webParse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1dlYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBMkM7QUFDM0MscUNBQXVDO0FBQ3ZDLHVDQUE0QztBQUM1QyxxQ0FBc0M7QUFDdEMseUNBQWdFO0FBSWhFLFNBQVMsYUFBYSxDQUFDLEVBQVU7SUFDL0IsUUFBUSxFQUFFLEVBQUU7UUFDVixLQUFLLENBQUM7WUFDSixPQUFPLFNBQVMsQ0FBQztRQUVuQixLQUFLLENBQUM7WUFDSixPQUFPLFNBQVMsQ0FBQztRQUVuQixLQUFLLENBQUM7WUFDSixPQUFPLFFBQVEsQ0FBQztRQUVsQixLQUFLLENBQUM7WUFDSixPQUFPLFNBQVMsQ0FBQztRQUVuQixLQUFLLENBQUM7WUFDSixPQUFPLFNBQVMsQ0FBQztRQUVuQixLQUFLLENBQUM7WUFDSixPQUFPLFFBQVEsQ0FBQztRQUVsQixLQUFLLENBQUM7WUFDSixPQUFPLE1BQU0sQ0FBQztRQUVoQixLQUFLLEVBQUU7WUFDTCxPQUFPLE9BQU8sQ0FBQztRQUVqQixLQUFLLEVBQUU7WUFDTCxPQUFPLE9BQU8sQ0FBQztRQUVqQixLQUFLLEVBQUU7WUFDTCxPQUFPLE1BQU0sQ0FBQztRQUVoQixLQUFLLEdBQUc7WUFDTixPQUFPLGFBQWEsQ0FBQztRQUV2QjtZQUNFLE9BQU8sRUFBRSxDQUFDO0tBQ2I7QUFDSCxDQUFDO0FBRU0sS0FBSyxVQUFVLFFBQVEsQ0FDNUIsSUFBVSxFQUNWLFlBQW9CLEVBQ3BCLGVBQXVCLEVBQ3ZCLGVBQXVDO0lBRXZDLElBQUksT0FBTyxHQUFHLElBQUkseUJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNuRCxJQUFJLFFBQVEsQ0FBQztJQUNiLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxPQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFFBQVEsRUFBRTtRQUNyRSxPQUFPO1FBQ1AsUUFBUSxHQUFHLENBQU8sSUFBSSxDQUFDLGVBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDbEQ7SUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFPLElBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbEQsTUFBTSxPQUFPLEdBQVcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRWpELE9BQU87SUFDUCxNQUFNLE1BQU0sR0FBb0I7UUFDOUIsSUFBSSxFQUFFLElBQUk7S0FDWCxDQUFDO0lBRUYsSUFBSSxLQUFLLEdBQUcsTUFBTSxpQkFBUyxDQUFDLG9CQUFXLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFL0YsSUFBSSxRQUFRLEdBQUcsMkJBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUMsSUFBSSxXQUFXLEdBQUcsMkJBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFcEQsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLDJCQUFnQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0QscUNBQXFDO0lBQ3JDLDhCQUE4QjtJQUM5Qiw2QkFBNkI7SUFDN0IscUNBQXFDO0lBRXJDLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQWpDRCw0QkFpQ0M7QUFFTSxLQUFLLFVBQVUsUUFBUSxDQUFDLEtBQVksRUFBRSxJQUFZO0lBQ3ZELE9BQU8sbUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFGRCw0QkFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBhcnNlIH0gZnJvbSAnLi9QYXJzZXInO1xuaW1wb3J0IHsgV29ybGQsIGluaXRXb3JsZCB9IGZyb20gJy4vV29ybGQnO1xuaW1wb3J0IHsgdGhyb3dFeHBlY3QgfSBmcm9tICcuL0Fzc2VydCc7XG5pbXBvcnQgeyBDYWxsYmFja1ByaW50ZXIgfSBmcm9tICcuL1ByaW50ZXInO1xuaW1wb3J0IHsgcnVuQ29tbWFuZCB9IGZyb20gJy4vUnVubmVyJztcbmltcG9ydCB7IGxvYWRDb250cmFjdERhdGEsIHBhcnNlTmV0d29ya0ZpbGUgfSBmcm9tICcuL05ldHdvcmtzJztcbmltcG9ydCBXZWIzIGZyb20gJ3dlYjMnO1xuaW1wb3J0IHsgU2FkZGxlIH0gZnJvbSAnZXRoLXNhZGRsZSc7XG5cbmZ1bmN0aW9uIG5ldHdvcmtGcm9tSWQoaWQ6IG51bWJlcikge1xuICBzd2l0Y2ggKGlkKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuICdvbHltcGljJztcblxuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiAnbWFpbm5ldCc7XG5cbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gJ21vcmRlbic7XG5cbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gJ3JvcHN0ZW4nO1xuXG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuICdyaW5rZWJ5JztcblxuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiAnZ29lcmxpJztcblxuICAgIGNhc2UgODpcbiAgICAgIHJldHVybiAndWJpcSc7XG5cbiAgICBjYXNlIDQyOlxuICAgICAgcmV0dXJuICdrb3Zhbic7XG5cbiAgICBjYXNlIDc3OlxuICAgICAgcmV0dXJuICdzb2tvbCc7XG5cbiAgICBjYXNlIDk5OlxuICAgICAgcmV0dXJuICdjb3JlJztcblxuICAgIGNhc2UgOTk5OlxuICAgICAgcmV0dXJuICdkZXZlbG9wbWVudCc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3ZWJXb3JsZChcbiAgd2ViMzogV2ViMyxcbiAgbmV0d29ya3NEYXRhOiBzdHJpbmcsXG4gIG5ldHdvcmtzQUJJRGF0YTogc3RyaW5nLFxuICBwcmludGVyQ2FsbGJhY2s6IChtZXNzYWdlOiBhbnkpID0+IHZvaWRcbik6IFByb21pc2U8V29ybGQ+IHtcbiAgbGV0IHByaW50ZXIgPSBuZXcgQ2FsbGJhY2tQcmludGVyKHByaW50ZXJDYWxsYmFjayk7XG4gIGxldCBhY2NvdW50cztcbiAgaWYgKHdlYjMuY3VycmVudFByb3ZpZGVyICYmIHR5cGVvZih3ZWIzLmN1cnJlbnRQcm92aWRlcikgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gWFhYU1xuICAgIGFjY291bnRzID0gWyg8YW55PndlYjMuY3VycmVudFByb3ZpZGVyKS5hZGRyZXNzXTtcbiAgfVxuXG4gIGNvbnN0IG5ldHdvcmtJZCA9IGF3YWl0ICh3ZWIzIGFzIGFueSkubmV0LmdldElkKCk7XG4gIGNvbnN0IG5ldHdvcms6IHN0cmluZyA9IG5ldHdvcmtGcm9tSWQobmV0d29ya0lkKTtcblxuICAvLyBYWFhTXG4gIGNvbnN0IHNhZGRsZSA9IDxTYWRkbGU+PHVua25vd24+e1xuICAgIHdlYjM6IHdlYjNcbiAgfTtcblxuICBsZXQgd29ybGQgPSBhd2FpdCBpbml0V29ybGQodGhyb3dFeHBlY3QsIHByaW50ZXIsIHdlYjMsIHNhZGRsZSwgbmV0d29yaywgYWNjb3VudHMsIG51bGwsIG51bGwpO1xuXG4gIGxldCBuZXR3b3JrcyA9IHBhcnNlTmV0d29ya0ZpbGUobmV0d29ya3NEYXRhKTtcbiAgbGV0IG5ldHdvcmtzQUJJID0gcGFyc2VOZXR3b3JrRmlsZShuZXR3b3Jrc0FCSURhdGEpO1xuXG4gIFt3b3JsZF0gPSBhd2FpdCBsb2FkQ29udHJhY3REYXRhKHdvcmxkLCBuZXR3b3JrcywgbmV0d29ya3NBQkkpO1xuICAvLyB3b3JsZCA9IGxvYWRJbnZva2F0aW9uT3B0cyh3b3JsZCk7XG4gIC8vIHdvcmxkID0gbG9hZFZlcmJvc2Uod29ybGQpO1xuICAvLyB3b3JsZCA9IGxvYWREcnlSdW4od29ybGQpO1xuICAvLyB3b3JsZCA9IGF3YWl0IGxvYWRTZXR0aW5ncyh3b3JsZCk7XG5cbiAgcmV0dXJuIHdvcmxkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd2ViUGFyc2Uod29ybGQ6IFdvcmxkLCBsaW5lOiBzdHJpbmcpOiBQcm9taXNlPFdvcmxkPiB7XG4gIHJldHVybiBydW5Db21tYW5kKHdvcmxkLCBsaW5lLCB7fSk7XG59XG4iXX0=
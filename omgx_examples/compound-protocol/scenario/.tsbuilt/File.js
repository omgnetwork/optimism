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
exports.writeFile = exports.readFile = exports.getNetworkPath = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getNetworkPath(basePath, network, name, extension = 'json') {
    return path.join(basePath || '', 'networks', `${network}${name}${extension ? `.${extension}` : ''}`);
}
exports.getNetworkPath = getNetworkPath;
async function readFile(world, file, def, fn) {
    if (world && world.fs) {
        let data = world.fs[file];
        return Promise.resolve(data ? fn(data) : def);
    }
    else {
        return new Promise((resolve, reject) => {
            fs.access(file, fs.constants.F_OK, (err) => {
                if (err) {
                    resolve(def);
                }
                else {
                    fs.readFile(file, 'utf8', (err, data) => {
                        return err ? reject(err) : resolve(fn(data));
                    });
                }
            });
        });
    }
}
exports.readFile = readFile;
async function writeFile(world, file, data) {
    if (world && world.fs) {
        world = world.setIn(['fs', file], data);
        return Promise.resolve(world);
    }
    else {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, data, (err) => {
                return err ? reject(err) : resolve(world); // XXXS `!`
            });
        });
    }
}
exports.writeFile = writeFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9GaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBRzdCLFNBQWdCLGNBQWMsQ0FBQyxRQUF1QixFQUFFLE9BQWUsRUFBRSxJQUFZLEVBQUUsWUFBeUIsTUFBTTtJQUNySCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxPQUFPLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN0RyxDQUFDO0FBRkQsd0NBRUM7QUFFTSxLQUFLLFVBQVUsUUFBUSxDQUFJLEtBQW1CLEVBQUUsSUFBWSxFQUFFLEdBQU0sRUFBRSxFQUF1QjtJQUNsRyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ3JCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMvQztTQUFNO1FBQ0wsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN6QyxJQUFJLEdBQUcsRUFBRTtvQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2Q7cUJBQU07b0JBQ0wsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO3dCQUN0QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQy9DLENBQUMsQ0FBQyxDQUFDO2lCQUNKO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQztBQWpCRCw0QkFpQkM7QUFFTSxLQUFLLFVBQVUsU0FBUyxDQUFJLEtBQW1CLEVBQUUsSUFBWSxFQUFFLElBQVk7SUFDaEYsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUNyQixLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDL0I7U0FBTTtRQUNMLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQy9CLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVc7WUFDekQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQztBQVhELDhCQVdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSAnLi9Xb3JsZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROZXR3b3JrUGF0aChiYXNlUGF0aDogc3RyaW5nIHwgbnVsbCwgbmV0d29yazogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGV4dGVuc2lvbjogc3RyaW5nIHwgbnVsbD0nanNvbicpOiBzdHJpbmcge1xuXHRyZXR1cm4gcGF0aC5qb2luKGJhc2VQYXRoIHx8ICcnLCAnbmV0d29ya3MnLCBgJHtuZXR3b3JrfSR7bmFtZX0ke2V4dGVuc2lvbiA/IGAuJHtleHRlbnNpb259YCA6ICcnfWApO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGU8VD4od29ybGQ6IFdvcmxkIHwgbnVsbCwgZmlsZTogc3RyaW5nLCBkZWY6IFQsIGZuOiAoZGF0YTogc3RyaW5nKSA9PiBUKTogUHJvbWlzZTxUPiB7XG4gIGlmICh3b3JsZCAmJiB3b3JsZC5mcykge1xuICAgIGxldCBkYXRhID0gd29ybGQuZnNbZmlsZV07XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkYXRhID8gZm4oZGF0YSkgOiBkZWYpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmcy5hY2Nlc3MoZmlsZSwgZnMuY29uc3RhbnRzLkZfT0ssIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlc29sdmUoZGVmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcy5yZWFkRmlsZShmaWxlLCAndXRmOCcsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUoZm4oZGF0YSkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVGaWxlPFQ+KHdvcmxkOiBXb3JsZCB8IG51bGwsIGZpbGU6IHN0cmluZywgZGF0YTogc3RyaW5nKTogUHJvbWlzZTxXb3JsZD4ge1xuICBpZiAod29ybGQgJiYgd29ybGQuZnMpIHtcbiAgICB3b3JsZCA9IHdvcmxkLnNldEluKFsnZnMnLCBmaWxlXSwgZGF0YSk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh3b3JsZCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZShmaWxlLCBkYXRhLCAoZXJyKSA9PiB7XG4gICAgICAgIHJldHVybiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUod29ybGQhKTsgLy8gWFhYUyBgIWBcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=
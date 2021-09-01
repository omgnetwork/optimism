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
exports.createInterface = void 0;
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
const File_1 = require("./File");
let readlineAny = readline;
async function createInterface(options) {
    let history = await File_1.readFile(null, options['path'], [], (x) => x.split("\n"));
    let cleanHistory = history.filter((x) => !!x).reverse();
    readlineAny.kHistorySize = Math.max(readlineAny.kHistorySize, options['maxLength']);
    let rl = readline.createInterface(options);
    let rlAny = rl;
    let oldAddHistory = rlAny._addHistory;
    rlAny._addHistory = function () {
        let last = rlAny.history[0];
        let line = oldAddHistory.call(rl);
        // TODO: Should this be sync?
        if (line.length > 0 && line != last) {
            fs.appendFileSync(options['path'], `${line}\n`);
        }
        // TODO: Truncate file?
        return line;
    };
    rlAny.history.push.apply(rlAny.history, cleanHistory);
    return rl;
}
exports.createInterface = createInterface;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGlzdG9yaWNSZWFkbGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9IaXN0b3JpY1JlYWRsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtREFBcUM7QUFDckMsdUNBQXlCO0FBQ3pCLGlDQUFnQztBQUVoQyxJQUFJLFdBQVcsR0FBUSxRQUFRLENBQUM7QUFFekIsS0FBSyxVQUFVLGVBQWUsQ0FBQyxPQUFPO0lBQzVDLElBQUksT0FBTyxHQUFhLE1BQU0sZUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEYsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRXhELFdBQVcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBRXBGLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0MsSUFBSSxLQUFLLEdBQVEsRUFBRSxDQUFDO0lBRXBCLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFFdEMsS0FBSyxDQUFDLFdBQVcsR0FBRztRQUNuQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFbEMsNkJBQTZCO1FBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtZQUNwQyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUM7U0FDaEQ7UUFFRCx1QkFBdUI7UUFFdkIsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDLENBQUE7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztJQUV0RCxPQUFPLEVBQUUsQ0FBQztBQUNYLENBQUM7QUE1QkQsMENBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcmVhZGxpbmUgZnJvbSAncmVhZGxpbmUnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtyZWFkRmlsZX0gZnJvbSAnLi9GaWxlJztcblxubGV0IHJlYWRsaW5lQW55ID0gPGFueT5yZWFkbGluZTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUludGVyZmFjZShvcHRpb25zKTogUHJvbWlzZTxyZWFkbGluZS5SZWFkTGluZT4ge1xuXHRsZXQgaGlzdG9yeTogc3RyaW5nW10gPSBhd2FpdCByZWFkRmlsZShudWxsLCBvcHRpb25zWydwYXRoJ10sIFtdLCAoeCkgPT4geC5zcGxpdChcIlxcblwiKSk7XG5cdGxldCBjbGVhbkhpc3RvcnkgPSBoaXN0b3J5LmZpbHRlcigoeCkgPT4gISF4KS5yZXZlcnNlKCk7XG5cblx0cmVhZGxpbmVBbnkua0hpc3RvcnlTaXplID0gTWF0aC5tYXgocmVhZGxpbmVBbnkua0hpc3RvcnlTaXplLCBvcHRpb25zWydtYXhMZW5ndGgnXSk7XG5cblx0bGV0IHJsID0gcmVhZGxpbmUuY3JlYXRlSW50ZXJmYWNlKG9wdGlvbnMpO1xuXHRsZXQgcmxBbnkgPSA8YW55PnJsO1xuXG5cdGxldCBvbGRBZGRIaXN0b3J5ID0gcmxBbnkuX2FkZEhpc3Rvcnk7XG5cblx0cmxBbnkuX2FkZEhpc3RvcnkgPSBmdW5jdGlvbigpIHtcblx0XHRsZXQgbGFzdCA9IHJsQW55Lmhpc3RvcnlbMF07XG5cdFx0bGV0IGxpbmUgPSBvbGRBZGRIaXN0b3J5LmNhbGwocmwpO1xuXG5cdFx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYmUgc3luYz9cblx0XHRpZiAobGluZS5sZW5ndGggPiAwICYmIGxpbmUgIT0gbGFzdCkge1xuXHRcdFx0ZnMuYXBwZW5kRmlsZVN5bmMob3B0aW9uc1sncGF0aCddLCBgJHtsaW5lfVxcbmApO1xuXHRcdH1cblxuXHRcdC8vIFRPRE86IFRydW5jYXRlIGZpbGU/XG5cblx0XHRyZXR1cm4gbGluZTtcblx0fVxuXG5cdHJsQW55Lmhpc3RvcnkucHVzaC5hcHBseShybEFueS5oaXN0b3J5LCBjbGVhbkhpc3RvcnkpO1xuXG5cdHJldHVybiBybDtcbn1cbiJdfQ==
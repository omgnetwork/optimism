"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = exports.formatEvent = void 0;
// Effectively the opposite of parse
function formatEvent(event, outter = true) {
    if (Array.isArray(event)) {
        if (event.length === 2 && typeof event[0] === "string" && event[0].toLowerCase() === "exactly") {
            return event[1].toString();
        }
        let mapped = event.map(e => formatEvent(e, false));
        let joined = mapped.join(' ');
        if (outter) {
            return joined;
        }
        else {
            return `(${joined})`;
        }
    }
    else {
        return event;
    }
}
exports.formatEvent = formatEvent;
function formatError(err) {
    return JSON.stringify(err); // yeah... for now
}
exports.formatError = formatError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybWF0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0Zvcm1hdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxvQ0FBb0M7QUFDcEMsU0FBZ0IsV0FBVyxDQUFDLEtBQVksRUFBRSxNQUFNLEdBQUMsSUFBSTtJQUNuRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDeEIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLElBQWEsS0FBSyxDQUFDLENBQUMsQ0FBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLFNBQVMsRUFBRTtZQUN4RyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM1QjtRQUVELElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU5QixJQUFJLE1BQU0sRUFBRTtZQUNWLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7YUFBTTtZQUNMLE9BQU8sSUFBSSxNQUFNLEdBQUcsQ0FBQztTQUN0QjtLQUNGO1NBQU07UUFDTCxPQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0gsQ0FBQztBQWpCRCxrQ0FpQkM7QUFFRCxTQUFnQixXQUFXLENBQUMsR0FBUTtJQUNsQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0I7QUFDaEQsQ0FBQztBQUZELGtDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudH0gZnJvbSAnLi9FdmVudCc7XG5cbi8vIEVmZmVjdGl2ZWx5IHRoZSBvcHBvc2l0ZSBvZiBwYXJzZVxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEV2ZW50KGV2ZW50OiBFdmVudCwgb3V0dGVyPXRydWUpOiBzdHJpbmcge1xuICBpZiAoQXJyYXkuaXNBcnJheShldmVudCkpIHtcbiAgICBpZiAoZXZlbnQubGVuZ3RoID09PSAyICYmIHR5cGVvZiBldmVudFswXSA9PT0gXCJzdHJpbmdcIiAmJiAoPHN0cmluZz5ldmVudFswXSkudG9Mb3dlckNhc2UoKSA9PT0gXCJleGFjdGx5XCIpIHtcbiAgICAgIHJldHVybiBldmVudFsxXS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGxldCBtYXBwZWQgPSBldmVudC5tYXAoZSA9PiBmb3JtYXRFdmVudCg8RXZlbnQ+ZSwgZmFsc2UpKTtcbiAgICBsZXQgam9pbmVkID0gbWFwcGVkLmpvaW4oJyAnKTtcblxuICAgIGlmIChvdXR0ZXIpIHtcbiAgICAgIHJldHVybiBqb2luZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgKCR7am9pbmVkfSlgO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEVycm9yKGVycjogYW55KSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShlcnIpOyAvLyB5ZWFoLi4uIGZvciBub3dcbn1cbiJdfQ==
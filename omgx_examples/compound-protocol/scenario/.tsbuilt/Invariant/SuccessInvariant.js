"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessInvariant = void 0;
const World_1 = require("../World");
class SuccessInvariant {
    constructor() {
        this.held = false;
    }
    async checker(world) {
        if (world.lastInvokation && !world.lastInvokation.success()) {
            World_1.fail(world, `Success invariant broken! Expected successful execution, but had error ${world.lastInvokation.toString()}`);
        }
    }
    toString() {
        return `SuccessInvariant`;
    }
}
exports.SuccessInvariant = SuccessInvariant;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3VjY2Vzc0ludmFyaWFudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9JbnZhcmlhbnQvU3VjY2Vzc0ludmFyaWFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxvQ0FBcUM7QUFLckMsTUFBYSxnQkFBZ0I7SUFHNUI7UUFGQSxTQUFJLEdBQUcsS0FBSyxDQUFDO0lBRUUsQ0FBQztJQUVmLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBWTtRQUN4QixJQUFJLEtBQUssQ0FBQyxjQUFjLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNELFlBQUksQ0FBQyxLQUFLLEVBQUUsMEVBQTBFLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzFIO0lBQ0gsQ0FBQztJQUVELFFBQVE7UUFDTixPQUFPLGtCQUFrQixDQUFDO0lBQzVCLENBQUM7Q0FDRjtBQWRELDRDQWNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbnZhcmlhbnR9IGZyb20gJy4uL0ludmFyaWFudCc7XG5pbXBvcnQge2ZhaWwsIFdvcmxkfSBmcm9tICcuLi9Xb3JsZCc7XG5pbXBvcnQge2dldENvcmVWYWx1ZX0gZnJvbSAnLi4vQ29yZVZhbHVlJztcbmltcG9ydCB7VmFsdWV9IGZyb20gJy4uL1ZhbHVlJztcbmltcG9ydCB7RXZlbnR9IGZyb20gJy4uL0V2ZW50JztcblxuZXhwb3J0IGNsYXNzIFN1Y2Nlc3NJbnZhcmlhbnQgaW1wbGVtZW50cyBJbnZhcmlhbnQge1xuXHRoZWxkID0gZmFsc2U7XG5cblx0Y29uc3RydWN0b3IoKSB7fVxuXG4gIGFzeW5jIGNoZWNrZXIod29ybGQ6IFdvcmxkKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHdvcmxkLmxhc3RJbnZva2F0aW9uICYmICF3b3JsZC5sYXN0SW52b2thdGlvbi5zdWNjZXNzKCkpIHtcbiAgICAgIGZhaWwod29ybGQsIGBTdWNjZXNzIGludmFyaWFudCBicm9rZW4hIEV4cGVjdGVkIHN1Y2Nlc3NmdWwgZXhlY3V0aW9uLCBidXQgaGFkIGVycm9yICR7d29ybGQubGFzdEludm9rYXRpb24udG9TdHJpbmcoKX1gKTtcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYFN1Y2Nlc3NJbnZhcmlhbnRgO1xuICB9XG59XG4iXX0=
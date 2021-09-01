"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = void 0;
const Parser_1 = require("./Parser");
const Macro_1 = require("./Macro");
const CoreEvent_1 = require("./CoreEvent");
async function runCommand(world, command, macros) {
    const trimmedCommand = command.trim();
    const event = Parser_1.parse(trimmedCommand, { startRule: 'step' });
    if (event === null) {
        return world;
    }
    else {
        world.printer.printLine(`Command: ${trimmedCommand}`);
        let expanded = Macro_1.expandEvent(macros, event);
        return CoreEvent_1.processEvents(world, expanded);
    }
}
exports.runCommand = runCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxQ0FBK0I7QUFDL0IsbUNBQTRDO0FBQzVDLDJDQUF5QztBQUVsQyxLQUFLLFVBQVUsVUFBVSxDQUFDLEtBQVksRUFBRSxPQUFlLEVBQUUsTUFBYztJQUM1RSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdEMsTUFBTSxLQUFLLEdBQUcsY0FBSyxDQUFDLGNBQWMsRUFBRSxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0lBRXpELElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtRQUNsQixPQUFPLEtBQUssQ0FBQztLQUNkO1NBQU07UUFDTCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFFdEQsSUFBSSxRQUFRLEdBQUcsbUJBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFMUMsT0FBTyx5QkFBYSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2QztBQUNILENBQUM7QUFkRCxnQ0FjQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7V29ybGR9IGZyb20gJy4vV29ybGQnO1xuaW1wb3J0IHtwYXJzZX0gZnJvbSAnLi9QYXJzZXInO1xuaW1wb3J0IHtleHBhbmRFdmVudCwgTWFjcm9zfSBmcm9tICcuL01hY3JvJztcbmltcG9ydCB7cHJvY2Vzc0V2ZW50c30gZnJvbSAnLi9Db3JlRXZlbnQnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5Db21tYW5kKHdvcmxkOiBXb3JsZCwgY29tbWFuZDogc3RyaW5nLCBtYWNyb3M6IE1hY3Jvcyk6IFByb21pc2U8V29ybGQ+IHtcbiAgY29uc3QgdHJpbW1lZENvbW1hbmQgPSBjb21tYW5kLnRyaW0oKTtcblxuICBjb25zdCBldmVudCA9IHBhcnNlKHRyaW1tZWRDb21tYW5kLCB7c3RhcnRSdWxlOiAnc3RlcCd9KTtcblxuICBpZiAoZXZlbnQgPT09IG51bGwpIHtcbiAgICByZXR1cm4gd29ybGQ7XG4gIH0gZWxzZSB7XG4gICAgd29ybGQucHJpbnRlci5wcmludExpbmUoYENvbW1hbmQ6ICR7dHJpbW1lZENvbW1hbmR9YCk7XG5cbiAgICBsZXQgZXhwYW5kZWQgPSBleHBhbmRFdmVudChtYWNyb3MsIGV2ZW50KTtcblxuICAgIHJldHVybiBwcm9jZXNzRXZlbnRzKHdvcmxkLCBleHBhbmRlZCk7XG4gIH1cbn1cbiJdfQ==
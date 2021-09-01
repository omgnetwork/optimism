"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAssertionEvent = exports.assertionCommands = void 0;
const World_1 = require("../World");
const CoreValue_1 = require("../CoreValue");
const Invokation_1 = require("../Invokation");
const CoreValue_2 = require("../CoreValue");
const Value_1 = require("../Value");
const Command_1 = require("../Command");
async function assertApprox(world, given, expected, tolerance) {
    if (Math.abs(Number(expected.sub(given).div(expected).val)) > Number(tolerance.val)) {
        return World_1.fail(world, `Expected ${given.toString()} to approximately equal ${expected.toString()} within ${tolerance.toString()}`);
    }
    return world;
}
async function assertEqual(world, given, expected) {
    if (!expected.compareTo(world, given)) {
        return World_1.fail(world, `Expected ${given.toString()} to equal ${expected.toString()}`);
    }
    return world;
}
async function assertLessThan(world, given, expected) {
    if (given.compareOrder(world, expected) !== Value_1.Order.LESS_THAN) {
        return World_1.fail(world, `Expected ${given.toString()} to be less than ${expected.toString()}`);
    }
    return world;
}
async function assertGreaterThan(world, given, expected) {
    if (given.compareOrder(world, expected) !== Value_1.Order.GREATER_THAN) {
        return World_1.fail(world, `Expected ${given.toString()} to be greater than ${expected.toString()}`);
    }
    return world;
}
async function assertFailure(world, failure) {
    if (!world.lastInvokation) {
        return World_1.fail(world, `Expected ${failure.toString()}, but missing any invokations.`);
    }
    if (world.lastInvokation.success()) {
        return World_1.fail(world, `Expected ${failure.toString()}, but last invokation was successful with result ${JSON.stringify(world.lastInvokation.value)}.`);
    }
    if (world.lastInvokation.error) {
        return World_1.fail(world, `Expected ${failure.toString()}, but last invokation threw error ${world.lastInvokation.error}.`);
    }
    if (world.lastInvokation.failures.length === 0) {
        throw new Error(`Invokation requires success, failure or error, got: ${world.lastInvokation.toString()}`);
    }
    if (world.lastInvokation.failures.find((f) => f.equals(failure)) === undefined) {
        return World_1.fail(world, `Expected ${failure.toString()}, but got ${world.lastInvokation.failures.toString()}.`);
    }
    return world;
}
// coverage tests don't currently support checking full message given with a revert
function coverageSafeRevertMessage(world, message) {
    if (world.network === 'coverage') {
        return "revert";
    }
    else {
        return message;
    }
}
async function assertRevertFailure(world, err, message) {
    if (world.network === 'coverage') { // coverage doesn't have detailed message, thus no revert failures
        return await assertRevert(world, message);
    }
    if (!world.lastInvokation) {
        return World_1.fail(world, `Expected revert failure, but missing any invokations.`);
    }
    if (world.lastInvokation.success()) {
        return World_1.fail(world, `Expected revert failure, but last invokation was successful with result ${JSON.stringify(world.lastInvokation.value)}.`);
    }
    if (world.lastInvokation.failures.length > 0) {
        return World_1.fail(world, `Expected revert failure, but got ${world.lastInvokation.failures.toString()}.`);
    }
    if (!world.lastInvokation.error) {
        throw new Error(`Invokation requires success, failure or error, got: ${world.lastInvokation.toString()}`);
    }
    if (!(world.lastInvokation.error instanceof Invokation_1.InvokationRevertFailure)) {
        throw new Error(`Invokation error mismatch, expected revert failure: "${err}, ${message}", got: "${world.lastInvokation.error.toString()}"`);
    }
    const expectedMessage = `VM Exception while processing transaction: ${coverageSafeRevertMessage(world, message)}`;
    if (world.lastInvokation.error.error !== err || world.lastInvokation.error.errMessage !== expectedMessage) {
        throw new Error(`Invokation error mismatch, expected revert failure: err=${err}, message="${expectedMessage}", got: "${world.lastInvokation.error.toString()}"`);
    }
    return world;
}
async function assertError(world, message) {
    if (!world.lastInvokation) {
        return World_1.fail(world, `Expected revert, but missing any invokations.`);
    }
    if (world.lastInvokation.success()) {
        return World_1.fail(world, `Expected revert, but last invokation was successful with result ${JSON.stringify(world.lastInvokation.value)}.`);
    }
    if (world.lastInvokation.failures.length > 0) {
        return World_1.fail(world, `Expected revert, but got ${world.lastInvokation.failures.toString()}.`);
    }
    if (!world.lastInvokation.error) {
        throw new Error(`Invokation requires success, failure or error, got: ${world.lastInvokation.toString()}`);
    }
    if (!world.lastInvokation.error.message.startsWith(message)) {
        throw new Error(`Invokation error mismatch, expected: "${message}", got: "${world.lastInvokation.error.message}"`);
    }
    return world;
}
function buildRevertMessage(world, message) {
    return `VM Exception while processing transaction: ${coverageSafeRevertMessage(world, message)}`;
}
async function assertRevert(world, message) {
    return await assertError(world, buildRevertMessage(world, message));
}
async function assertSuccess(world) {
    if (!world.lastInvokation || world.lastInvokation.success()) {
        return world;
    }
    else {
        return World_1.fail(world, `Expected success, but got ${world.lastInvokation.toString()}.`);
    }
}
async function assertReadError(world, event, message, isRevert) {
    try {
        let value = await CoreValue_1.getCoreValue(world, event);
        throw new Error(`Expected read revert, instead got value \`${value}\``);
    }
    catch (err) {
        let expectedMessage;
        if (isRevert) {
            expectedMessage = buildRevertMessage(world, message);
        }
        else {
            expectedMessage = message;
        }
        world.expect(expectedMessage).toEqual(err.message); // XXXS "expected read revert"
    }
    return world;
}
function getLogValue(value) {
    if (typeof value === 'number' || (typeof value === 'string' && value.match(/^[0-9]+$/))) {
        return new Value_1.NumberV(Number(value));
    }
    else if (typeof value === 'string') {
        return new Value_1.StringV(value);
    }
    else if (typeof value === 'boolean') {
        return new Value_1.BoolV(value);
    }
    else if (Array.isArray(value)) {
        return new Value_1.ListV(value.map(getLogValue));
    }
    else {
        throw new Error('Unknown type of log parameter: ${value}');
    }
}
async function assertLog(world, event, keyValues) {
    if (!world.lastInvokation) {
        return World_1.fail(world, `Expected log message "${event}" from contract execution, but world missing any invokations.`);
    }
    else if (!world.lastInvokation.receipt) {
        return World_1.fail(world, `Expected log message "${event}" from contract execution, but world invokation transaction.`);
    }
    else {
        const log = world.lastInvokation.receipt.events && world.lastInvokation.receipt.events[event];
        if (!log) {
            const events = Object.keys(world.lastInvokation.receipt.events || {}).join(', ');
            return World_1.fail(world, `Expected log with event \`${event}\`, found logs with events: [${events}]`);
        }
        if (Array.isArray(log)) {
            const found = log.find(_log => {
                return Object.entries(keyValues.val).reduce((previousValue, currentValue) => {
                    const [key, value] = currentValue;
                    if (previousValue) {
                        if (_log.returnValues[key] === undefined) {
                            return false;
                        }
                        else {
                            let logValue = getLogValue(_log.returnValues[key]);
                            if (!logValue.compareTo(world, value)) {
                                return false;
                            }
                            return true;
                        }
                    }
                    return previousValue;
                }, true);
            });
            if (!found) {
                const eventExpected = Object.entries(keyValues.val).join(', ');
                const eventDetailsFound = log.map(_log => {
                    return Object.entries(_log.returnValues);
                });
                return World_1.fail(world, `Expected log with event \`${eventExpected}\`, found logs for this event with: [${eventDetailsFound}]`);
            }
        }
        else {
            Object.entries(keyValues.val).forEach(([key, value]) => {
                if (log.returnValues[key] === undefined) {
                    World_1.fail(world, `Expected log to have param for \`${key}\``);
                }
                else {
                    let logValue = getLogValue(log.returnValues[key]);
                    if (!logValue.compareTo(world, value)) {
                        World_1.fail(world, `Expected log to have param \`${key}\` to match ${value.toString()}, but got ${logValue.toString()}`);
                    }
                }
            });
        }
        return world;
    }
}
function assertionCommands() {
    return [
        new Command_1.View(`
        #### Approx

        * "Approx given:<Value> expected:<Value> tolerance:<Value>" - Asserts that given approximately matches expected.
          * E.g. "Assert Approx (Exactly 0) Zero "
          * E.g. "Assert Approx (CToken cZRX TotalSupply) (Exactly 55) 1e-18"
          * E.g. "Assert Approx (CToken cZRX Comptroller) (Comptroller Address) 1"
      `, "Approx", [
            new Command_1.Arg("given", CoreValue_2.getNumberV),
            new Command_1.Arg("expected", CoreValue_2.getNumberV),
            new Command_1.Arg("tolerance", CoreValue_2.getNumberV, { default: new Value_1.NumberV(0.001) })
        ], (world, { given, expected, tolerance }) => assertApprox(world, given, expected, tolerance)),
        new Command_1.View(`
        #### Equal

        * "Equal given:<Value> expected:<Value>" - Asserts that given matches expected.
          * E.g. "Assert Equal (Exactly 0) Zero"
          * E.g. "Assert Equal (CToken cZRX TotalSupply) (Exactly 55)"
          * E.g. "Assert Equal (CToken cZRX Comptroller) (Comptroller Address)"
      `, "Equal", [
            new Command_1.Arg("given", CoreValue_1.getCoreValue),
            new Command_1.Arg("expected", CoreValue_1.getCoreValue)
        ], (world, { given, expected }) => assertEqual(world, given, expected)),
        new Command_1.View(`
        #### LessThan

        * "given:<Value> LessThan expected:<Value>" - Asserts that given is less than expected.
          * E.g. "Assert (Exactly 0) LessThan (Exactly 1)"
      `, "LessThan", [
            new Command_1.Arg("given", CoreValue_1.getCoreValue),
            new Command_1.Arg("expected", CoreValue_1.getCoreValue)
        ], (world, { given, expected }) => assertLessThan(world, given, expected), { namePos: 1 }),
        new Command_1.View(`
        #### GreaterThan

        * "given:<Value> GreaterThan expected:<Value>" - Asserts that given is greater than the expected.
          * E.g. "Assert (Exactly 0) GreaterThan (Exactly 1)"
      `, "GreaterThan", [
            new Command_1.Arg("given", CoreValue_1.getCoreValue),
            new Command_1.Arg("expected", CoreValue_1.getCoreValue)
        ], (world, { given, expected }) => assertGreaterThan(world, given, expected), { namePos: 1 }),
        new Command_1.View(`
        #### True

        * "True given:<Value>" - Asserts that given is true.
          * E.g. "Assert True (Comptroller CheckMembership Geoff cETH)"
      `, "True", [
            new Command_1.Arg("given", CoreValue_1.getCoreValue)
        ], (world, { given }) => assertEqual(world, given, new Value_1.BoolV(true))),
        new Command_1.View(`
        #### False

        * "False given:<Value>" - Asserts that given is false.
          * E.g. "Assert False (Comptroller CheckMembership Geoff cETH)"
      `, "False", [
            new Command_1.Arg("given", CoreValue_1.getCoreValue)
        ], (world, { given }) => assertEqual(world, given, new Value_1.BoolV(false))),
        new Command_1.View(`
        #### ReadRevert

        * "ReadRevert event:<Event> message:<String>" - Asserts that reading the given value reverts with given message.
          * E.g. "Assert ReadRevert (Comptroller CheckMembership Geoff cETH) \"revert\""
      `, "ReadRevert", [
            new Command_1.Arg("event", CoreValue_2.getEventV),
            new Command_1.Arg("message", CoreValue_2.getStringV)
        ], (world, { event, message }) => assertReadError(world, event.val, message.val, true)),
        new Command_1.View(`
        #### ReadError

        * "ReadError event:<Event> message:<String>" - Asserts that reading the given value throws given error
          * E.g. "Assert ReadError (Comptroller Bad Address) \"cannot find comptroller\""
      `, "ReadError", [
            new Command_1.Arg("event", CoreValue_2.getEventV),
            new Command_1.Arg("message", CoreValue_2.getStringV)
        ], (world, { event, message }) => assertReadError(world, event.val, message.val, false)),
        new Command_1.View(`
        #### Failure

        * "Failure error:<String> info:<String> detail:<Number?>" - Asserts that last transaction had a graceful failure with given error, info and detail.
          * E.g. "Assert Failure UNAUTHORIZED SUPPORT_MARKET_OWNER_CHECK"
          * E.g. "Assert Failure MATH_ERROR MINT_CALCULATE_BALANCE 5"
      `, "Failure", [
            new Command_1.Arg("error", CoreValue_2.getStringV),
            new Command_1.Arg("info", CoreValue_2.getStringV),
            new Command_1.Arg("detail", CoreValue_2.getStringV, { default: new Value_1.StringV("0") }),
        ], (world, { error, info, detail }) => assertFailure(world, new Invokation_1.Failure(error.val, info.val, detail.val))),
        new Command_1.View(`
        #### RevertFailure

        * "RevertFailure error:<String> message:<String>" - Assert last transaction reverted with a message beginning with an error code
          * E.g. "Assert RevertFailure UNAUTHORIZED \"set reserves failed\""
      `, "RevertFailure", [
            new Command_1.Arg("error", CoreValue_2.getStringV),
            new Command_1.Arg("message", CoreValue_2.getStringV),
        ], (world, { error, message }) => assertRevertFailure(world, error.val, message.val)),
        new Command_1.View(`
        #### Revert

        * "Revert message:<String>" - Asserts that the last transaction reverted.
      `, "Revert", [
            new Command_1.Arg("message", CoreValue_2.getStringV, { default: new Value_1.StringV("revert") }),
        ], (world, { message }) => assertRevert(world, message.val)),
        new Command_1.View(`
        #### Error

        * "Error message:<String>" - Asserts that the last transaction had the given error.
      `, "Error", [
            new Command_1.Arg("message", CoreValue_2.getStringV),
        ], (world, { message }) => assertError(world, message.val)),
        new Command_1.View(`
        #### Success

        * "Success" - Asserts that the last transaction completed successfully (that is, did not revert nor emit graceful failure).
      `, "Success", [], (world, { given }) => assertSuccess(world)),
        new Command_1.View(`
        #### Log

        * "Log name:<String> (key:<String> value:<Value>) ..." - Asserts that last transaction emitted log with given name and key-value pairs.
          * E.g. "Assert Log Minted ("account" (User Geoff address)) ("amount" (Exactly 55))"
      `, "Log", [
            new Command_1.Arg("name", CoreValue_2.getStringV),
            new Command_1.Arg("params", CoreValue_2.getMapV, { variadic: true }),
        ], (world, { name, params }) => assertLog(world, name.val, params))
    ];
}
exports.assertionCommands = assertionCommands;
async function processAssertionEvent(world, event, from) {
    return await Command_1.processCommandEvent("Assertion", assertionCommands(), world, event, from);
}
exports.processAssertionEvent = processAssertionEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXJ0aW9uRXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvRXZlbnQvQXNzZXJ0aW9uRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esb0NBQXVDO0FBQ3ZDLDRDQUE0QztBQUM1Qyw4Q0FBaUU7QUFDakUsNENBS3NCO0FBQ3RCLG9DQVVrQjtBQUNsQix3Q0FBNEQ7QUFFNUQsS0FBSyxVQUFVLFlBQVksQ0FBQyxLQUFZLEVBQUUsS0FBYyxFQUFFLFFBQWlCLEVBQUUsU0FBa0I7SUFDN0YsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbkYsT0FBTyxZQUFJLENBQUMsS0FBSyxFQUFFLFlBQVksS0FBSyxDQUFDLFFBQVEsRUFBRSwyQkFBMkIsUUFBUSxDQUFDLFFBQVEsRUFBRSxXQUFXLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDakk7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRCxLQUFLLFVBQVUsV0FBVyxDQUFDLEtBQVksRUFBRSxLQUFZLEVBQUUsUUFBZTtJQUNwRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDckMsT0FBTyxZQUFJLENBQUMsS0FBSyxFQUFFLFlBQVksS0FBSyxDQUFDLFFBQVEsRUFBRSxhQUFhLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDcEY7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRCxLQUFLLFVBQVUsY0FBYyxDQUFDLEtBQVksRUFBRSxLQUFZLEVBQUUsUUFBZTtJQUN2RSxJQUFJLEtBQUssQ0FBQyxZ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ekYsT0FBTyxNQUFNLDZCQUFtQixDQUFNLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDOUYsQ0FBQztBQUZELHNEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnQgfSBmcm9tICcuLi9FdmVudCc7XG5pbXBvcnQgeyBmYWlsLCBXb3JsZCB9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7IGdldENvcmVWYWx1ZSB9IGZyb20gJy4uL0NvcmVWYWx1ZSc7XG5pbXBvcnQgeyBGYWlsdXJlLCBJbnZva2F0aW9uUmV2ZXJ0RmFpbHVyZSB9IGZyb20gJy4uL0ludm9rYXRpb24nO1xuaW1wb3J0IHtcbiAgZ2V0RXZlbnRWLFxuICBnZXRNYXBWLFxuICBnZXROdW1iZXJWLFxuICBnZXRTdHJpbmdWXG59IGZyb20gJy4uL0NvcmVWYWx1ZSc7XG5pbXBvcnQge1xuICBBZGRyZXNzVixcbiAgQm9vbFYsXG4gIEV2ZW50VixcbiAgTGlzdFYsXG4gIE1hcFYsXG4gIE51bWJlclYsXG4gIE9yZGVyLFxuICBTdHJpbmdWLFxuICBWYWx1ZVxufSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQgeyBBcmcsIFZpZXcsIHByb2Nlc3NDb21tYW5kRXZlbnQgfSBmcm9tICcuLi9Db21tYW5kJztcblxuYXN5bmMgZnVuY3Rpb24gYXNzZXJ0QXBwcm94KHdvcmxkOiBXb3JsZCwgZ2l2ZW46IE51bWJlclYsIGV4cGVjdGVkOiBOdW1iZXJWLCB0b2xlcmFuY2U6IE51bWJlclYpOiBQcm9taXNlPFdvcmxkPiB7XG4gIGlmIChNYXRoLmFicyhOdW1iZXIoZXhwZWN0ZWQuc3ViKGdpdmVuKS5kaXYoZXhwZWN0ZWQpLnZhbCkpID4gTnVtYmVyKHRvbGVyYW5jZS52YWwpKSB7XG4gICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCAke2dpdmVuLnRvU3RyaW5nKCl9IHRvIGFwcHJveGltYXRlbHkgZXF1YWwgJHtleHBlY3RlZC50b1N0cmluZygpfSB3aXRoaW4gJHt0b2xlcmFuY2UudG9TdHJpbmcoKX1gKTtcbiAgfVxuXG4gIHJldHVybiB3b3JsZDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXNzZXJ0RXF1YWwod29ybGQ6IFdvcmxkLCBnaXZlbjogVmFsdWUsIGV4cGVjdGVkOiBWYWx1ZSk6IFByb21pc2U8V29ybGQ+IHtcbiAgaWYgKCFleHBlY3RlZC5jb21wYXJlVG8od29ybGQsIGdpdmVuKSkge1xuICAgIHJldHVybiBmYWlsKHdvcmxkLCBgRXhwZWN0ZWQgJHtnaXZlbi50b1N0cmluZygpfSB0byBlcXVhbCAke2V4cGVjdGVkLnRvU3RyaW5nKCl9YCk7XG4gIH1cblxuICByZXR1cm4gd29ybGQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzc2VydExlc3NUaGFuKHdvcmxkOiBXb3JsZCwgZ2l2ZW46IFZhbHVlLCBleHBlY3RlZDogVmFsdWUpOiBQcm9taXNlPFdvcmxkPiB7XG4gIGlmIChnaXZlbi5jb21wYXJlT3JkZXIod29ybGQsIGV4cGVjdGVkKSAhPT0gT3JkZXIuTEVTU19USEFOKSB7XG4gICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCAke2dpdmVuLnRvU3RyaW5nKCl9IHRvIGJlIGxlc3MgdGhhbiAke2V4cGVjdGVkLnRvU3RyaW5nKCl9YCk7XG4gIH1cblxuICByZXR1cm4gd29ybGQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzc2VydEdyZWF0ZXJUaGFuKHdvcmxkOiBXb3JsZCwgZ2l2ZW46IFZhbHVlLCBleHBlY3RlZDogVmFsdWUpOiBQcm9taXNlPFdvcmxkPiB7XG4gIGlmIChnaXZlbi5jb21wYXJlT3JkZXIod29ybGQsIGV4cGVjdGVkKSAhPT0gT3JkZXIuR1JFQVRFUl9USEFOKSB7XG4gICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCAke2dpdmVuLnRvU3RyaW5nKCl9IHRvIGJlIGdyZWF0ZXIgdGhhbiAke2V4cGVjdGVkLnRvU3RyaW5nKCl9YCk7XG4gIH1cblxuICByZXR1cm4gd29ybGQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzc2VydEZhaWx1cmUod29ybGQ6IFdvcmxkLCBmYWlsdXJlOiBGYWlsdXJlKTogUHJvbWlzZTxXb3JsZD4ge1xuICBpZiAoIXdvcmxkLmxhc3RJbnZva2F0aW9uKSB7XG4gICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCAke2ZhaWx1cmUudG9TdHJpbmcoKX0sIGJ1dCBtaXNzaW5nIGFueSBpbnZva2F0aW9ucy5gKTtcbiAgfVxuXG4gIGlmICh3b3JsZC5sYXN0SW52b2thdGlvbi5zdWNjZXNzKCkpIHtcbiAgICByZXR1cm4gZmFpbCh3b3JsZCwgYEV4cGVjdGVkICR7ZmFpbHVyZS50b1N0cmluZygpfSwgYnV0IGxhc3QgaW52b2thdGlvbiB3YXMgc3VjY2Vzc2Z1bCB3aXRoIHJlc3VsdCAke0pTT04uc3RyaW5naWZ5KHdvcmxkLmxhc3RJbnZva2F0aW9uLnZhbHVlKX0uYCk7XG4gIH1cblxuICBpZiAod29ybGQubGFzdEludm9rYXRpb24uZXJyb3IpIHtcbiAgICByZXR1cm4gZmFpbCh3b3JsZCwgYEV4cGVjdGVkICR7ZmFpbHVyZS50b1N0cmluZygpfSwgYnV0IGxhc3QgaW52b2thdGlvbiB0aHJldyBlcnJvciAke3dvcmxkLmxhc3RJbnZva2F0aW9uLmVycm9yfS5gKTtcbiAgfVxuXG4gIGlmICh3b3JsZC5sYXN0SW52b2thdGlvbi5mYWlsdXJlcy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludm9rYXRpb24gcmVxdWlyZXMgc3VjY2VzcywgZmFpbHVyZSBvciBlcnJvciwgZ290OiAke3dvcmxkLmxhc3RJbnZva2F0aW9uLnRvU3RyaW5nKCl9YCk7XG4gIH1cblxuICBpZiAod29ybGQubGFzdEludm9rYXRpb24uZmFpbHVyZXMuZmluZCgoZikgPT4gZi5lcXVhbHMoZmFpbHVyZSkpID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZmFpbCh3b3JsZCwgYEV4cGVjdGVkICR7ZmFpbHVyZS50b1N0cmluZygpfSwgYnV0IGdvdCAke3dvcmxkLmxhc3RJbnZva2F0aW9uLmZhaWx1cmVzLnRvU3RyaW5nKCl9LmApO1xuICB9XG5cbiAgcmV0dXJuIHdvcmxkO1xufVxuXG4vLyBjb3ZlcmFnZSB0ZXN0cyBkb24ndCBjdXJyZW50bHkgc3VwcG9ydCBjaGVja2luZyBmdWxsIG1lc3NhZ2UgZ2l2ZW4gd2l0aCBhIHJldmVydFxuZnVuY3Rpb24gY292ZXJhZ2VTYWZlUmV2ZXJ0TWVzc2FnZSh3b3JsZDogV29ybGQsIG1lc3NhZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICh3b3JsZC5uZXR3b3JrID09PSAnY292ZXJhZ2UnKSB7XG4gICAgcmV0dXJuIFwicmV2ZXJ0XCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gYXNzZXJ0UmV2ZXJ0RmFpbHVyZSh3b3JsZDogV29ybGQsIGVycjogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPFdvcmxkPiB7XG4gIGlmICh3b3JsZC5uZXR3b3JrID09PSAnY292ZXJhZ2UnKSB7IC8vIGNvdmVyYWdlIGRvZXNuJ3QgaGF2ZSBkZXRhaWxlZCBtZXNzYWdlLCB0aHVzIG5vIHJldmVydCBmYWlsdXJlc1xuICAgIHJldHVybiBhd2FpdCBhc3NlcnRSZXZlcnQod29ybGQsIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKCF3b3JsZC5sYXN0SW52b2thdGlvbikge1xuICAgIHJldHVybiBmYWlsKHdvcmxkLCBgRXhwZWN0ZWQgcmV2ZXJ0IGZhaWx1cmUsIGJ1dCBtaXNzaW5nIGFueSBpbnZva2F0aW9ucy5gKTtcbiAgfVxuXG4gIGlmICh3b3JsZC5sYXN0SW52b2thdGlvbi5zdWNjZXNzKCkpIHtcbiAgICByZXR1cm4gZmFpbCh3b3JsZCwgYEV4cGVjdGVkIHJldmVydCBmYWlsdXJlLCBidXQgbGFzdCBpbnZva2F0aW9uIHdhcyBzdWNjZXNzZnVsIHdpdGggcmVzdWx0ICR7SlNPTi5zdHJpbmdpZnkod29ybGQubGFzdEludm9rYXRpb24udmFsdWUpfS5gKTtcbiAgfVxuXG4gIGlmICh3b3JsZC5sYXN0SW52b2thdGlvbi5mYWlsdXJlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCByZXZlcnQgZmFpbHVyZSwgYnV0IGdvdCAke3dvcmxkLmxhc3RJbnZva2F0aW9uLmZhaWx1cmVzLnRvU3RyaW5nKCl9LmApO1xuICB9XG5cbiAgaWYgKCF3b3JsZC5sYXN0SW52b2thdGlvbi5lcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52b2thdGlvbiByZXF1aXJlcyBzdWNjZXNzLCBmYWlsdXJlIG9yIGVycm9yLCBnb3Q6ICR7d29ybGQubGFzdEludm9rYXRpb24udG9TdHJpbmcoKX1gKTtcbiAgfVxuXG4gIGlmICghKHdvcmxkLmxhc3RJbnZva2F0aW9uLmVycm9yIGluc3RhbmNlb2YgSW52b2thdGlvblJldmVydEZhaWx1cmUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZva2F0aW9uIGVycm9yIG1pc21hdGNoLCBleHBlY3RlZCByZXZlcnQgZmFpbHVyZTogXCIke2Vycn0sICR7bWVzc2FnZX1cIiwgZ290OiBcIiR7d29ybGQubGFzdEludm9rYXRpb24uZXJyb3IudG9TdHJpbmcoKX1cImApO1xuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWRNZXNzYWdlID0gYFZNIEV4Y2VwdGlvbiB3aGlsZSBwcm9jZXNzaW5nIHRyYW5zYWN0aW9uOiAke2NvdmVyYWdlU2FmZVJldmVydE1lc3NhZ2Uod29ybGQsIG1lc3NhZ2UpfWA7XG5cbiAgaWYgKHdvcmxkLmxhc3RJbnZva2F0aW9uLmVycm9yLmVycm9yICE9PSBlcnIgfHwgd29ybGQubGFzdEludm9rYXRpb24uZXJyb3IuZXJyTWVzc2FnZSAhPT0gZXhwZWN0ZWRNZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZva2F0aW9uIGVycm9yIG1pc21hdGNoLCBleHBlY3RlZCByZXZlcnQgZmFpbHVyZTogZXJyPSR7ZXJyfSwgbWVzc2FnZT1cIiR7ZXhwZWN0ZWRNZXNzYWdlfVwiLCBnb3Q6IFwiJHt3b3JsZC5sYXN0SW52b2thdGlvbi5lcnJvci50b1N0cmluZygpfVwiYCk7XG4gIH1cblxuICByZXR1cm4gd29ybGQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzc2VydEVycm9yKHdvcmxkOiBXb3JsZCwgbWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTxXb3JsZD4ge1xuICBpZiAoIXdvcmxkLmxhc3RJbnZva2F0aW9uKSB7XG4gICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCByZXZlcnQsIGJ1dCBtaXNzaW5nIGFueSBpbnZva2F0aW9ucy5gKTtcbiAgfVxuXG4gIGlmICh3b3JsZC5sYXN0SW52b2thdGlvbi5zdWNjZXNzKCkpIHtcbiAgICByZXR1cm4gZmFpbCh3b3JsZCwgYEV4cGVjdGVkIHJldmVydCwgYnV0IGxhc3QgaW52b2thdGlvbiB3YXMgc3VjY2Vzc2Z1bCB3aXRoIHJlc3VsdCAke0pTT04uc3RyaW5naWZ5KHdvcmxkLmxhc3RJbnZva2F0aW9uLnZhbHVlKX0uYCk7XG4gIH1cblxuICBpZiAod29ybGQubGFzdEludm9rYXRpb24uZmFpbHVyZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBmYWlsKHdvcmxkLCBgRXhwZWN0ZWQgcmV2ZXJ0LCBidXQgZ290ICR7d29ybGQubGFzdEludm9rYXRpb24uZmFpbHVyZXMudG9TdHJpbmcoKX0uYCk7XG4gIH1cblxuICBpZiAoIXdvcmxkLmxhc3RJbnZva2F0aW9uLmVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZva2F0aW9uIHJlcXVpcmVzIHN1Y2Nlc3MsIGZhaWx1cmUgb3IgZXJyb3IsIGdvdDogJHt3b3JsZC5sYXN0SW52b2thdGlvbi50b1N0cmluZygpfWApO1xuICB9XG5cbiAgaWYgKCF3b3JsZC5sYXN0SW52b2thdGlvbi5lcnJvci5tZXNzYWdlLnN0YXJ0c1dpdGgobWVzc2FnZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludm9rYXRpb24gZXJyb3IgbWlzbWF0Y2gsIGV4cGVjdGVkOiBcIiR7bWVzc2FnZX1cIiwgZ290OiBcIiR7d29ybGQubGFzdEludm9rYXRpb24uZXJyb3IubWVzc2FnZX1cImApO1xuICB9XG5cbiAgcmV0dXJuIHdvcmxkO1xufVxuXG5mdW5jdGlvbiBidWlsZFJldmVydE1lc3NhZ2Uod29ybGQ6IFdvcmxkLCBtZXNzYWdlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYFZNIEV4Y2VwdGlvbiB3aGlsZSBwcm9jZXNzaW5nIHRyYW5zYWN0aW9uOiAke2NvdmVyYWdlU2FmZVJldmVydE1lc3NhZ2Uod29ybGQsIG1lc3NhZ2UpfWBcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXNzZXJ0UmV2ZXJ0KHdvcmxkOiBXb3JsZCwgbWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTxXb3JsZD4ge1xuICByZXR1cm4gYXdhaXQgYXNzZXJ0RXJyb3Iod29ybGQsIGJ1aWxkUmV2ZXJ0TWVzc2FnZSh3b3JsZCwgbWVzc2FnZSkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhc3NlcnRTdWNjZXNzKHdvcmxkOiBXb3JsZCk6IFByb21pc2U8V29ybGQ+IHtcbiAgaWYgKCF3b3JsZC5sYXN0SW52b2thdGlvbiB8fCB3b3JsZC5sYXN0SW52b2thdGlvbi5zdWNjZXNzKCkpIHtcbiAgICByZXR1cm4gd29ybGQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCBzdWNjZXNzLCBidXQgZ290ICR7d29ybGQubGFzdEludm9rYXRpb24udG9TdHJpbmcoKX0uYCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gYXNzZXJ0UmVhZEVycm9yKHdvcmxkOiBXb3JsZCwgZXZlbnQ6IEV2ZW50LCBtZXNzYWdlOiBzdHJpbmcsIGlzUmV2ZXJ0OiBib29sZWFuKTogUHJvbWlzZTxXb3JsZD4ge1xuICB0cnkge1xuICAgIGxldCB2YWx1ZSA9IGF3YWl0IGdldENvcmVWYWx1ZSh3b3JsZCwgZXZlbnQpO1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCByZWFkIHJldmVydCwgaW5zdGVhZCBnb3QgdmFsdWUgXFxgJHt2YWx1ZX1cXGBgKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbGV0IGV4cGVjdGVkTWVzc2FnZTtcbiAgICBpZiAoaXNSZXZlcnQpIHtcbiAgICAgIGV4cGVjdGVkTWVzc2FnZSA9IGJ1aWxkUmV2ZXJ0TWVzc2FnZSh3b3JsZCwgbWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cGVjdGVkTWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuXG4gICAgd29ybGQuZXhwZWN0KGV4cGVjdGVkTWVzc2FnZSkudG9FcXVhbChlcnIubWVzc2FnZSk7IC8vIFhYWFMgXCJleHBlY3RlZCByZWFkIHJldmVydFwiXG4gIH1cblxuICByZXR1cm4gd29ybGQ7XG59XG5cbmZ1bmN0aW9uIGdldExvZ1ZhbHVlKHZhbHVlOiBhbnkpOiBWYWx1ZSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8ICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLm1hdGNoKC9eWzAtOV0rJC8pKSkge1xuICAgIHJldHVybiBuZXcgTnVtYmVyVihOdW1iZXIodmFsdWUpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdWKHZhbHVlKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgIHJldHVybiBuZXcgQm9vbFYodmFsdWUpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIG5ldyBMaXN0Vih2YWx1ZS5tYXAoZ2V0TG9nVmFsdWUpKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdHlwZSBvZiBsb2cgcGFyYW1ldGVyOiAke3ZhbHVlfScpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFzc2VydExvZyh3b3JsZDogV29ybGQsIGV2ZW50OiBzdHJpbmcsIGtleVZhbHVlczogTWFwVik6IFByb21pc2U8V29ybGQ+IHtcbiAgaWYgKCF3b3JsZC5sYXN0SW52b2thdGlvbikge1xuICAgIHJldHVybiBmYWlsKHdvcmxkLCBgRXhwZWN0ZWQgbG9nIG1lc3NhZ2UgXCIke2V2ZW50fVwiIGZyb20gY29udHJhY3QgZXhlY3V0aW9uLCBidXQgd29ybGQgbWlzc2luZyBhbnkgaW52b2thdGlvbnMuYCk7XG4gIH0gZWxzZSBpZiAoIXdvcmxkLmxhc3RJbnZva2F0aW9uLnJlY2VpcHQpIHtcbiAgICByZXR1cm4gZmFpbCh3b3JsZCwgYEV4cGVjdGVkIGxvZyBtZXNzYWdlIFwiJHtldmVudH1cIiBmcm9tIGNvbnRyYWN0IGV4ZWN1dGlvbiwgYnV0IHdvcmxkIGludm9rYXRpb24gdHJhbnNhY3Rpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbG9nID0gd29ybGQubGFzdEludm9rYXRpb24ucmVjZWlwdC5ldmVudHMgJiYgd29ybGQubGFzdEludm9rYXRpb24ucmVjZWlwdC5ldmVudHNbZXZlbnRdO1xuXG4gICAgaWYgKCFsb2cpIHtcbiAgICAgIGNvbnN0IGV2ZW50cyA9IE9iamVjdC5rZXlzKHdvcmxkLmxhc3RJbnZva2F0aW9uLnJlY2VpcHQuZXZlbnRzIHx8IHt9KS5qb2luKCcsICcpO1xuICAgICAgcmV0dXJuIGZhaWwod29ybGQsIGBFeHBlY3RlZCBsb2cgd2l0aCBldmVudCBcXGAke2V2ZW50fVxcYCwgZm91bmQgbG9ncyB3aXRoIGV2ZW50czogWyR7ZXZlbnRzfV1gKTtcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShsb2cpKSB7XG4gICAgICBjb25zdCBmb3VuZCA9IGxvZy5maW5kKF9sb2cgPT4ge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMoa2V5VmFsdWVzLnZhbCkucmVkdWNlKChwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUpID0+IHtcbiAgICAgICAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBjdXJyZW50VmFsdWU7XG4gICAgICAgICAgaWYgKHByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChfbG9nLnJldHVyblZhbHVlc1trZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbGV0IGxvZ1ZhbHVlID0gZ2V0TG9nVmFsdWUoX2xvZy5yZXR1cm5WYWx1ZXNba2V5XSk7XG5cbiAgICAgICAgICAgICAgaWYgKCFsb2dWYWx1ZS5jb21wYXJlVG8od29ybGQsIHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcHJldmlvdXNWYWx1ZTtcbiAgICAgICAgfSwgdHJ1ZSBhcyBib29sZWFuKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50RXhwZWN0ZWQgPSBPYmplY3QuZW50cmllcyhrZXlWYWx1ZXMudmFsKS5qb2luKCcsICcpO1xuICAgICAgICBjb25zdCBldmVudERldGFpbHNGb3VuZCA9IGxvZy5tYXAoX2xvZyA9PiB7XG4gICAgICAgICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKF9sb2cucmV0dXJuVmFsdWVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWlsKHdvcmxkLCBgRXhwZWN0ZWQgbG9nIHdpdGggZXZlbnQgXFxgJHtldmVudEV4cGVjdGVkfVxcYCwgZm91bmQgbG9ncyBmb3IgdGhpcyBldmVudCB3aXRoOiBbJHtldmVudERldGFpbHNGb3VuZH1dYCk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmVudHJpZXMoa2V5VmFsdWVzLnZhbCkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGlmIChsb2cucmV0dXJuVmFsdWVzW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGZhaWwod29ybGQsIGBFeHBlY3RlZCBsb2cgdG8gaGF2ZSBwYXJhbSBmb3IgXFxgJHtrZXl9XFxgYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGxvZ1ZhbHVlID0gZ2V0TG9nVmFsdWUobG9nLnJldHVyblZhbHVlc1trZXldKTtcblxuICAgICAgICAgIGlmICghbG9nVmFsdWUuY29tcGFyZVRvKHdvcmxkLCB2YWx1ZSkpIHtcbiAgICAgICAgICAgIGZhaWwod29ybGQsIGBFeHBlY3RlZCBsb2cgdG8gaGF2ZSBwYXJhbSBcXGAke2tleX1cXGAgdG8gbWF0Y2ggJHt2YWx1ZS50b1N0cmluZygpfSwgYnV0IGdvdCAke2xvZ1ZhbHVlLnRvU3RyaW5nKCl9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gd29ybGQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydGlvbkNvbW1hbmRzKCkge1xuICByZXR1cm4gW1xuICAgIG5ldyBWaWV3PHsgZ2l2ZW46IE51bWJlclYsIGV4cGVjdGVkOiBOdW1iZXJWLCB0b2xlcmFuY2U6IE51bWJlclYgfT4oYFxuICAgICAgICAjIyMjIEFwcHJveFxuXG4gICAgICAgICogXCJBcHByb3ggZ2l2ZW46PFZhbHVlPiBleHBlY3RlZDo8VmFsdWU+IHRvbGVyYW5jZTo8VmFsdWU+XCIgLSBBc3NlcnRzIHRoYXQgZ2l2ZW4gYXBwcm94aW1hdGVseSBtYXRjaGVzIGV4cGVjdGVkLlxuICAgICAgICAgICogRS5nLiBcIkFzc2VydCBBcHByb3ggKEV4YWN0bHkgMCkgWmVybyBcIlxuICAgICAgICAgICogRS5nLiBcIkFzc2VydCBBcHByb3ggKENUb2tlbiBjWlJYIFRvdGFsU3VwcGx5KSAoRXhhY3RseSA1NSkgMWUtMThcIlxuICAgICAgICAgICogRS5nLiBcIkFzc2VydCBBcHByb3ggKENUb2tlbiBjWlJYIENvbXB0cm9sbGVyKSAoQ29tcHRyb2xsZXIgQWRkcmVzcykgMVwiXG4gICAgICBgLFxuICAgICAgXCJBcHByb3hcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImdpdmVuXCIsIGdldE51bWJlclYpLFxuICAgICAgICBuZXcgQXJnKFwiZXhwZWN0ZWRcIiwgZ2V0TnVtYmVyViksXG4gICAgICAgIG5ldyBBcmcoXCJ0b2xlcmFuY2VcIiwgZ2V0TnVtYmVyViwgeyBkZWZhdWx0OiBuZXcgTnVtYmVyVigwLjAwMSkgfSlcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHsgZ2l2ZW4sIGV4cGVjdGVkLCB0b2xlcmFuY2UgfSkgPT4gYXNzZXJ0QXBwcm94KHdvcmxkLCBnaXZlbiwgZXhwZWN0ZWQsIHRvbGVyYW5jZSlcbiAgICApLFxuXG4gICAgbmV3IFZpZXc8eyBnaXZlbjogVmFsdWUsIGV4cGVjdGVkOiBWYWx1ZSB9PihgXG4gICAgICAgICMjIyMgRXF1YWxcblxuICAgICAgICAqIFwiRXF1YWwgZ2l2ZW46PFZhbHVlPiBleHBlY3RlZDo8VmFsdWU+XCIgLSBBc3NlcnRzIHRoYXQgZ2l2ZW4gbWF0Y2hlcyBleHBlY3RlZC5cbiAgICAgICAgICAqIEUuZy4gXCJBc3NlcnQgRXF1YWwgKEV4YWN0bHkgMCkgWmVyb1wiXG4gICAgICAgICAgKiBFLmcuIFwiQXNzZXJ0IEVxdWFsIChDVG9rZW4gY1pSWCBUb3RhbFN1cHBseSkgKEV4YWN0bHkgNTUpXCJcbiAgICAgICAgICAqIEUuZy4gXCJBc3NlcnQgRXF1YWwgKENUb2tlbiBjWlJYIENvbXB0cm9sbGVyKSAoQ29tcHRyb2xsZXIgQWRkcmVzcylcIlxuICAgICAgYCxcbiAgICAgIFwiRXF1YWxcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImdpdmVuXCIsIGdldENvcmVWYWx1ZSksXG4gICAgICAgIG5ldyBBcmcoXCJleHBlY3RlZFwiLCBnZXRDb3JlVmFsdWUpXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7IGdpdmVuLCBleHBlY3RlZCB9KSA9PiBhc3NlcnRFcXVhbCh3b3JsZCwgZ2l2ZW4sIGV4cGVjdGVkKVxuICAgICksXG5cbiAgICBuZXcgVmlldzx7IGdpdmVuOiBWYWx1ZSwgZXhwZWN0ZWQ6IFZhbHVlIH0+KGBcbiAgICAgICAgIyMjIyBMZXNzVGhhblxuXG4gICAgICAgICogXCJnaXZlbjo8VmFsdWU+IExlc3NUaGFuIGV4cGVjdGVkOjxWYWx1ZT5cIiAtIEFzc2VydHMgdGhhdCBnaXZlbiBpcyBsZXNzIHRoYW4gZXhwZWN0ZWQuXG4gICAgICAgICAgKiBFLmcuIFwiQXNzZXJ0IChFeGFjdGx5IDApIExlc3NUaGFuIChFeGFjdGx5IDEpXCJcbiAgICAgIGAsXG4gICAgICBcIkxlc3NUaGFuXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJnaXZlblwiLCBnZXRDb3JlVmFsdWUpLFxuICAgICAgICBuZXcgQXJnKFwiZXhwZWN0ZWRcIiwgZ2V0Q29yZVZhbHVlKVxuICAgICAgXSxcbiAgICAgICh3b3JsZCwgeyBnaXZlbiwgZXhwZWN0ZWQgfSkgPT4gYXNzZXJ0TGVzc1RoYW4od29ybGQsIGdpdmVuLCBleHBlY3RlZCksXG4gICAgICB7IG5hbWVQb3M6IDEgfVxuICAgICksXG5cbiAgICBuZXcgVmlldzx7IGdpdmVuOiBWYWx1ZSwgZXhwZWN0ZWQ6IFZhbHVlIH0+KGBcbiAgICAgICAgIyMjIyBHcmVhdGVyVGhhblxuXG4gICAgICAgICogXCJnaXZlbjo8VmFsdWU+IEdyZWF0ZXJUaGFuIGV4cGVjdGVkOjxWYWx1ZT5cIiAtIEFzc2VydHMgdGhhdCBnaXZlbiBpcyBncmVhdGVyIHRoYW4gdGhlIGV4cGVjdGVkLlxuICAgICAgICAgICogRS5nLiBcIkFzc2VydCAoRXhhY3RseSAwKSBHcmVhdGVyVGhhbiAoRXhhY3RseSAxKVwiXG4gICAgICBgLFxuICAgICAgXCJHcmVhdGVyVGhhblwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiZ2l2ZW5cIiwgZ2V0Q29yZVZhbHVlKSxcbiAgICAgICAgbmV3IEFyZyhcImV4cGVjdGVkXCIsIGdldENvcmVWYWx1ZSlcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHsgZ2l2ZW4sIGV4cGVjdGVkIH0pID0+IGFzc2VydEdyZWF0ZXJUaGFuKHdvcmxkLCBnaXZlbiwgZXhwZWN0ZWQpLFxuICAgICAgeyBuYW1lUG9zOiAxIH1cbiAgICApLFxuXG4gICAgbmV3IFZpZXc8eyBnaXZlbjogVmFsdWUgfT4oYFxuICAgICAgICAjIyMjIFRydWVcblxuICAgICAgICAqIFwiVHJ1ZSBnaXZlbjo8VmFsdWU+XCIgLSBBc3NlcnRzIHRoYXQgZ2l2ZW4gaXMgdHJ1ZS5cbiAgICAgICAgICAqIEUuZy4gXCJBc3NlcnQgVHJ1ZSAoQ29tcHRyb2xsZXIgQ2hlY2tNZW1iZXJzaGlwIEdlb2ZmIGNFVEgpXCJcbiAgICAgIGAsXG4gICAgICBcIlRydWVcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImdpdmVuXCIsIGdldENvcmVWYWx1ZSlcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHsgZ2l2ZW4gfSkgPT4gYXNzZXJ0RXF1YWwod29ybGQsIGdpdmVuLCBuZXcgQm9vbFYodHJ1ZSkpXG4gICAgKSxcblxuICAgIG5ldyBWaWV3PHsgZ2l2ZW46IFZhbHVlIH0+KGBcbiAgICAgICAgIyMjIyBGYWxzZVxuXG4gICAgICAgICogXCJGYWxzZSBnaXZlbjo8VmFsdWU+XCIgLSBBc3NlcnRzIHRoYXQgZ2l2ZW4gaXMgZmFsc2UuXG4gICAgICAgICAgKiBFLmcuIFwiQXNzZXJ0IEZhbHNlIChDb21wdHJvbGxlciBDaGVja01lbWJlcnNoaXAgR2VvZmYgY0VUSClcIlxuICAgICAgYCxcbiAgICAgIFwiRmFsc2VcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImdpdmVuXCIsIGdldENvcmVWYWx1ZSlcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHsgZ2l2ZW4gfSkgPT4gYXNzZXJ0RXF1YWwod29ybGQsIGdpdmVuLCBuZXcgQm9vbFYoZmFsc2UpKVxuICAgICksXG4gICAgbmV3IFZpZXc8eyBldmVudDogRXZlbnRWLCBtZXNzYWdlOiBTdHJpbmdWIH0+KGBcbiAgICAgICAgIyMjIyBSZWFkUmV2ZXJ0XG5cbiAgICAgICAgKiBcIlJlYWRSZXZlcnQgZXZlbnQ6PEV2ZW50PiBtZXNzYWdlOjxTdHJpbmc+XCIgLSBBc3NlcnRzIHRoYXQgcmVhZGluZyB0aGUgZ2l2ZW4gdmFsdWUgcmV2ZXJ0cyB3aXRoIGdpdmVuIG1lc3NhZ2UuXG4gICAgICAgICAgKiBFLmcuIFwiQXNzZXJ0IFJlYWRSZXZlcnQgKENvbXB0cm9sbGVyIENoZWNrTWVtYmVyc2hpcCBHZW9mZiBjRVRIKSBcXFwicmV2ZXJ0XFxcIlwiXG4gICAgICBgLFxuICAgICAgXCJSZWFkUmV2ZXJ0XCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJldmVudFwiLCBnZXRFdmVudFYpLFxuICAgICAgICBuZXcgQXJnKFwibWVzc2FnZVwiLCBnZXRTdHJpbmdWKVxuICAgICAgXSxcbiAgICAgICh3b3JsZCwgeyBldmVudCwgbWVzc2FnZSB9KSA9PiBhc3NlcnRSZWFkRXJyb3Iod29ybGQsIGV2ZW50LnZhbCwgbWVzc2FnZS52YWwsIHRydWUpXG4gICAgKSxcblxuICAgIG5ldyBWaWV3PHsgZXZlbnQ6IEV2ZW50ViwgbWVzc2FnZTogU3RyaW5nViB9PihgXG4gICAgICAgICMjIyMgUmVhZEVycm9yXG5cbiAgICAgICAgKiBcIlJlYWRFcnJvciBldmVudDo8RXZlbnQ+IG1lc3NhZ2U6PFN0cmluZz5cIiAtIEFzc2VydHMgdGhhdCByZWFkaW5nIHRoZSBnaXZlbiB2YWx1ZSB0aHJvd3MgZ2l2ZW4gZXJyb3JcbiAgICAgICAgICAqIEUuZy4gXCJBc3NlcnQgUmVhZEVycm9yIChDb21wdHJvbGxlciBCYWQgQWRkcmVzcykgXFxcImNhbm5vdCBmaW5kIGNvbXB0cm9sbGVyXFxcIlwiXG4gICAgICBgLFxuICAgICAgXCJSZWFkRXJyb3JcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImV2ZW50XCIsIGdldEV2ZW50ViksXG4gICAgICAgIG5ldyBBcmcoXCJtZXNzYWdlXCIsIGdldFN0cmluZ1YpXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7IGV2ZW50LCBtZXNzYWdlIH0pID0+IGFzc2VydFJlYWRFcnJvcih3b3JsZCwgZXZlbnQudmFsLCBtZXNzYWdlLnZhbCwgZmFsc2UpXG4gICAgKSxcblxuICAgIG5ldyBWaWV3PHsgZXJyb3I6IFN0cmluZ1YsIGluZm86IFN0cmluZ1YsIGRldGFpbDogU3RyaW5nViB9PihgXG4gICAgICAgICMjIyMgRmFpbHVyZVxuXG4gICAgICAgICogXCJGYWlsdXJlIGVycm9yOjxTdHJpbmc+IGluZm86PFN0cmluZz4gZGV0YWlsOjxOdW1iZXI/PlwiIC0gQXNzZXJ0cyB0aGF0IGxhc3QgdHJhbnNhY3Rpb24gaGFkIGEgZ3JhY2VmdWwgZmFpbHVyZSB3aXRoIGdpdmVuIGVycm9yLCBpbmZvIGFuZCBkZXRhaWwuXG4gICAgICAgICAgKiBFLmcuIFwiQXNzZXJ0IEZhaWx1cmUgVU5BVVRIT1JJWkVEIFNVUFBPUlRfTUFSS0VUX09XTkVSX0NIRUNLXCJcbiAgICAgICAgICAqIEUuZy4gXCJBc3NlcnQgRmFpbHVyZSBNQVRIX0VSUk9SIE1JTlRfQ0FMQ1VMQVRFX0JBTEFOQ0UgNVwiXG4gICAgICBgLFxuICAgICAgXCJGYWlsdXJlXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJlcnJvclwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcImluZm9cIiwgZ2V0U3RyaW5nViksXG4gICAgICAgIG5ldyBBcmcoXCJkZXRhaWxcIiwgZ2V0U3RyaW5nViwgeyBkZWZhdWx0OiBuZXcgU3RyaW5nVihcIjBcIikgfSksXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7IGVycm9yLCBpbmZvLCBkZXRhaWwgfSkgPT4gYXNzZXJ0RmFpbHVyZSh3b3JsZCwgbmV3IEZhaWx1cmUoZXJyb3IudmFsLCBpbmZvLnZhbCwgZGV0YWlsLnZhbCkpXG4gICAgKSxcblxuICAgIG5ldyBWaWV3PHsgZXJyb3I6IFN0cmluZ1YsIG1lc3NhZ2U6IFN0cmluZ1YgfT4oYFxuICAgICAgICAjIyMjIFJldmVydEZhaWx1cmVcblxuICAgICAgICAqIFwiUmV2ZXJ0RmFpbHVyZSBlcnJvcjo8U3RyaW5nPiBtZXNzYWdlOjxTdHJpbmc+XCIgLSBBc3NlcnQgbGFzdCB0cmFuc2FjdGlvbiByZXZlcnRlZCB3aXRoIGEgbWVzc2FnZSBiZWdpbm5pbmcgd2l0aCBhbiBlcnJvciBjb2RlXG4gICAgICAgICAgKiBFLmcuIFwiQXNzZXJ0IFJldmVydEZhaWx1cmUgVU5BVVRIT1JJWkVEIFxcXCJzZXQgcmVzZXJ2ZXMgZmFpbGVkXFxcIlwiXG4gICAgICBgLFxuICAgICAgXCJSZXZlcnRGYWlsdXJlXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJlcnJvclwiLCBnZXRTdHJpbmdWKSxcbiAgICAgICAgbmV3IEFyZyhcIm1lc3NhZ2VcIiwgZ2V0U3RyaW5nViksXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7IGVycm9yLCBtZXNzYWdlIH0pID0+IGFzc2VydFJldmVydEZhaWx1cmUod29ybGQsIGVycm9yLnZhbCwgbWVzc2FnZS52YWwpXG4gICAgKSxcblxuICAgIG5ldyBWaWV3PHsgbWVzc2FnZTogU3RyaW5nViB9PihgXG4gICAgICAgICMjIyMgUmV2ZXJ0XG5cbiAgICAgICAgKiBcIlJldmVydCBtZXNzYWdlOjxTdHJpbmc+XCIgLSBBc3NlcnRzIHRoYXQgdGhlIGxhc3QgdHJhbnNhY3Rpb24gcmV2ZXJ0ZWQuXG4gICAgICBgLFxuICAgICAgXCJSZXZlcnRcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcIm1lc3NhZ2VcIiwgZ2V0U3RyaW5nViwgeyBkZWZhdWx0OiBuZXcgU3RyaW5nVihcInJldmVydFwiKSB9KSxcbiAgICAgIF0sXG4gICAgICAod29ybGQsIHsgbWVzc2FnZSB9KSA9PiBhc3NlcnRSZXZlcnQod29ybGQsIG1lc3NhZ2UudmFsKVxuICAgICksXG5cbiAgICBuZXcgVmlldzx7IG1lc3NhZ2U6IFN0cmluZ1YgfT4oYFxuICAgICAgICAjIyMjIEVycm9yXG5cbiAgICAgICAgKiBcIkVycm9yIG1lc3NhZ2U6PFN0cmluZz5cIiAtIEFzc2VydHMgdGhhdCB0aGUgbGFzdCB0cmFuc2FjdGlvbiBoYWQgdGhlIGdpdmVuIGVycm9yLlxuICAgICAgYCxcbiAgICAgIFwiRXJyb3JcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcIm1lc3NhZ2VcIiwgZ2V0U3RyaW5nViksXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7IG1lc3NhZ2UgfSkgPT4gYXNzZXJ0RXJyb3Iod29ybGQsIG1lc3NhZ2UudmFsKVxuICAgICksXG5cbiAgICBuZXcgVmlldzx7IGdpdmVuOiBWYWx1ZSB9PihgXG4gICAgICAgICMjIyMgU3VjY2Vzc1xuXG4gICAgICAgICogXCJTdWNjZXNzXCIgLSBBc3NlcnRzIHRoYXQgdGhlIGxhc3QgdHJhbnNhY3Rpb24gY29tcGxldGVkIHN1Y2Nlc3NmdWxseSAodGhhdCBpcywgZGlkIG5vdCByZXZlcnQgbm9yIGVtaXQgZ3JhY2VmdWwgZmFpbHVyZSkuXG4gICAgICBgLFxuICAgICAgXCJTdWNjZXNzXCIsXG4gICAgICBbXSxcbiAgICAgICh3b3JsZCwgeyBnaXZlbiB9KSA9PiBhc3NlcnRTdWNjZXNzKHdvcmxkKVxuICAgICksXG5cbiAgICBuZXcgVmlldzx7IG5hbWU6IFN0cmluZ1YsIHBhcmFtczogTWFwViB9PihgXG4gICAgICAgICMjIyMgTG9nXG5cbiAgICAgICAgKiBcIkxvZyBuYW1lOjxTdHJpbmc+IChrZXk6PFN0cmluZz4gdmFsdWU6PFZhbHVlPikgLi4uXCIgLSBBc3NlcnRzIHRoYXQgbGFzdCB0cmFuc2FjdGlvbiBlbWl0dGVkIGxvZyB3aXRoIGdpdmVuIG5hbWUgYW5kIGtleS12YWx1ZSBwYWlycy5cbiAgICAgICAgICAqIEUuZy4gXCJBc3NlcnQgTG9nIE1pbnRlZCAoXCJhY2NvdW50XCIgKFVzZXIgR2VvZmYgYWRkcmVzcykpIChcImFtb3VudFwiIChFeGFjdGx5IDU1KSlcIlxuICAgICAgYCxcbiAgICAgIFwiTG9nXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJuYW1lXCIsIGdldFN0cmluZ1YpLFxuICAgICAgICBuZXcgQXJnKFwicGFyYW1zXCIsIGdldE1hcFYsIHsgdmFyaWFkaWM6IHRydWUgfSksXG4gICAgICBdLFxuICAgICAgKHdvcmxkLCB7IG5hbWUsIHBhcmFtcyB9KSA9PiBhc3NlcnRMb2cod29ybGQsIG5hbWUudmFsLCBwYXJhbXMpXG4gICAgKVxuICBdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0Fzc2VydGlvbkV2ZW50KHdvcmxkOiBXb3JsZCwgZXZlbnQ6IEV2ZW50LCBmcm9tOiBzdHJpbmcgfCBudWxsKTogUHJvbWlzZTxXb3JsZD4ge1xuICByZXR1cm4gYXdhaXQgcHJvY2Vzc0NvbW1hbmRFdmVudDxhbnk+KFwiQXNzZXJ0aW9uXCIsIGFzc2VydGlvbkNvbW1hbmRzKCksIHdvcmxkLCBldmVudCwgZnJvbSk7XG59XG4iXX0=
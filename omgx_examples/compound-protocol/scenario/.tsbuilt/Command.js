"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFetcherValue = exports.processCommandEvent = exports.Fetcher = exports.View = exports.Command = exports.Expression = exports.Arg = void 0;
const Utils_1 = require("./Utils");
const Value_1 = require("./Value");
class Arg {
    constructor(name, getter, opts = {}) {
        this.name = name;
        this.getter = getter;
        this.defaultValue = opts.default;
        this.implicit = !!opts.implicit;
        this.variadic = !!opts.variadic;
        this.mapped = !!opts.mapped;
        this.nullable = !!opts.nullable;
        this.rescue = opts.rescue;
    }
}
exports.Arg = Arg;
class Expression {
    constructor(doc, name, args, opts = {}) {
        this.doc = Command.cleanDoc(doc);
        this.name = name;
        this.args = args;
        this.namePos = opts.namePos || 0;
        this.catchall = opts.catchall || false;
        this.subExpressions = opts.subExpressions || [];
    }
    getNameArgs(event) {
        // Unwrap double-wrapped expressions e.g. [[Exactly, "1.0"]] -> ["Exactly", "1.0"]
        if (Array.isArray(event) && event.length === 1 && Array.isArray(event[0])) {
            const [eventInner] = event;
            return this.getNameArgs(eventInner);
        }
        // Let's allow single-length complex expressions to be passed without parens e.g. "True" -> ["True"]
        if (!Array.isArray(event)) {
            event = [event];
        }
        if (this.catchall) {
            return [this.name, event];
        }
        else {
            let args = event.slice();
            let [name] = args.splice(this.namePos, 1);
            if (Array.isArray(name)) {
                return [null, event];
            }
            return [name, args];
        }
    }
    matches(event) {
        if (this.catchall) {
            return true;
        }
        const [name, _args] = this.getNameArgs(event);
        return !!name && name.toLowerCase().trim() === this.name.toLowerCase().trim();
    }
    async getArgs(world, event) {
        const [_name, eventArgs] = this.getNameArgs(event);
        let initialAcc = { currArgs: {}, currEvents: eventArgs };
        const { currArgs: args, currEvents: restEvent } = await this.args.reduce(async (acc, arg) => {
            let { currArgs, currEvents } = await acc;
            let val;
            let restEventArgs;
            if (arg.nullable && currEvents.length === 0) { // Note this is zero-length string or zero-length array
                val = new Value_1.NothingV();
                restEventArgs = currEvents;
            }
            else if (arg.variadic) {
                if (arg.mapped) {
                    // If mapped, mapped the function over each event arg
                    val = await Promise.all(currEvents.map((event) => arg.getter(world, event)));
                }
                else {
                    val = await arg.getter(world, currEvents);
                }
                restEventArgs = [];
            }
            else if (arg.implicit) {
                val = await arg.getter(world);
                restEventArgs = currEvents;
            }
            else {
                let eventArg;
                [eventArg, ...restEventArgs] = currEvents;
                if (eventArg === undefined) {
                    if (arg.defaultValue !== undefined) {
                        val = arg.defaultValue;
                    }
                    else {
                        throw new Error(`Missing argument ${arg.name} when processing ${this.name}`);
                    }
                }
                else {
                    try {
                        if (arg.mapped) {
                            val = await await Promise.all(Utils_1.mustArray(eventArg).map((el) => arg.getter(world, el)));
                        }
                        else {
                            val = await arg.getter(world, eventArg);
                        }
                    }
                    catch (err) {
                        if (arg.rescue) {
                            // Rescue is meant to allow Gate to work for checks that
                            // fail due to the missing components, e.g.:
                            // `Gate (CToken Eth Address) (... deploy cToken)`
                            // could be used to deploy a cToken if it doesn't exist, but
                            // since there is no CToken, that check would raise (when we'd
                            // hope it just returns null). So here, we allow our code to rescue
                            // errors and recover, but we need to be smarter about catching specific
                            // errors instead of all errors. For now, to assist debugging, we may print
                            // any error that comes up, even if it was intended.
                            // world.printer.printError(err);
                            val = arg.rescue;
                        }
                        else {
                            throw err;
                        }
                    }
                }
            }
            let newArgs = {
                ...currArgs,
                [arg.name]: val
            };
            return {
                currArgs: newArgs,
                currEvents: restEventArgs
            };
        }, Promise.resolve(initialAcc));
        if (restEvent.length !== 0) {
            throw new Error(`Found extra args: ${restEvent.toString()} when processing ${this.name}`);
        }
        return args;
    }
    static cleanDoc(doc) {
        return doc.replace(/^\s+/mg, '').replace(/"/g, '`');
    }
}
exports.Expression = Expression;
class Command extends Expression {
    constructor(doc, name, args, processor, opts = {}) {
        super(doc, name, args, opts);
        this.requireFrom = true;
        this.processor = processor;
    }
    async process(world, from, event) {
        let args = await this.getArgs(world, event);
        if (this.requireFrom) {
            if (!from) {
                throw new Error(`From required but not given for ${this.name}. Please set a default alias or open unlocked account`);
            }
            return await this.processor(world, from, args);
        }
        else {
            return await this.processor(world, null, args);
        }
    }
}
exports.Command = Command;
class View extends Command {
    constructor(doc, name, args, processor, opts = {}) {
        super(doc, name, args, (world, from, args) => processor(world, args), opts);
        this.requireFrom = false;
    }
}
exports.View = View;
class Fetcher extends Expression {
    constructor(doc, name, args, fetcher, opts = {}) {
        super(doc, name, args, opts);
        this.fetcher = fetcher;
    }
    async fetch(world, event) {
        let args = await this.getArgs(world, event);
        return await this.fetcher(world, args);
    }
}
exports.Fetcher = Fetcher;
async function processCommandEvent(type, commands, world, event, from) {
    let matchingCommand = commands.find((command) => command.matches(event));
    if (!matchingCommand) {
        throw new Error(`Found unknown ${type} event type ${event.toString()}`);
    }
    return matchingCommand.process(world, from, event);
}
exports.processCommandEvent = processCommandEvent;
async function getFetcherValue(type, fetchers, world, event) {
    let matchingFetcher = fetchers.find((fetcher) => fetcher.matches(event));
    if (!matchingFetcher) {
        throw new Error(`Found unknown ${type} value type ${JSON.stringify(event)}`);
    }
    return matchingFetcher.fetch(world, event);
}
exports.getFetcherValue = getFetcherValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db21tYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1DQUFrQztBQUNsQyxtQ0FBaUM7QUFXakMsTUFBYSxHQUFHO0lBV2QsWUFBWSxJQUFZLEVBQUUsTUFBcUMsRUFBRSxPQUFtQixFQUFFO1FBQ3BGLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0NBQ0Y7QUFyQkQsa0JBcUJDO0FBUUQsTUFBc0IsVUFBVTtJQVE5QixZQUFZLEdBQVcsRUFBRSxJQUFZLEVBQUUsSUFBZ0IsRUFBRSxPQUFxQixFQUFFO1FBQzlFLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFD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LENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUV6RSxJQUFJLENBQUMsZUFBZSxFQUFFO1FBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLElBQUksZUFBZSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUM5RTtJQUVELE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQVJELDBDQVFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtFdmVudH0gZnJvbSAnLi9FdmVudCc7XG5pbXBvcnQge1dvcmxkfSBmcm9tICcuL1dvcmxkJztcbmltcG9ydCB7bXVzdEFycmF5fSBmcm9tICcuL1V0aWxzJztcbmltcG9ydCB7Tm90aGluZ1Z9IGZyb20gJy4vVmFsdWUnO1xuXG5pbnRlcmZhY2UgQXJnT3B0czxUPiB7XG4gIGRlZmF1bHQ/OiBUIHwgVFtdXG4gIGltcGxpY2l0PzogYm9vbGVhblxuICB2YXJpYWRpYz86IGJvb2xlYW5cbiAgbWFwcGVkPzogYm9vbGVhblxuICBudWxsYWJsZT86IGJvb2xlYW5cbiAgcmVzY3VlPzogVFxufVxuXG5leHBvcnQgY2xhc3MgQXJnPFQ+IHtcbiAgbmFtZTogc3RyaW5nXG4gIHR5cGU6IGFueVxuICBnZXR0ZXI6IChXb3JsZCwgRXZlbnQ/KSA9PiBQcm9taXNlPFQ+XG4gIGRlZmF1bHRWYWx1ZTogVCB8IFRbXSB8IHVuZGVmaW5lZFxuICBpbXBsaWNpdDogYm9vbGVhblxuICB2YXJpYWRpYzogYm9vbGVhblxuICBtYXBwZWQ6IGJvb2xlYW5cbiAgbnVsbGFibGU6IGJvb2xlYW5cbiAgcmVzY3VlOiBUIHwgdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBnZXR0ZXI6IChXb3JsZCwgRXZlbnQ/KSA9PiBQcm9taXNlPFQ+LCBvcHRzID0gPEFyZ09wdHM8VD4+e30pIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuZ2V0dGVyID0gZ2V0dGVyO1xuICAgIHRoaXMuZGVmYXVsdFZhbHVlID0gb3B0cy5kZWZhdWx0O1xuICAgIHRoaXMuaW1wbGljaXQgPSAhIW9wdHMuaW1wbGljaXQ7XG4gICAgdGhpcy52YXJpYWRpYyA9ICEhb3B0cy52YXJpYWRpYztcbiAgICB0aGlzLm1hcHBlZCA9ICEhb3B0cy5tYXBwZWQ7XG4gICAgdGhpcy5udWxsYWJsZSA9ICEhb3B0cy5udWxsYWJsZTtcbiAgICB0aGlzLnJlc2N1ZSA9IG9wdHMucmVzY3VlO1xuICB9XG59XG5cbmludGVyZmFjZSBFeHByZXNzaW9uT3B0cyB7XG4gIG5hbWVQb3M/OiBudW1iZXJcbiAgY2F0Y2hhbGw/OiBib29sZWFuXG4gIHN1YkV4cHJlc3Npb25zPzogRXhwcmVzc2lvbjxhbnk+W11cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEV4cHJlc3Npb248QXJncz4ge1xuICBkb2M6IHN0cmluZ1xuICBuYW1lOiBzdHJpbmdcbiAgYXJnczogQXJnPGFueT5bXVxuICBuYW1lUG9zOiBudW1iZXJcbiAgY2F0Y2hhbGw6IGJvb2xlYW5cbiAgc3ViRXhwcmVzc2lvbnM6IEV4cHJlc3Npb248YW55PltdXG5cbiAgY29uc3RydWN0b3IoZG9jOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgYXJnczogQXJnPGFueT5bXSwgb3B0czogRXhwcmVzc2lvbk9wdHM9e30pIHtcbiAgICB0aGlzLmRvYyA9IENvbW1hbmQuY2xlYW5Eb2MoZG9jKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5uYW1lUG9zID0gb3B0cy5uYW1lUG9zIHx8IDA7XG4gICAgdGhpcy5jYXRjaGFsbCA9IG9wdHMuY2F0Y2hhbGwgfHwgZmFsc2U7XG4gICAgdGhpcy5zdWJFeHByZXNzaW9ucyA9IG9wdHMuc3ViRXhwcmVzc2lvbnMgfHwgW107XG4gIH1cblxuICBnZXROYW1lQXJncyhldmVudDogRXZlbnQpOiBbc3RyaW5nIHwgbnVsbCwgRXZlbnRdIHtcbiAgICAvLyBVbndyYXAgZG91YmxlLXdyYXBwZWQgZXhwcmVzc2lvbnMgZS5nLiBbW0V4YWN0bHksIFwiMS4wXCJdXSAtPiBbXCJFeGFjdGx5XCIsIFwiMS4wXCJdXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnQpICYmIGV2ZW50Lmxlbmd0aCA9PT0gMSAmJiBBcnJheS5pc0FycmF5KGV2ZW50WzBdKSkge1xuICAgICAgY29uc3QgW2V2ZW50SW5uZXJdID0gZXZlbnQ7XG5cbiAgICAgIHJldHVybiB0aGlzLmdldE5hbWVBcmdzKGV2ZW50SW5uZXIpO1xuICAgIH1cblxuICAgIC8vIExldCdzIGFsbG93IHNpbmdsZS1sZW5ndGggY29tcGxleCBleHByZXNzaW9ucyB0byBiZSBwYXNzZWQgd2l0aG91dCBwYXJlbnMgZS5nLiBcIlRydWVcIiAtPiBbXCJUcnVlXCJdXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGV2ZW50KSkge1xuICAgICAgZXZlbnQgPSBbZXZlbnRdO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNhdGNoYWxsKSB7XG4gICAgICByZXR1cm4gW3RoaXMubmFtZSwgZXZlbnRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgYXJncyA9IGV2ZW50LnNsaWNlKCk7XG4gICAgICBsZXQgW25hbWVdID0gYXJncy5zcGxpY2UodGhpcy5uYW1lUG9zLCAxKTtcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsLCBldmVudF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbbmFtZSwgYXJnc107XG4gICAgfVxuICB9XG5cbiAgbWF0Y2hlcyhldmVudDogRXZlbnQpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5jYXRjaGFsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgW25hbWUsIF9hcmdzXSA9IHRoaXMuZ2V0TmFtZUFyZ3MoZXZlbnQpO1xuXG4gICAgcmV0dXJuICEhbmFtZSAmJiBuYW1lLnRvTG93ZXJDYXNlKCkudHJpbSgpID09PSB0aGlzLm5hbWUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gIH1cblxuICBhc3luYyBnZXRBcmdzKHdvcmxkOiBXb3JsZCwgZXZlbnQ6IEV2ZW50KTogUHJvbWlzZTxBcmdzPiB7XG4gICAgY29uc3QgW19uYW1lLCBldmVudEFyZ3NdID0gdGhpcy5nZXROYW1lQXJncyhldmVudCk7XG5cbiAgICBsZXQgaW5pdGlhbEFjYyA9IDx7Y3VyckFyZ3M6IEFyZ3MsIGN1cnJFdmVudHM6IEV2ZW50fT57Y3VyckFyZ3M6IDxBcmdzPnt9LCBjdXJyRXZlbnRzOiBldmVudEFyZ3N9O1xuXG4gICAgY29uc3Qge2N1cnJBcmdzOiBhcmdzLCBjdXJyRXZlbnRzOiByZXN0RXZlbnR9ID0gYXdhaXQgdGhpcy5hcmdzLnJlZHVjZShhc3luYyAoYWNjLCBhcmcpID0+IHtcbiAgICAgIGxldCB7Y3VyckFyZ3MsIGN1cnJFdmVudHN9ID0gYXdhaXQgYWNjO1xuICAgICAgbGV0IHZhbDogYW55O1xuICAgICAgbGV0IHJlc3RFdmVudEFyZ3M6IEV2ZW50O1xuXG4gICAgICBpZiAoYXJnLm51bGxhYmxlICYmIGN1cnJFdmVudHMubGVuZ3RoID09PSAwKSB7IC8vIE5vdGUgdGhpcyBpcyB6ZXJvLWxlbmd0aCBzdHJpbmcgb3IgemVyby1sZW5ndGggYXJyYXlcbiAgICAgICAgdmFsID0gbmV3IE5vdGhpbmdWKCk7XG4gICAgICAgIHJlc3RFdmVudEFyZ3MgPSBjdXJyRXZlbnRzO1xuICAgICAgfSBlbHNlIGlmIChhcmcudmFyaWFkaWMpIHtcbiAgICAgICAgaWYgKGFyZy5tYXBwZWQpIHtcbiAgICAgICAgICAvLyBJZiBtYXBwZWQsIG1hcHBlZCB0aGUgZnVuY3Rpb24gb3ZlciBlYWNoIGV2ZW50IGFyZ1xuICAgICAgICAgIHZhbCA9IGF3YWl0IFByb21pc2UuYWxsKGN1cnJFdmVudHMubWFwKChldmVudCkgPT4gYXJnLmdldHRlcih3b3JsZCwgZXZlbnQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsID0gYXdhaXQgYXJnLmdldHRlcih3b3JsZCwgY3VyckV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdEV2ZW50QXJncyA9IFtdO1xuICAgICAgfSBlbHNlIGlmIChhcmcuaW1wbGljaXQpIHtcbiAgICAgICAgdmFsID0gYXdhaXQgYXJnLmdldHRlcih3b3JsZCk7XG4gICAgICAgIHJlc3RFdmVudEFyZ3MgPSBjdXJyRXZlbnRzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGV2ZW50QXJnO1xuXG4gICAgICAgIFtldmVudEFyZywgLi4ucmVzdEV2ZW50QXJnc10gPSBjdXJyRXZlbnRzO1xuXG4gICAgICAgIGlmIChldmVudEFyZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKGFyZy5kZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsID0gYXJnLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIGFyZ3VtZW50ICR7YXJnLm5hbWV9IHdoZW4gcHJvY2Vzc2luZyAke3RoaXMubmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChhcmcubWFwcGVkKSB7XG4gICAgICAgICAgICAgIHZhbCA9IGF3YWl0IGF3YWl0IFByb21pc2UuYWxsKG11c3RBcnJheTxFdmVudD4oZXZlbnRBcmcpLm1hcCgoZWwpID0+IGFyZy5nZXR0ZXIod29ybGQsIGVsKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFsID0gYXdhaXQgYXJnLmdldHRlcih3b3JsZCwgZXZlbnRBcmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGFyZy5yZXNjdWUpIHtcbiAgICAgICAgICAgICAgLy8gUmVzY3VlIGlzIG1lYW50IHRvIGFsbG93IEdhdGUgdG8gd29yayBmb3IgY2hlY2tzIHRoYXRcbiAgICAgICAgICAgICAgLy8gZmFpbCBkdWUgdG8gdGhlIG1pc3NpbmcgY29tcG9uZW50cywgZS5nLjpcbiAgICAgICAgICAgICAgLy8gYEdhdGUgKENUb2tlbiBFdGggQWRkcmVzcykgKC4uLiBkZXBsb3kgY1Rva2VuKWBcbiAgICAgICAgICAgICAgLy8gY291bGQgYmUgdXNlZCB0byBkZXBsb3kgYSBjVG9rZW4gaWYgaXQgZG9lc24ndCBleGlzdCwgYnV0XG4gICAgICAgICAgICAgIC8vIHNpbmNlIHRoZXJlIGlzIG5vIENUb2tlbiwgdGhhdCBjaGVjayB3b3VsZCByYWlzZSAod2hlbiB3ZSdkXG4gICAgICAgICAgICAgIC8vIGhvcGUgaXQganVzdCByZXR1cm5zIG51bGwpLiBTbyBoZXJlLCB3ZSBhbGxvdyBvdXIgY29kZSB0byByZXNjdWVcbiAgICAgICAgICAgICAgLy8gZXJyb3JzIGFuZCByZWNvdmVyLCBidXQgd2UgbmVlZCB0byBiZSBzbWFydGVyIGFib3V0IGNhdGNoaW5nIHNwZWNpZmljXG4gICAgICAgICAgICAgIC8vIGVycm9ycyBpbnN0ZWFkIG9mIGFsbCBlcnJvcnMuIEZvciBub3csIHRvIGFzc2lzdCBkZWJ1Z2dpbmcsIHdlIG1heSBwcmludFxuICAgICAgICAgICAgICAvLyBhbnkgZXJyb3IgdGhhdCBjb21lcyB1cCwgZXZlbiBpZiBpdCB3YXMgaW50ZW5kZWQuXG4gICAgICAgICAgICAgIC8vIHdvcmxkLnByaW50ZXIucHJpbnRFcnJvcihlcnIpO1xuXG4gICAgICAgICAgICAgIHZhbCA9IGFyZy5yZXNjdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBuZXdBcmdzID0ge1xuICAgICAgICAuLi5jdXJyQXJncyxcbiAgICAgICAgW2FyZy5uYW1lXTogdmFsXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjdXJyQXJnczogbmV3QXJncyxcbiAgICAgICAgY3VyckV2ZW50czogcmVzdEV2ZW50QXJnc1xuICAgICAgfTtcbiAgICB9LCBQcm9taXNlLnJlc29sdmUoaW5pdGlhbEFjYykpO1xuXG4gICAgaWYgKHJlc3RFdmVudC5sZW5ndGggIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRm91bmQgZXh0cmEgYXJnczogJHtyZXN0RXZlbnQudG9TdHJpbmcoKX0gd2hlbiBwcm9jZXNzaW5nICR7dGhpcy5uYW1lfWApO1xuICAgIH1cblxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgc3RhdGljIGNsZWFuRG9jKGRvYzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZG9jLnJlcGxhY2UoL15cXHMrL21nLCAnJykucmVwbGFjZSgvXCIvZywgJ2AnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tbWFuZDxBcmdzPiBleHRlbmRzIEV4cHJlc3Npb248QXJncz4ge1xuICBwcm9jZXNzb3I6ICh3b3JsZDogV29ybGQsIGZyb206IHN0cmluZywgYXJnczogQXJncykgPT4gUHJvbWlzZTxXb3JsZD5cbiAgcmVxdWlyZUZyb206IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKGRvYzogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGFyZ3M6IEFyZzxhbnk+W10sIHByb2Nlc3NvcjogKHdvcmxkOiBXb3JsZCwgZnJvbTogc3RyaW5nLCBhcmdzOiBBcmdzKSA9PiBQcm9taXNlPFdvcmxkPiwgb3B0czogRXhwcmVzc2lvbk9wdHM9e30pIHtcbiAgICBzdXBlcihkb2MsIG5hbWUsIGFyZ3MsIG9wdHMpO1xuXG4gICAgdGhpcy5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzKHdvcmxkOiBXb3JsZCwgZnJvbTogc3RyaW5nIHwgbnVsbCwgZXZlbnQ6IEV2ZW50KTogUHJvbWlzZTxXb3JsZD4ge1xuICAgIGxldCBhcmdzID0gYXdhaXQgdGhpcy5nZXRBcmdzKHdvcmxkLCBldmVudCk7XG4gICAgaWYgKHRoaXMucmVxdWlyZUZyb20pIHtcbiAgICAgIGlmICghZnJvbSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZyb20gcmVxdWlyZWQgYnV0IG5vdCBnaXZlbiBmb3IgJHt0aGlzLm5hbWV9LiBQbGVhc2Ugc2V0IGEgZGVmYXVsdCBhbGlhcyBvciBvcGVuIHVubG9ja2VkIGFjY291bnRgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucHJvY2Vzc29yKHdvcmxkLCBmcm9tLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucHJvY2Vzc29yKHdvcmxkLCA8c3RyaW5nPjxhbnk+bnVsbCwgYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWaWV3PEFyZ3M+IGV4dGVuZHMgQ29tbWFuZDxBcmdzPiB7XG4gIGNvbnN0cnVjdG9yKGRvYzogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGFyZ3M6IEFyZzxhbnk+W10sIHByb2Nlc3NvcjogKHdvcmxkOiBXb3JsZCwgYXJnczogQXJncykgPT4gUHJvbWlzZTxXb3JsZD4sIG9wdHM6IEV4cHJlc3Npb25PcHRzPXt9KSB7XG4gICAgc3VwZXIoZG9jLCBuYW1lLCBhcmdzLCAod29ybGQsIGZyb20sIGFyZ3MpID0+IHByb2Nlc3Nvcih3b3JsZCwgYXJncyksIG9wdHMpO1xuICAgIHRoaXMucmVxdWlyZUZyb20gPSBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmV0Y2hlcjxBcmdzLCBSZXQ+IGV4dGVuZHMgRXhwcmVzc2lvbjxBcmdzPiB7XG4gIGZldGNoZXI6ICh3b3JsZDogV29ybGQsIGFyZ3M6IEFyZ3MpID0+IFByb21pc2U8UmV0PlxuXG4gIGNvbnN0cnVjdG9yKGRvYzogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGFyZ3M6IEFyZzxhbnk+W10sIGZldGNoZXI6ICh3b3JsZDogV29ybGQsIGFyZ3M6IEFyZ3MpID0+IFByb21pc2U8UmV0Piwgb3B0czogRXhwcmVzc2lvbk9wdHM9e30pIHtcbiAgICBzdXBlcihkb2MsIG5hbWUsIGFyZ3MsIG9wdHMpO1xuXG4gICAgdGhpcy5mZXRjaGVyID0gZmV0Y2hlcjtcbiAgfVxuXG4gIGFzeW5jIGZldGNoKHdvcmxkOiBXb3JsZCwgZXZlbnQ6IEV2ZW50KTogUHJvbWlzZTxSZXQ+IHtcbiAgICBsZXQgYXJncyA9IGF3YWl0IHRoaXMuZ2V0QXJncyh3b3JsZCwgZXZlbnQpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmZldGNoZXIod29ybGQsIGFyZ3MpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzQ29tbWFuZEV2ZW50PEFyZ3M+KHR5cGU6IHN0cmluZywgY29tbWFuZHM6IENvbW1hbmQ8QXJncz5bXSwgd29ybGQ6IFdvcmxkLCBldmVudDogRXZlbnQsIGZyb206IHN0cmluZyB8IG51bGwpOiBQcm9taXNlPFdvcmxkPiB7XG4gIGxldCBtYXRjaGluZ0NvbW1hbmQgPSBjb21tYW5kcy5maW5kKChjb21tYW5kKSA9PiBjb21tYW5kLm1hdGNoZXMoZXZlbnQpKTtcblxuICBpZiAoIW1hdGNoaW5nQ29tbWFuZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRm91bmQgdW5rbm93biAke3R5cGV9IGV2ZW50IHR5cGUgJHtldmVudC50b1N0cmluZygpfWApO1xuICB9XG5cbiAgcmV0dXJuIG1hdGNoaW5nQ29tbWFuZC5wcm9jZXNzKHdvcmxkLCBmcm9tLCBldmVudCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRGZXRjaGVyVmFsdWU8QXJncywgUmV0Pih0eXBlOiBzdHJpbmcsIGZldGNoZXJzOiBGZXRjaGVyPEFyZ3MsIFJldD5bXSwgd29ybGQ6IFdvcmxkLCBldmVudDogRXZlbnQpOiBQcm9taXNlPFJldD4ge1xuICBsZXQgbWF0Y2hpbmdGZXRjaGVyID0gZmV0Y2hlcnMuZmluZCgoZmV0Y2hlcikgPT4gZmV0Y2hlci5tYXRjaGVzKGV2ZW50KSk7XG5cbiAgaWYgKCFtYXRjaGluZ0ZldGNoZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHVua25vd24gJHt0eXBlfSB2YWx1ZSB0eXBlICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQpfWApO1xuICB9XG5cbiAgcmV0dXJuIG1hdGNoaW5nRmV0Y2hlci5mZXRjaCh3b3JsZCwgZXZlbnQpO1xufVxuIl19
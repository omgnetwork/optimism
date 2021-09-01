"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCoreEvent = exports.commands = exports.processEvents = exports.EventProcessingError = void 0;
const World_1 = require("./World");
const CoreValue_1 = require("./CoreValue");
const Value_1 = require("./Value");
const Command_1 = require("./Command");
const AssertionEvent_1 = require("./Event/AssertionEvent");
const ComptrollerEvent_1 = require("./Event/ComptrollerEvent");
const UnitrollerEvent_1 = require("./Event/UnitrollerEvent");
const ComptrollerImplEvent_1 = require("./Event/ComptrollerImplEvent");
const CTokenEvent_1 = require("./Event/CTokenEvent");
const CTokenDelegateEvent_1 = require("./Event/CTokenDelegateEvent");
const Erc20Event_1 = require("./Event/Erc20Event");
const InterestRateModelEvent_1 = require("./Event/InterestRateModelEvent");
const PriceOracleEvent_1 = require("./Event/PriceOracleEvent");
const PriceOracleProxyEvent_1 = require("./Event/PriceOracleProxyEvent");
const MaximillionEvent_1 = require("./Event/MaximillionEvent");
const InvariantEvent_1 = require("./Event/InvariantEvent");
const ExpectationEvent_1 = require("./Event/ExpectationEvent");
const TimelockEvent_1 = require("./Event/TimelockEvent");
const CompEvent_1 = require("./Event/CompEvent");
const GovernorEvent_1 = require("./Event/GovernorEvent");
const GovernorBravoEvent_1 = require("./Event/GovernorBravoEvent");
const TrxEvent_1 = require("./Event/TrxEvent");
const CoreValue_2 = require("./CoreValue");
const Formatter_1 = require("./Formatter");
const Invokation_1 = require("./Invokation");
const Utils_1 = require("./Utils");
const immutable_1 = require("immutable");
const Help_1 = require("./Help");
const Networks_1 = require("./Networks");
const Hypothetical_1 = require("./Hypothetical");
const EventBuilder_1 = require("./EventBuilder");
class EventProcessingError extends Error {
    constructor(error, event) {
        super(error.message);
        this.error = error;
        this.event = event;
        this.message = `Error: \`${this.error.toString()}\` when processing \`${Formatter_1.formatEvent(this.event)}\``;
        this.stack = error.stack;
    }
}
exports.EventProcessingError = EventProcessingError;
async function processEvents(originalWorld, events) {
    return events.reduce(async (pWorld, event) => {
        let world = await pWorld;
        try {
            world = await processCoreEvent(World_1.setEvent(world, event), event, world.defaultFrom());
        }
        catch (err) {
            if (world.verbose) {
                console.error(err);
            }
            throw new EventProcessingError(err, event);
        }
        // Next, check any unchecked invariants
        world = await World_1.checkInvariants(world);
        // Check any expectations
        world = await World_1.checkExpectations(world);
        // Also clear trx related fields
        world = world.set('trxInvokationOpts', immutable_1.Map({}));
        world = world.set('newInvokation', false);
        if (!world) {
            throw new Error(`Encountered null world result when processing event ${event[0]}: ${world}`);
        }
        else if (!(world instanceof World_1.World)) {
            throw new Error(`Encountered world result which was not isWorld when processing event ${event[0]}: ${world}`);
        }
        return world;
    }, Promise.resolve(originalWorld));
}
exports.processEvents = processEvents;
async function print(world, message) {
    world.printer.printLine(message);
    return world;
}
async function inspect(world, string) {
    if (string !== null) {
        console.log(['Inspect', string, world.toJS()]);
    }
    else {
        console.log(['Inspect', world.toJS()]);
    }
    return world;
}
async function sendEther(world, from, to, amount) {
    let invokation = await Invokation_1.fallback(world, from, to, amount);
    world = World_1.addAction(world, `Send ${amount} from ${from} to ${to}`, invokation);
    return world;
}
exports.commands = [
    new Command_1.View(`
      #### History

      * "History n:<Number>=5" - Prints history of actions
        * E.g. "History"
        * E.g. "History 10"
    `, 'History', [new Command_1.Arg('n', CoreValue_1.getNumberV, { default: new Value_1.NumberV(5) })], async (world, { n }) => {
        world.actions.slice(0, Number(n.val)).forEach(action => {
            world.printer.printLine(action.toString());
        });
        return world;
    }),
    new Command_1.View(`
      #### SleepSeconds

      * "SleepSeconds s:<Number>" - Sleeps for given amount of time.
        * E.g. "SleepSeconds 1" - Sleeps for one second
    `, 'SleepSeconds', [new Command_1.Arg('seconds', CoreValue_1.getNumberV)], async (world, { seconds }) => {
        await Utils_1.sleep(seconds.toNumber() * 1000);
        return world;
    }),
    new Command_1.View(`
      #### SleepUntilTimestamp

      * "SleepUntil timestamp:<Number>" - Sleeps until the given timestamp
        * E.g. "SleepUntil 1579123423" - Sleeps from now until 1579123423
    `, 'SleepUntilTimestamp', [new Command_1.Arg('timestamp', CoreValue_1.getNumberV)], async (world, { timestamp }) => {
        const delay = timestamp.toNumber() - Utils_1.getCurrentTimestamp();
        if (delay > 0) {
            await Utils_1.sleep(delay * 1000);
        }
        return world;
    }),
    new Command_1.View(`
      #### SleepBlocks

      * "SleepForBlocks blocks:<Number>" - Sleeps for a given number of blocks
        * E.g. "SleepBlocks 20" - Sleeps for 20 blocks
    `, 'SleepBlocks', [new Command_1.Arg('blocks', CoreValue_1.getNumberV)], async (world, { blocks }) => {
        const targetBlockNumber = blocks.toNumber() + await Utils_1.getCurrentBlockNumber(world);
        while (await Utils_1.getCurrentBlockNumber(world) < targetBlockNumber) {
            await Utils_1.sleep(1000);
        }
        return world;
    }),
    new Command_1.View(`
      #### SleepUntilBlock

      * "SleepUntilBlock blockNumber:<Number>" - Sleeps until the given blockNumber
        * E.g. "SleepUntilBlock 2006868" - Sleeps from now until block 2006868.
    `, 'SleepUntilBlock', [new Command_1.Arg('blockNumber', CoreValue_1.getNumberV)], async (world, { blockNumber }) => {
        const delay = blockNumber.toNumber() - await Utils_1.getCurrentBlockNumber(world);
        while (blockNumber.toNumber() > await Utils_1.getCurrentBlockNumber(world)) {
            await Utils_1.sleep(1000);
        }
        return world;
    }),
    new Command_1.View(`
      #### Throw

      * "Throw errMsg:<String>" - Throws given error
        * E.g. "Throw \"my error message\""
    `, 'Throw', [new Command_1.Arg('errMsg', CoreValue_1.getStringV)], async (world, { errMsg }) => {
        throw new Error(errMsg.val);
        return world;
    }),
    async (world) => new Command_1.View(`
        #### Read

        * "Read ..." - Reads given value and prints result
          * E.g. "Read CToken cBAT ExchangeRateStored" - Returns exchange rate of cBAT
      `, 'Read', [new Command_1.Arg('res', CoreValue_2.getCoreValue, { variadic: true })], async (world, { res }) => {
        world.printer.printValue(res);
        return world;
    }, { subExpressions: (await CoreValue_2.getFetchers(world)).fetchers }),
    new Command_1.View(`
      #### Print

      * "Print ..." - Prints given string
        * E.g. "Print \"Hello there\""
    `, 'Print', [new Command_1.Arg('message', CoreValue_1.getStringV)], async (world, { message }) => print(world, message.val)),
    new Command_1.View(`
      #### PrintTransactionLogs

      * "PrintTransactionLogs" - Prints logs from all transacions
    `, 'PrintTransactionLogs', [], async (world, {}) => {
        return await world.updateSettings(async (settings) => {
            settings.printTxLogs = true;
            return settings;
        });
    }),
    new Command_1.View(`
      #### Web3Fork

      * "Web3Fork url:<String> unlockedAccounts:<String>[]" - Creates an in-memory ganache
        * E.g. "Web3Fork \"https://mainnet.infura.io/v3/e1a5d4d2c06a4e81945fca56d0d5d8ea\" (\"0x8b8592e9570e96166336603a1b4bd1e8db20fa20\")"
    `, 'Web3Fork', [
        new Command_1.Arg('url', CoreValue_1.getStringV),
        new Command_1.Arg('unlockedAccounts', CoreValue_1.getAddressV, { default: [], mapped: true })
    ], async (world, { url, unlockedAccounts }) => Hypothetical_1.fork(world, url.val, unlockedAccounts.map(v => v.val))),
    new Command_1.View(`
      #### UseConfigs

      * "UseConfigs networkVal:<String>" - Updates world to use the configs for specified network
        * E.g. "UseConfigs mainnet"
    `, 'UseConfigs', [new Command_1.Arg('networkVal', CoreValue_1.getStringV)], async (world, { networkVal }) => {
        const network = networkVal.val;
        if (world.basePath && (network === 'mainnet' || network === 'kovan' || network === 'goerli' || network === 'rinkeby' || network == 'ropsten')) {
            let newWorld = world.set('network', network);
            let contractInfo;
            [newWorld, contractInfo] = await Networks_1.loadContracts(newWorld);
            if (contractInfo.length > 0) {
                world.printer.printLine(`Contracts:`);
                contractInfo.forEach((info) => world.printer.printLine(`\t${info}`));
            }
            return newWorld;
        }
        return world;
    }),
    new Command_1.View(`
      #### MyAddress

      * "MyAddress address:<String>" - Sets default from address (same as "Alias Me <addr>")
        * E.g. "MyAddress \"0x9C1856636d78C051deAd6CAB9c5699e4E25549e9\""
    `, 'MyAddress', [new Command_1.Arg('address', CoreValue_1.getAddressV)], async (world, { address }) => {
        return await world.updateSettings(async (settings) => {
            settings.aliases['Me'] = address.val;
            return settings;
        });
    }),
    new Command_1.View(`
      #### Alias

      * "Alias name:<String> address:<String>" - Stores an alias between name and address
        * E.g. "Alias Me \"0x9C1856636d78C051deAd6CAB9c5699e4E25549e9\""
    `, 'Alias', [new Command_1.Arg('name', CoreValue_1.getStringV), new Command_1.Arg('address', CoreValue_1.getAddressV)], async (world, { name, address }) => {
        return await world.updateSettings(async (settings) => {
            settings.aliases[name.val] = address.val;
            return settings;
        });
    }),
    new Command_1.View(`
      #### Aliases

      * "Aliases - Prints all aliases
    `, 'Aliases', [], async (world, { name, address }) => {
        world.printer.printLine('Aliases:');
        Object.entries(world.settings.aliases).forEach(([name, address]) => {
            world.printer.printLine(`\t${name}: ${address}`);
        });
        return world;
    }),
    new Command_1.View(`
      #### IncreaseTime

      * "IncreaseTime seconds:<Number>" - Increase Ganache evm time by a number of seconds
        * E.g. "IncreaseTime 60"
    `, 'IncreaseTime', [new Command_1.Arg('seconds', CoreValue_1.getNumberV)], async (world, { seconds }) => {
        await Utils_1.sendRPC(world, 'evm_increaseTime', [Number(seconds.val)]);
        await Utils_1.sendRPC(world, 'evm_mine', []);
        return world;
    }),
    new Command_1.View(`
      #### SetTime

      * "SetTime timestamp:<Number>" - Increase Ganache evm time to specific timestamp
        * E.g. "SetTime 1573597400"
    `, 'SetTime', [new Command_1.Arg('timestamp', CoreValue_1.getNumberV)], async (world, { timestamp }) => {
        await Utils_1.sendRPC(world, 'evm_mine', [timestamp.val]);
        return world;
    }),
    new Command_1.View(`
      #### FreezeTime

      * "FreezeTime timestamp:<Number>" - Freeze Ganache evm time to specific timestamp
        * E.g. "FreezeTime 1573597400"
    `, 'FreezeTime', [new Command_1.Arg('timestamp', CoreValue_1.getNumberV)], async (world, { timestamp }) => {
        await Utils_1.sendRPC(world, 'evm_freezeTime', [timestamp.val]);
        return world;
    }),
    new Command_1.View(`
      #### MineBlock

      * "MineBlock" - Increase Ganache evm block number
        * E.g. "MineBlock"
    `, 'MineBlock', [], async (world, {}) => {
        await Utils_1.sendRPC(world, 'evm_mine', []);
        return world;
    }),
    new Command_1.Command(`
      #### SetBlockNumber

      * "SetBlockNumber 10" - Increase Ganache evm block number
        * E.g. "SetBlockNumber 10"
    `, 'SetBlockNumber', [new Command_1.Arg('blockNumber', CoreValue_1.getNumberV)], async (world, from, { blockNumber }) => {
        await Utils_1.sendRPC(world, 'evm_mineBlockNumber', [blockNumber.toNumber() - 1]);
        return world;
    }),
    new Command_1.Command(`
      #### Block

      * "Block 10 (...event)" - Set block to block N and run event
        * E.g. "Block 10 (Comp Deploy Admin)"
    `, 'Block', [
        new Command_1.Arg('blockNumber', CoreValue_1.getNumberV),
        new Command_1.Arg('event', CoreValue_1.getEventV)
    ], async (world, from, { blockNumber, event }) => {
        await Utils_1.sendRPC(world, 'evm_mineBlockNumber', [blockNumber.toNumber() - 2]);
        return await processCoreEvent(world, event.val, from);
    }),
    new Command_1.Command(`
      #### AdvanceBlocks

      * "AdvanceBlocks 10" - Increase Ganache latest + block number
        * E.g. "AdvanceBlocks 10"
    `, 'AdvanceBlocks', [new Command_1.Arg('blockNumber', CoreValue_1.getNumberV)], async (world, from, { blockNumber }) => {
        const currentBlockNumber = await Utils_1.getCurrentBlockNumber(world);
        await Utils_1.sendRPC(world, 'evm_mineBlockNumber', [Number(blockNumber.val) + currentBlockNumber]);
        return world;
    }),
    new Command_1.View(`
      #### Inspect

      * "Inspect" - Prints debugging information about the world
    `, 'Inspect', [], async (world, {}) => inspect(world, null)),
    new Command_1.View(`
      #### Debug

      * "Debug message:<String>" - Same as inspect but prepends with a string
    `, 'Debug', [new Command_1.Arg('message', CoreValue_1.getStringV)], async (world, { message }) => inspect(world, message.val)),
    new Command_1.View(`
      #### From

      * "From <User> <Event>" - Runs event as the given user
        * E.g. "From Geoff (CToken cZRX Mint 5e18)"
    `, 'From', [new Command_1.Arg('account', CoreValue_1.getAddressV), new Command_1.Arg('event', CoreValue_1.getEventV)], async (world, { account, event }) => processCoreEvent(world, event.val, account.val)),
    new Command_1.Command(`
      #### Trx

      * "Trx ...trxEvent" - Handles event to set details of next transaction
        * E.g. "Trx Value 1.0e18 (CToken cEth Mint 1.0e18)"
    `, 'Trx', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], async (world, from, { event }) => TrxEvent_1.processTrxEvent(world, event.val, from), { subExpressions: TrxEvent_1.trxCommands() }),
    new Command_1.Command(`
      #### Invariant

      * "Invariant ...invariant" - Adds a new invariant to the world which is checked after each transaction
        * E.g. "Invariant Static (CToken cZRX TotalSupply)"
    `, 'Invariant', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], async (world, from, { event }) => InvariantEvent_1.processInvariantEvent(world, event.val, from), { subExpressions: InvariantEvent_1.invariantCommands() }),
    new Command_1.Command(`
      #### Expect

      * "Expect ...expectation" - Adds an expectation to hold after the next transaction
        * E.g. "Expect Changes (CToken cZRX TotalSupply) +10.0e18"
    `, 'Expect', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], async (world, from, { event }) => ExpectationEvent_1.processExpectationEvent(world, event.val, from), { subExpressions: ExpectationEvent_1.expectationCommands() }),
    new Command_1.View(`
      #### HoldInvariants

      * "HoldInvariants type:<String>" - Skips checking invariants on next command.
        * E.g. "HoldInvariants" - Skips all invariants
        * E.g. "HoldInvariants All" - Skips all invariants
        * E.g. "HoldInvariants Success" - Skips "success" invariants
        * E.g. "HoldInvariants Remains" - Skips "remains" invariants
        * E.g. "HoldInvariants Static" - Skips "static" invariants
    `, 'HoldInvariants', [new Command_1.Arg('type', CoreValue_1.getStringV, { default: new Value_1.StringV('All') })], async (world, { type }) => World_1.holdInvariants(world, type.val)),
    new Command_1.View(`
      #### ClearInvariants

      * "ClearInvariants type:<String>" - Removes all invariants.
        * E.g. "ClearInvariants" - Removes all invariants
        * E.g. "ClearInvariants All" - Removes all invariants
        * E.g. "ClearInvariants Success" - Removes "success" invariants
        * E.g. "ClearInvariants Remains" - Removes "remains" invariants
        * E.g. "ClearInvariants Static" - Removes "static" invariants
    `, 'ClearInvariants', [new Command_1.Arg('type', CoreValue_1.getStringV, { default: new Value_1.StringV('All') })], async (world, { type }) => World_1.clearInvariants(world, type.val)),
    new Command_1.Command(`
      #### Assert

      * "Assert ...event" - Validates given assertion, raising an exception if assertion fails
        * E.g. "Assert Equal (Erc20 BAT TokenBalance Geoff) (Exactly 5.0)"
    `, 'Assert', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], async (world, from, { event }) => AssertionEvent_1.processAssertionEvent(world, event.val, from), { subExpressions: AssertionEvent_1.assertionCommands() }),
    new Command_1.Command(`
      #### Gate

      * "Gate value event" - Runs event only if value is falsey. Thus, gate can be used to build idempotency.
        * E.g. "Gate (Erc20 ZRX Address) (Erc20 Deploy BAT)"
    `, 'Gate', [new Command_1.Arg('gate', CoreValue_2.getCoreValue, { rescue: new Value_1.NothingV() }), new Command_1.Arg('event', CoreValue_1.getEventV)], async (world, from, { gate, event }) => {
        if (gate.truthy()) {
            return world;
        }
        else {
            return processCoreEvent(world, event.val, from);
        }
    }),
    new Command_1.Command(`
      #### Given

      * "Given value event" - Runs event only if value is truthy. Thus, given can be used to build existence checks.
        * E.g. "Given ($var) (PriceOracle SetPrice cBAT $var)"
    `, 'Given', [new Command_1.Arg('given', CoreValue_2.getCoreValue, { rescue: new Value_1.NothingV() }), new Command_1.Arg('event', CoreValue_1.getEventV)], async (world, from, { given, event }) => {
        if (given.truthy()) {
            return processCoreEvent(world, event.val, from);
        }
        else {
            return world;
        }
    }),
    new Command_1.Command(`
      #### Send

      * "Send <Address> <Amount>" - Sends a given amount of eth to given address
        * E.g. "Send cETH 0.5e18"
    `, 'Send', [new Command_1.Arg('address', CoreValue_1.getAddressV), new Command_1.Arg('amount', CoreValue_1.getNumberV)], (world, from, { address, amount }) => sendEther(world, from, address.val, amount.encode())),
    new Command_1.Command(`
      #### Unitroller

      * "Unitroller ...event" - Runs given Unitroller event
        * E.g. "Unitroller SetPendingImpl MyComptrollerImpl"
    `, 'Unitroller', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => UnitrollerEvent_1.processUnitrollerEvent(world, event.val, from), { subExpressions: UnitrollerEvent_1.unitrollerCommands() }),
    new Command_1.Command(`
      #### Comptroller

      * "Comptroller ...event" - Runs given Comptroller event
        * E.g. "Comptroller _setReserveFactor 0.5"
    `, 'Comptroller', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => ComptrollerEvent_1.processComptrollerEvent(world, event.val, from), { subExpressions: ComptrollerEvent_1.comptrollerCommands() }),
    new Command_1.Command(`
      #### ComptrollerImpl

      * "ComptrollerImpl ...event" - Runs given ComptrollerImpl event
        * E.g. "ComptrollerImpl MyImpl Become"
    `, 'ComptrollerImpl', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => ComptrollerImplEvent_1.processComptrollerImplEvent(world, event.val, from), { subExpressions: ComptrollerImplEvent_1.comptrollerImplCommands() }),
    new Command_1.Command(`
      #### CToken

      * "CToken ...event" - Runs given CToken event
        * E.g. "CToken cZRX Mint 5e18"
    `, 'CToken', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => CTokenEvent_1.processCTokenEvent(world, event.val, from), { subExpressions: CTokenEvent_1.cTokenCommands() }),
    new Command_1.Command(`
      #### CTokenDelegate

      * "CTokenDelegate ...event" - Runs given CTokenDelegate event
        * E.g. "CTokenDelegate Deploy CDaiDelegate cDaiDelegate"
    `, 'CTokenDelegate', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => CTokenDelegateEvent_1.processCTokenDelegateEvent(world, event.val, from), { subExpressions: CTokenDelegateEvent_1.cTokenDelegateCommands() }),
    new Command_1.Command(`
      #### Erc20

      * "Erc20 ...event" - Runs given Erc20 event
        * E.g. "Erc20 ZRX Facuet Geoff 5e18"
    `, 'Erc20', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => Erc20Event_1.processErc20Event(world, event.val, from), { subExpressions: Erc20Event_1.erc20Commands() }),
    new Command_1.Command(`
      #### InterestRateModel

      * "InterestRateModel ...event" - Runs given interest rate model event
        * E.g. "InterestRateModel Deploy Fixed StdRate 0.5"
    `, 'InterestRateModel', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => InterestRateModelEvent_1.processInterestRateModelEvent(world, event.val, from), { subExpressions: InterestRateModelEvent_1.interestRateModelCommands() }),
    new Command_1.Command(`
      #### PriceOracle

      * "PriceOracle ...event" - Runs given Price Oracle event
        * E.g. "PriceOracle SetPrice cZRX 1.5"
    `, 'PriceOracle', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => PriceOracleEvent_1.processPriceOracleEvent(world, event.val, from), { subExpressions: PriceOracleEvent_1.priceOracleCommands() }),
    new Command_1.Command(`
      #### PriceOracleProxy

      * "PriceOracleProxy ...event" - Runs given Price Oracle event
      * E.g. "PriceOracleProxy Deploy (Unitroller Address) (PriceOracle Address) (CToken cETH Address)"
    `, 'PriceOracleProxy', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => {
        return PriceOracleProxyEvent_1.processPriceOracleProxyEvent(world, event.val, from);
    }, { subExpressions: PriceOracleProxyEvent_1.priceOracleProxyCommands() }),
    new Command_1.Command(`
      #### Maximillion

      * "Maximillion ...event" - Runs given Maximillion event
      * E.g. "Maximillion Deploy (CToken cETH Address)"
    `, 'Maximillion', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => {
        return MaximillionEvent_1.processMaximillionEvent(world, event.val, from);
    }, { subExpressions: MaximillionEvent_1.maximillionCommands() }),
    new Command_1.Command(`
      #### Timelock

      * "Timelock ...event" - Runs given Timelock event
      * E.g. "Timelock Deploy Geoff 604800"
    `, 'Timelock', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => {
        return TimelockEvent_1.processTimelockEvent(world, event.val, from);
    }, { subExpressions: TimelockEvent_1.timelockCommands() }),
    new Command_1.Command(`
      #### Comp

      * "Comp ...event" - Runs given comp event
      * E.g. "Comp Deploy"
    `, 'Comp', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => {
        return CompEvent_1.processCompEvent(world, event.val, from);
    }, { subExpressions: CompEvent_1.compCommands() }),
    new Command_1.Command(`
      #### Governor

      * "Governor ...event" - Runs given governor event
      * E.g. "Governor Deploy Alpha"
    `, 'Governor', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => {
        return GovernorEvent_1.processGovernorEvent(world, event.val, from);
    }, { subExpressions: GovernorEvent_1.governorCommands() }),
    new Command_1.Command(`
      #### GovernorBravo

      * "GovernorBravo ...event" - Runs given governorBravo event
      * E.g. "GovernorBravo Deploy BravoDelegate"
    `, 'GovernorBravo', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], (world, from, { event }) => {
        return GovernorBravoEvent_1.processGovernorBravoEvent(world, event.val, from);
    }, { subExpressions: GovernorBravoEvent_1.governorBravoCommands() }),
    EventBuilder_1.buildContractEvent("Counter", false),
    EventBuilder_1.buildContractEvent("CompoundLens", false),
    EventBuilder_1.buildContractEvent("Reservoir", true),
    new Command_1.View(`
      #### Help

      * "Help ...event" - Prints help for given command
      * E.g. "Help From"
    `, 'Help', [new Command_1.Arg('event', CoreValue_1.getEventV, { variadic: true })], async (world, { event }) => {
        world.printer.printLine('');
        let { commands } = await getCommands(world);
        Help_1.printHelp(world.printer, event.val, commands);
        return world;
    })
];
async function getCommands(world) {
    if (world.commands) {
        return { world, commands: world.commands };
    }
    let allCommands = await Promise.all(exports.commands.map((command) => {
        if (typeof (command) === 'function') {
            return command(world);
        }
        else {
            return Promise.resolve(command);
        }
    }));
    return { world: world.set('commands', allCommands), commands: allCommands };
}
async function processCoreEvent(world, event, from) {
    let { world: nextWorld, commands } = await getCommands(world);
    return await Command_1.processCommandEvent('Core', commands, nextWorld, event, from);
}
exports.processCoreEvent = processCoreEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29yZUV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvcmVFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FRaUI7QUFFakIsMkNBQTZFO0FBQzdFLG1DQUE4RTtBQUM5RSx1Q0FBb0U7QUFDcEUsMkRBQWtGO0FBQ2xGLCtEQUF3RjtBQUN4Riw2REFBcUY7QUFDckYsdUVBQW9HO0FBQ3BHLHFEQUF5RTtBQUN6RSxxRUFBaUc7QUFDakcsbURBQXNFO0FBQ3RFLDJFQUEwRztBQUMxRywrREFBd0Y7QUFDeEYseUVBQXVHO0FBQ3ZHLCtEQUF3RjtBQUN4RiwyREFBa0Y7QUFDbEYsK0RBQXdGO0FBQ3hGLHlEQUErRTtBQUMvRSxpREFBbUU7QUFDbkUseURBQStFO0FBQy9FLG1FQUE4RjtBQUM5RiwrQ0FBZ0U7QUFDaEUsMkNBQXdEO0FBQ3hELDJDQUEwQztBQUMxQyw2Q0FBd0M7QUFDeEMsbUNBQXFGO0FBQ3JGLHlDQUFnQztBQUVoQyxpQ0FBbUM7QUFDbkMseUNBQTJDO0FBQzNDLGlEQUFzQztBQUN0QyxpREFBb0Q7QUFNcEQsTUFBYSxvQkFBcUIsU0FBUSxLQUFLO0lBSTdDLFlBQVksS0FBWSxFQUFFLEtBQVk7UUFDcEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsd0JBQXdCLHVCQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDcEcsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQzNCLENBQUM7Q0FDRjtBQVpELG9EQVlDO0FBRU0sS0FBSyxVQUFVLGFBQWEsQ0FBQyxhQUFvQixFQUFFLE1B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QU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlELE9BQU8sTUFBTSw2QkFBbUIsQ0FBTSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDbEYsQ0FBQztBQUhELDRDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgYWRkQWN0aW9uLFxuICBjaGVja0V4cGVjdGF0aW9ucyxcbiAgY2hlY2tJbnZhcmlhbnRzLFxuICBjbGVhckludmFyaWFudHMsXG4gIGhvbGRJbnZhcmlhbnRzLFxuICBzZXRFdmVudCxcbiAgV29ybGRcbn0gZnJvbSAnLi9Xb3JsZCc7XG5pbXBvcnQgeyBFdmVudCB9IGZyb20gJy4vRXZlbnQnO1xuaW1wb3J0IHsgZ2V0QWRkcmVzc1YsIGdldEV2ZW50ViwgZ2V0TnVtYmVyViwgZ2V0U3RyaW5nViB9IGZyb20gJy4vQ29yZVZhbHVlJztcbmltcG9ydCB7IEFkZHJlc3NWLCBFdmVudFYsIE5vdGhpbmdWLCBOdW1iZXJWLCBTdHJpbmdWLCBWYWx1ZSB9IGZyb20gJy4vVmFsdWUnO1xuaW1wb3J0IHsgQXJnLCBDb21tYW5kLCBwcm9jZXNzQ29tbWFuZEV2ZW50LCBWaWV3IH0gZnJvbSAnLi9Db21tYW5kJztcbmltcG9ydCB7IGFzc2VydGlvbkNvbW1hbmRzLCBwcm9jZXNzQXNzZXJ0aW9uRXZlbnQgfSBmcm9tICcuL0V2ZW50L0Fzc2VydGlvbkV2ZW50JztcbmltcG9ydCB7IGNvbXB0cm9sbGVyQ29tbWFuZHMsIHByb2Nlc3NDb21wdHJvbGxlckV2ZW50IH0gZnJvbSAnLi9FdmVudC9Db21wdHJvbGxlckV2ZW50JztcbmltcG9ydCB7IHByb2Nlc3NVbml0cm9sbGVyRXZlbnQsIHVuaXRyb2xsZXJDb21tYW5kcyB9IGZyb20gJy4vRXZlbnQvVW5pdHJvbGxlckV2ZW50JztcbmltcG9ydCB7IGNvbXB0cm9sbGVySW1wbENvbW1hbmRzLCBwcm9jZXNzQ29tcHRyb2xsZXJJbXBsRXZlbnQgfSBmcm9tICcuL0V2ZW50L0NvbXB0cm9sbGVySW1wbEV2ZW50JztcbmltcG9ydCB7IGNUb2tlbkNvbW1hbmRzLCBwcm9jZXNzQ1Rva2VuRXZlbnQgfSBmcm9tICcuL0V2ZW50L0NUb2tlbkV2ZW50JztcbmltcG9ydCB7IGNUb2tlbkRlbGVnYXRlQ29tbWFuZHMsIHByb2Nlc3NDVG9rZW5EZWxlZ2F0ZUV2ZW50IH0gZnJvbSAnLi9FdmVudC9DVG9rZW5EZWxlZ2F0ZUV2ZW50JztcbmltcG9ydCB7IGVyYzIwQ29tbWFuZHMsIHByb2Nlc3NFcmMyMEV2ZW50IH0gZnJvbSAnLi9FdmVudC9FcmMyMEV2ZW50JztcbmltcG9ydCB7IGludGVyZXN0UmF0ZU1vZGVsQ29tbWFuZHMsIHByb2Nlc3NJbnRlcmVzdFJhdGVNb2RlbEV2ZW50IH0gZnJvbSAnLi9FdmVudC9JbnRlcmVzdFJhdGVNb2RlbEV2ZW50JztcbmltcG9ydCB7IHByaWNlT3JhY2xlQ29tbWFuZHMsIHByb2Nlc3NQcmljZU9yYWNsZUV2ZW50IH0gZnJvbSAnLi9FdmVudC9QcmljZU9yYWNsZUV2ZW50JztcbmltcG9ydCB7IHByaWNlT3JhY2xlUHJveHlDb21tYW5kcywgcHJvY2Vzc1ByaWNlT3JhY2xlUHJveHlFdmVudCB9IGZyb20gJy4vRXZlbnQvUHJpY2VPcmFjbGVQcm94eUV2ZW50JztcbmltcG9ydCB7IG1heGltaWxsaW9uQ29tbWFuZHMsIHByb2Nlc3NNYXhpbWlsbGlvbkV2ZW50IH0gZnJvbSAnLi9FdmVudC9NYXhpbWlsbGlvbkV2ZW50JztcbmltcG9ydCB7IGludmFyaWFudENvbW1hbmRzLCBwcm9jZXNzSW52YXJpYW50RXZlbnQgfSBmcm9tICcuL0V2ZW50L0ludmFyaWFudEV2ZW50JztcbmltcG9ydCB7IGV4cGVjdGF0aW9uQ29tbWFuZHMsIHByb2Nlc3NFeHBlY3RhdGlvbkV2ZW50IH0gZnJvbSAnLi9FdmVudC9FeHBlY3RhdGlvbkV2ZW50JztcbmltcG9ydCB7IHRpbWVsb2NrQ29tbWFuZHMsIHByb2Nlc3NUaW1lbG9ja0V2ZW50IH0gZnJvbSAnLi9FdmVudC9UaW1lbG9ja0V2ZW50JztcbmltcG9ydCB7IGNvbXBDb21tYW5kcywgcHJvY2Vzc0NvbXBFdmVudCB9IGZyb20gJy4vRXZlbnQvQ29tcEV2ZW50JztcbmltcG9ydCB7IGdvdmVybm9yQ29tbWFuZHMsIHByb2Nlc3NHb3Zlcm5vckV2ZW50IH0gZnJvbSAnLi9FdmVudC9Hb3Zlcm5vckV2ZW50JztcbmltcG9ydCB7IGdvdmVybm9yQnJhdm9Db21tYW5kcywgcHJvY2Vzc0dvdmVybm9yQnJhdm9FdmVudCB9IGZyb20gJy4vRXZlbnQvR292ZXJub3JCcmF2b0V2ZW50JztcbmltcG9ydCB7IHByb2Nlc3NUcnhFdmVudCwgdHJ4Q29tbWFuZHMgfSBmcm9tICcuL0V2ZW50L1RyeEV2ZW50JztcbmltcG9ydCB7IGdldEZldGNoZXJzLCBnZXRDb3JlVmFsdWUgfSBmcm9tICcuL0NvcmVWYWx1ZSc7XG5pbXBvcnQgeyBmb3JtYXRFdmVudCB9IGZyb20gJy4vRm9ybWF0dGVyJztcbmltcG9ydCB7IGZhbGxiYWNrIH0gZnJvbSAnLi9JbnZva2F0aW9uJztcbmltcG9ydCB7IGdldEN1cnJlbnRCbG9ja051bWJlciwgZ2V0Q3VycmVudFRpbWVzdGFtcCwgc2VuZFJQQywgc2xlZXAgfSBmcm9tICcuL1V0aWxzJztcbmltcG9ydCB7IE1hcCB9IGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgeyBlbmNvZGVkTnVtYmVyIH0gZnJvbSAnLi9FbmNvZGluZyc7XG5pbXBvcnQgeyBwcmludEhlbHAgfSBmcm9tICcuL0hlbHAnO1xuaW1wb3J0IHsgbG9hZENvbnRyYWN0cyB9IGZyb20gJy4vTmV0d29ya3MnO1xuaW1wb3J0IHsgZm9yayB9IGZyb20gJy4vSHlwb3RoZXRpY2FsJztcbmltcG9ydCB7IGJ1aWxkQ29udHJhY3RFdmVudCB9IGZyb20gJy4vRXZlbnRCdWlsZGVyJztcbmltcG9ydCB7IENvdW50ZXIgfSBmcm9tICcuL0NvbnRyYWN0L0NvdW50ZXInO1xuaW1wb3J0IHsgQ29tcG91bmRMZW5zIH0gZnJvbSAnLi9Db250cmFjdC9Db21wb3VuZExlbnMnO1xuaW1wb3J0IHsgUmVzZXJ2b2lyIH0gZnJvbSAnLi9Db250cmFjdC9SZXNlcnZvaXInO1xuaW1wb3J0IFdlYjMgZnJvbSAnd2ViMyc7XG5cbmV4cG9ydCBjbGFzcyBFdmVudFByb2Nlc3NpbmdFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgZXJyb3I6IEVycm9yO1xuICBldmVudDogRXZlbnQ7XG5cbiAgY29uc3RydWN0b3IoZXJyb3I6IEVycm9yLCBldmVudDogRXZlbnQpIHtcbiAgICBzdXBlcihlcnJvci5tZXNzYWdlKTtcblxuICAgIHRoaXMuZXJyb3IgPSBlcnJvcjtcbiAgICB0aGlzLmV2ZW50ID0gZXZlbnQ7XG4gICAgdGhpcy5tZXNzYWdlID0gYEVycm9yOiBcXGAke3RoaXMuZXJyb3IudG9TdHJpbmcoKX1cXGAgd2hlbiBwcm9jZXNzaW5nIFxcYCR7Zm9ybWF0RXZlbnQodGhpcy5ldmVudCl9XFxgYDtcbiAgICB0aGlzLnN0YWNrID0gZXJyb3Iuc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NFdmVudHMob3JpZ2luYWxXb3JsZDogV29ybGQsIGV2ZW50czogRXZlbnRbXSk6IFByb21pc2U8V29ybGQ+IHtcbiAgcmV0dXJuIGV2ZW50cy5yZWR1Y2UoYXN5bmMgKHBXb3JsZDogUHJvbWlzZTxXb3JsZD4sIGV2ZW50OiBFdmVudCk6IFByb21pc2U8V29ybGQ+ID0+IHtcbiAgICBsZXQgd29ybGQgPSBhd2FpdCBwV29ybGQ7XG5cbiAgICB0cnkge1xuICAgICAgd29ybGQgPSBhd2FpdCBwcm9jZXNzQ29yZUV2ZW50KHNldEV2ZW50KHdvcmxkLCBldmVudCksIGV2ZW50LCB3b3JsZC5kZWZhdWx0RnJvbSgpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmICh3b3JsZC52ZXJib3NlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFdmVudFByb2Nlc3NpbmdFcnJvcihlcnIsIGV2ZW50KTtcbiAgICB9XG5cbiAgICAvLyBOZXh0LCBjaGVjayBhbnkgdW5jaGVja2VkIGludmFyaWFudHNcbiAgICB3b3JsZCA9IGF3YWl0IGNoZWNrSW52YXJpYW50cyh3b3JsZCk7XG5cbiAgICAvLyBDaGVjayBhbnkgZXhwZWN0YXRpb25zXG4gICAgd29ybGQgPSBhd2FpdCBjaGVja0V4cGVjdGF0aW9ucyh3b3JsZCk7XG5cbiAgICAvLyBBbHNvIGNsZWFyIHRyeCByZWxhdGVkIGZpZWxkc1xuICAgIHdvcmxkID0gd29ybGQuc2V0KCd0cnhJbnZva2F0aW9uT3B0cycsIE1hcCh7fSkpO1xuICAgIHdvcmxkID0gd29ybGQuc2V0KCduZXdJbnZva2F0aW9uJywgZmFsc2UpO1xuXG4gICAgaWYgKCF3b3JsZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbmNvdW50ZXJlZCBudWxsIHdvcmxkIHJlc3VsdCB3aGVuIHByb2Nlc3NpbmcgZXZlbnQgJHtldmVudFswXX06ICR7d29ybGR9YCk7XG4gICAgfSBlbHNlIGlmICghKHdvcmxkIGluc3RhbmNlb2YgV29ybGQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBFbmNvdW50ZXJlZCB3b3JsZCByZXN1bHQgd2hpY2ggd2FzIG5vdCBpc1dvcmxkIHdoZW4gcHJvY2Vzc2luZyBldmVudCAke2V2ZW50WzBdfTogJHt3b3JsZH1gXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB3b3JsZDtcbiAgfSwgUHJvbWlzZS5yZXNvbHZlKG9yaWdpbmFsV29ybGQpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJpbnQod29ybGQ6IFdvcmxkLCBtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPFdvcmxkPiB7XG4gIHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKG1lc3NhZ2UpO1xuXG4gIHJldHVybiB3b3JsZDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5zcGVjdCh3b3JsZDogV29ybGQsIHN0cmluZzogc3RyaW5nIHwgbnVsbCk6IFByb21pc2U8V29ybGQ+IHtcbiAgaWYgKHN0cmluZyAhPT0gbnVsbCkge1xuICAgIGNvbnNvbGUubG9nKFsnSW5zcGVjdCcsIHN0cmluZywgd29ybGQudG9KUygpXSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coWydJbnNwZWN0Jywgd29ybGQudG9KUygpXSk7XG4gIH1cblxuICByZXR1cm4gd29ybGQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbmRFdGhlcih3b3JsZDogV29ybGQsIGZyb206IHN0cmluZywgdG86IHN0cmluZywgYW1vdW50OiBlbmNvZGVkTnVtYmVyKTogUHJvbWlzZTxXb3JsZD4ge1xuICBsZXQgaW52b2thdGlvbiA9IGF3YWl0IGZhbGxiYWNrKHdvcmxkLCBmcm9tLCB0bywgYW1vdW50KTtcblxuICB3b3JsZCA9IGFkZEFjdGlvbih3b3JsZCwgYFNlbmQgJHthbW91bnR9IGZyb20gJHtmcm9tfSB0byAke3RvfWAsIGludm9rYXRpb24pO1xuXG4gIHJldHVybiB3b3JsZDtcbn1cblxuZXhwb3J0IGNvbnN0IGNvbW1hbmRzOiAoVmlldzxhbnk+IHwgKCh3b3JsZDogV29ybGQpID0+IFByb21pc2U8Vmlldzxhbnk+PikpW10gPSBbXG4gIG5ldyBWaWV3PHsgbjogTnVtYmVyViB9PihcbiAgICBgXG4gICAgICAjIyMjIEhpc3RvcnlcblxuICAgICAgKiBcIkhpc3Rvcnkgbjo8TnVtYmVyPj01XCIgLSBQcmludHMgaGlzdG9yeSBvZiBhY3Rpb25zXG4gICAgICAgICogRS5nLiBcIkhpc3RvcnlcIlxuICAgICAgICAqIEUuZy4gXCJIaXN0b3J5IDEwXCJcbiAgICBgLFxuICAgICdIaXN0b3J5JyxcbiAgICBbbmV3IEFyZygnbicsIGdldE51bWJlclYsIHsgZGVmYXVsdDogbmV3IE51bWJlclYoNSkgfSldLFxuICAgIGFzeW5jICh3b3JsZCwgeyBuIH0pID0+IHtcbiAgICAgIHdvcmxkLmFjdGlvbnMuc2xpY2UoMCwgTnVtYmVyKG4udmFsKSkuZm9yRWFjaChhY3Rpb24gPT4ge1xuICAgICAgICB3b3JsZC5wcmludGVyLnByaW50TGluZShhY3Rpb24udG9TdHJpbmcoKSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHdvcmxkO1xuICAgIH1cbiAgKSxcbiAgbmV3IFZpZXc8eyBzZWNvbmRzOiBOdW1iZXJWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgU2xlZXBTZWNvbmRzXG5cbiAgICAgICogXCJTbGVlcFNlY29uZHMgczo8TnVtYmVyPlwiIC0gU2xlZXBzIGZvciBnaXZlbiBhbW91bnQgb2YgdGltZS5cbiAgICAgICAgKiBFLmcuIFwiU2xlZXBTZWNvbmRzIDFcIiAtIFNsZWVwcyBmb3Igb25lIHNlY29uZFxuICAgIGAsXG4gICAgJ1NsZWVwU2Vjb25kcycsXG4gICAgW25ldyBBcmcoJ3NlY29uZHMnLCBnZXROdW1iZXJWKV0sXG4gICAgYXN5bmMgKHdvcmxkLCB7IHNlY29uZHMgfSkgPT4ge1xuICAgICAgYXdhaXQgc2xlZXAoc2Vjb25kcy50b051bWJlcigpICogMTAwMCk7XG4gICAgICByZXR1cm4gd29ybGQ7XG4gICAgfVxuICApLFxuICBuZXcgVmlldzx7IHRpbWVzdGFtcDogTnVtYmVyViB9PihcbiAgICBgXG4gICAgICAjIyMjIFNsZWVwVW50aWxUaW1lc3RhbXBcblxuICAgICAgKiBcIlNsZWVwVW50aWwgdGltZXN0YW1wOjxOdW1iZXI+XCIgLSBTbGVlcHMgdW50aWwgdGhlIGdpdmVuIHRpbWVzdGFtcFxuICAgICAgICAqIEUuZy4gXCJTbGVlcFVudGlsIDE1NzkxMjM0MjNcIiAtIFNsZWVwcyBmcm9tIG5vdyB1bnRpbCAxNTc5MTIzNDIzXG4gICAgYCxcbiAgICAnU2xlZXBVbnRpbFRpbWVzdGFtcCcsXG4gICAgW25ldyBBcmcoJ3RpbWVzdGFtcCcsIGdldE51bWJlclYpXSxcbiAgICBhc3luYyAod29ybGQsIHsgdGltZXN0YW1wIH0pID0+IHtcbiAgICAgIGNvbnN0IGRlbGF5ID0gdGltZXN0YW1wLnRvTnVtYmVyKCkgLSBnZXRDdXJyZW50VGltZXN0YW1wKCk7XG4gICAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICAgIGF3YWl0IHNsZWVwKGRlbGF5ICogMTAwMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gd29ybGQ7XG4gICAgfVxuICApLFxuICBuZXcgVmlldzx7IGJsb2NrczogTnVtYmVyViB9PihcbiAgICBgXG4gICAgICAjIyMjIFNsZWVwQmxvY2tzXG5cbiAgICAgICogXCJTbGVlcEZvckJsb2NrcyBibG9ja3M6PE51bWJlcj5cIiAtIFNsZWVwcyBmb3IgYSBnaXZlbiBudW1iZXIgb2YgYmxvY2tzXG4gICAgICAgICogRS5nLiBcIlNsZWVwQmxvY2tzIDIwXCIgLSBTbGVlcHMgZm9yIDIwIGJsb2Nrc1xuICAgIGAsXG4gICAgJ1NsZWVwQmxvY2tzJyxcbiAgICBbbmV3IEFyZygnYmxvY2tzJywgZ2V0TnVtYmVyVildLFxuICAgIGFzeW5jICh3b3JsZCwgeyBibG9ja3MgfSkgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0QmxvY2tOdW1iZXIgPSBibG9ja3MudG9OdW1iZXIoKSArIGF3YWl0IGdldEN1cnJlbnRCbG9ja051bWJlcih3b3JsZCk7XG4gICAgICB3aGlsZSAoYXdhaXQgZ2V0Q3VycmVudEJsb2NrTnVtYmVyKHdvcmxkKSA8IHRhcmdldEJsb2NrTnVtYmVyKSB7XG4gICAgICAgIGF3YWl0IHNsZWVwKDEwMDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHdvcmxkO1xuICAgIH1cbiAgKSxcbiAgbmV3IFZpZXc8eyBibG9ja051bWJlcjogTnVtYmVyViB9PihcbiAgICBgXG4gICAgICAjIyMjIFNsZWVwVW50aWxCbG9ja1xuXG4gICAgICAqIFwiU2xlZXBVbnRpbEJsb2NrIGJsb2NrTnVtYmVyOjxOdW1iZXI+XCIgLSBTbGVlcHMgdW50aWwgdGhlIGdpdmVuIGJsb2NrTnVtYmVyXG4gICAgICAgICogRS5nLiBcIlNsZWVwVW50aWxCbG9jayAyMDA2ODY4XCIgLSBTbGVlcHMgZnJvbSBub3cgdW50aWwgYmxvY2sgMjAwNjg2OC5cbiAgICBgLFxuICAgICdTbGVlcFVudGlsQmxvY2snLFxuICAgIFtuZXcgQXJnKCdibG9ja051bWJlcicsIGdldE51bWJlclYpXSxcbiAgICBhc3luYyAod29ybGQsIHsgYmxvY2tOdW1iZXIgfSkgPT4ge1xuICAgICAgY29uc3QgZGVsYXkgPSBibG9ja051bWJlci50b051bWJlcigpIC0gYXdhaXQgZ2V0Q3VycmVudEJsb2NrTnVtYmVyKHdvcmxkKTtcbiAgICAgIHdoaWxlIChibG9ja051bWJlci50b051bWJlcigpID4gYXdhaXQgZ2V0Q3VycmVudEJsb2NrTnVtYmVyKHdvcmxkKSkge1xuICAgICAgICBhd2FpdCBzbGVlcCgxMDAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB3b3JsZDtcbiAgICB9XG4gICksXG4gIG5ldyBWaWV3PHsgZXJyTXNnOiBTdHJpbmdWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgVGhyb3dcblxuICAgICAgKiBcIlRocm93IGVyck1zZzo8U3RyaW5nPlwiIC0gVGhyb3dzIGdpdmVuIGVycm9yXG4gICAgICAgICogRS5nLiBcIlRocm93IFxcXCJteSBlcnJvciBtZXNzYWdlXFxcIlwiXG4gICAgYCxcbiAgICAnVGhyb3cnLFxuICAgIFtuZXcgQXJnKCdlcnJNc2cnLCBnZXRTdHJpbmdWKV0sXG4gICAgYXN5bmMgKHdvcmxkLCB7IGVyck1zZyB9KSA9PiB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnLnZhbCk7XG5cbiAgICAgIHJldHVybiB3b3JsZDtcbiAgICB9XG4gICksXG4gIGFzeW5jICh3b3JsZDogV29ybGQpID0+XG4gICAgbmV3IFZpZXc8eyByZXM6IFZhbHVlIH0+KFxuICAgICAgYFxuICAgICAgICAjIyMjIFJlYWRcblxuICAgICAgICAqIFwiUmVhZCAuLi5cIiAtIFJlYWRzIGdpdmVuIHZhbHVlIGFuZCBwcmludHMgcmVzdWx0XG4gICAgICAgICAgKiBFLmcuIFwiUmVhZCBDVG9rZW4gY0JBVCBFeGNoYW5nZVJhdGVTdG9yZWRcIiAtIFJldHVybnMgZXhjaGFuZ2UgcmF0ZSBvZiBjQkFUXG4gICAgICBgLFxuICAgICAgJ1JlYWQnLFxuICAgICAgW25ldyBBcmcoJ3JlcycsIGdldENvcmVWYWx1ZSwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgICBhc3luYyAod29ybGQsIHsgcmVzIH0pID0+IHtcbiAgICAgICAgd29ybGQucHJpbnRlci5wcmludFZhbHVlKHJlcyk7XG5cbiAgICAgICAgcmV0dXJuIHdvcmxkO1xuICAgICAgfSxcbiAgICAgIHsgc3ViRXhwcmVzc2lvbnM6IChhd2FpdCBnZXRGZXRjaGVycyh3b3JsZCkpLmZldGNoZXJzIH1cbiAgICApLFxuICBuZXcgVmlldzx7IG1lc3NhZ2U6IFN0cmluZ1YgfT4oXG4gICAgYFxuICAgICAgIyMjIyBQcmludFxuXG4gICAgICAqIFwiUHJpbnQgLi4uXCIgLSBQcmludHMgZ2l2ZW4gc3RyaW5nXG4gICAgICAgICogRS5nLiBcIlByaW50IFxcXCJIZWxsbyB0aGVyZVxcXCJcIlxuICAgIGAsXG4gICAgJ1ByaW50JyxcbiAgICBbbmV3IEFyZygnbWVzc2FnZScsIGdldFN0cmluZ1YpXSxcbiAgICBhc3luYyAod29ybGQsIHsgbWVzc2FnZSB9KSA9PiBwcmludCh3b3JsZCwgbWVzc2FnZS52YWwpXG4gICksXG4gIG5ldyBWaWV3PHt9PihcbiAgICBgXG4gICAgICAjIyMjIFByaW50VHJhbnNhY3Rpb25Mb2dzXG5cbiAgICAgICogXCJQcmludFRyYW5zYWN0aW9uTG9nc1wiIC0gUHJpbnRzIGxvZ3MgZnJvbSBhbGwgdHJhbnNhY2lvbnNcbiAgICBgLFxuICAgICdQcmludFRyYW5zYWN0aW9uTG9ncycsXG4gICAgW10sXG4gICAgYXN5bmMgKHdvcmxkLCB7IH0pID0+IHtcbiAgICAgIHJldHVybiBhd2FpdCB3b3JsZC51cGRhdGVTZXR0aW5ncyhhc3luYyBzZXR0aW5ncyA9PiB7XG4gICAgICAgIHNldHRpbmdzLnByaW50VHhMb2dzID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgICB9KTtcbiAgICB9XG4gICksXG4gIG5ldyBWaWV3PHsgdXJsOiBTdHJpbmdWOyB1bmxvY2tlZEFjY291bnRzOiBBZGRyZXNzVltdIH0+KFxuICAgIGBcbiAgICAgICMjIyMgV2ViM0ZvcmtcblxuICAgICAgKiBcIldlYjNGb3JrIHVybDo8U3RyaW5nPiB1bmxvY2tlZEFjY291bnRzOjxTdHJpbmc+W11cIiAtIENyZWF0ZXMgYW4gaW4tbWVtb3J5IGdhbmFjaGVcbiAgICAgICAgKiBFLmcuIFwiV2ViM0ZvcmsgXFxcImh0dHBzOi8vbWFpbm5ldC5pbmZ1cmEuaW8vdjMvZTFhNWQ0ZDJjMDZhNGU4MTk0NWZjYTU2ZDBkNWQ4ZWFcXFwiIChcXFwiMHg4Yjg1OTJlOTU3MGU5NjE2NjMzNjYwM2ExYjRiZDFlOGRiMjBmYTIwXFxcIilcIlxuICAgIGAsXG4gICAgJ1dlYjNGb3JrJyxcbiAgICBbXG4gICAgICBuZXcgQXJnKCd1cmwnLCBnZXRTdHJpbmdWKSxcbiAgICAgIG5ldyBBcmcoJ3VubG9ja2VkQWNjb3VudHMnLCBnZXRBZGRyZXNzViwgeyBkZWZhdWx0OiBbXSwgbWFwcGVkOiB0cnVlIH0pXG4gICAgXSxcbiAgICBhc3luYyAod29ybGQsIHsgdXJsLCB1bmxvY2tlZEFjY291bnRzIH0pID0+IGZvcmsod29ybGQsIHVybC52YWwsIHVubG9ja2VkQWNjb3VudHMubWFwKHYgPT4gdi52YWwpKVxuICApLFxuXG4gIG5ldyBWaWV3PHsgbmV0d29ya1ZhbDogU3RyaW5nVjsgfT4oXG4gICAgYFxuICAgICAgIyMjIyBVc2VDb25maWdzXG5cbiAgICAgICogXCJVc2VDb25maWdzIG5ldHdvcmtWYWw6PFN0cmluZz5cIiAtIFVwZGF0ZXMgd29ybGQgdG8gdXNlIHRoZSBjb25maWdzIGZvciBzcGVjaWZpZWQgbmV0d29ya1xuICAgICAgICAqIEUuZy4gXCJVc2VDb25maWdzIG1haW5uZXRcIlxuICAgIGAsXG4gICAgJ1VzZUNvbmZpZ3MnLFxuICAgIFtuZXcgQXJnKCduZXR3b3JrVmFsJywgZ2V0U3RyaW5nVildLFxuICAgIGFzeW5jICh3b3JsZCwgeyBuZXR3b3JrVmFsIH0pID0+IHtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrVmFsLnZhbDtcbiAgICAgIGlmICh3b3JsZC5iYXNlUGF0aCAmJiAobmV0d29yayA9PT0gJ21haW5uZXQnIHx8IG5ldHdvcmsgPT09ICdrb3ZhbicgfHwgbmV0d29yayA9PT0gJ2dvZXJsaScgfHwgbmV0d29yayA9PT0gJ3JpbmtlYnknIHx8IG5ldHdvcmsgPT0gJ3JvcHN0ZW4nKSkge1xuICAgICAgICBsZXQgbmV3V29ybGQgPSB3b3JsZC5zZXQoJ25ldHdvcmsnLCBuZXR3b3JrKTtcbiAgICAgICAgbGV0IGNvbnRyYWN0SW5mbztcbiAgICAgICAgW25ld1dvcmxkLCBjb250cmFjdEluZm9dID0gYXdhaXQgbG9hZENvbnRyYWN0cyhuZXdXb3JsZCk7XG4gICAgICAgIGlmIChjb250cmFjdEluZm8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKGBDb250cmFjdHM6YCk7XG4gICAgICAgICAgY29udHJhY3RJbmZvLmZvckVhY2goKGluZm8pID0+IHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKGBcXHQke2luZm99YCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ld1dvcmxkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gd29ybGQ7XG4gICAgfVxuICApLFxuXG4gIG5ldyBWaWV3PHsgYWRkcmVzczogQWRkcmVzc1YgfT4oXG4gICAgYFxuICAgICAgIyMjIyBNeUFkZHJlc3NcblxuICAgICAgKiBcIk15QWRkcmVzcyBhZGRyZXNzOjxTdHJpbmc+XCIgLSBTZXRzIGRlZmF1bHQgZnJvbSBhZGRyZXNzIChzYW1lIGFzIFwiQWxpYXMgTWUgPGFkZHI+XCIpXG4gICAgICAgICogRS5nLiBcIk15QWRkcmVzcyBcXFwiMHg5QzE4NTY2MzZkNzhDMDUxZGVBZDZDQUI5YzU2OTllNEUyNTU0OWU5XFxcIlwiXG4gICAgYCxcbiAgICAnTXlBZGRyZXNzJyxcbiAgICBbbmV3IEFyZygnYWRkcmVzcycsIGdldEFkZHJlc3NWKV0sXG4gICAgYXN5bmMgKHdvcmxkLCB7IGFkZHJlc3MgfSkgPT4ge1xuICAgICAgcmV0dXJuIGF3YWl0IHdvcmxkLnVwZGF0ZVNldHRpbmdzKGFzeW5jIHNldHRpbmdzID0+IHtcbiAgICAgICAgc2V0dGluZ3MuYWxpYXNlc1snTWUnXSA9IGFkZHJlc3MudmFsO1xuXG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICAgIH0pO1xuICAgIH1cbiAgKSxcbiAgbmV3IFZpZXc8eyBuYW1lOiBTdHJpbmdWOyBhZGRyZXNzOiBBZGRyZXNzViB9PihcbiAgICBgXG4gICAgICAjIyMjIEFsaWFzXG5cbiAgICAgICogXCJBbGlhcyBuYW1lOjxTdHJpbmc+IGFkZHJlc3M6PFN0cmluZz5cIiAtIFN0b3JlcyBhbiBhbGlhcyBiZXR3ZWVuIG5hbWUgYW5kIGFkZHJlc3NcbiAgICAgICAgKiBFLmcuIFwiQWxpYXMgTWUgXFxcIjB4OUMxODU2NjM2ZDc4QzA1MWRlQWQ2Q0FCOWM1Njk5ZTRFMjU1NDllOVxcXCJcIlxuICAgIGAsXG4gICAgJ0FsaWFzJyxcbiAgICBbbmV3IEFyZygnbmFtZScsIGdldFN0cmluZ1YpLCBuZXcgQXJnKCdhZGRyZXNzJywgZ2V0QWRkcmVzc1YpXSxcbiAgICBhc3luYyAod29ybGQsIHsgbmFtZSwgYWRkcmVzcyB9KSA9PiB7XG4gICAgICByZXR1cm4gYXdhaXQgd29ybGQudXBkYXRlU2V0dGluZ3MoYXN5bmMgc2V0dGluZ3MgPT4ge1xuICAgICAgICBzZXR0aW5ncy5hbGlhc2VzW25hbWUudmFsXSA9IGFkZHJlc3MudmFsO1xuXG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICAgIH0pO1xuICAgIH1cbiAgKSxcblxuICBuZXcgVmlldzx7IG5hbWU6IFN0cmluZ1Y7IGFkZHJlc3M6IEFkZHJlc3NWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgQWxpYXNlc1xuXG4gICAgICAqIFwiQWxpYXNlcyAtIFByaW50cyBhbGwgYWxpYXNlc1xuICAgIGAsXG4gICAgJ0FsaWFzZXMnLFxuICAgIFtdLFxuICAgIGFzeW5jICh3b3JsZCwgeyBuYW1lLCBhZGRyZXNzIH0pID0+IHtcbiAgICAgIHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKCdBbGlhc2VzOicpO1xuICAgICAgT2JqZWN0LmVudHJpZXMod29ybGQuc2V0dGluZ3MuYWxpYXNlcykuZm9yRWFjaCgoW25hbWUsIGFkZHJlc3NdKSA9PiB7XG4gICAgICAgIHdvcmxkLnByaW50ZXIucHJpbnRMaW5lKGBcXHQke25hbWV9OiAke2FkZHJlc3N9YCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHdvcmxkO1xuICAgIH1cbiAgKSxcblxuICBuZXcgVmlldzx7IHNlY29uZHM6IE51bWJlclYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBJbmNyZWFzZVRpbWVcblxuICAgICAgKiBcIkluY3JlYXNlVGltZSBzZWNvbmRzOjxOdW1iZXI+XCIgLSBJbmNyZWFzZSBHYW5hY2hlIGV2bSB0aW1lIGJ5IGEgbnVtYmVyIG9mIHNlY29uZHNcbiAgICAgICAgKiBFLmcuIFwiSW5jcmVhc2VUaW1lIDYwXCJcbiAgICBgLFxuICAgICdJbmNyZWFzZVRpbWUnLFxuICAgIFtuZXcgQXJnKCdzZWNvbmRzJywgZ2V0TnVtYmVyVildLFxuICAgIGFzeW5jICh3b3JsZCwgeyBzZWNvbmRzIH0pID0+IHtcbiAgICAgIGF3YWl0IHNlbmRSUEMod29ybGQsICdldm1faW5jcmVhc2VUaW1lJywgW051bWJlcihzZWNvbmRzLnZhbCldKTtcbiAgICAgIGF3YWl0IHNlbmRSUEMod29ybGQsICdldm1fbWluZScsIFtdKTtcbiAgICAgIHJldHVybiB3b3JsZDtcbiAgICB9XG4gICksXG5cbiAgbmV3IFZpZXc8eyB0aW1lc3RhbXA6IE51bWJlclYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBTZXRUaW1lXG5cbiAgICAgICogXCJTZXRUaW1lIHRpbWVzdGFtcDo8TnVtYmVyPlwiIC0gSW5jcmVhc2UgR2FuYWNoZSBldm0gdGltZSB0byBzcGVjaWZpYyB0aW1lc3RhbXBcbiAgICAgICAgKiBFLmcuIFwiU2V0VGltZSAxNTczNTk3NDAwXCJcbiAgICBgLFxuICAgICdTZXRUaW1lJyxcbiAgICBbbmV3IEFyZygndGltZXN0YW1wJywgZ2V0TnVtYmVyVildLFxuICAgIGFzeW5jICh3b3JsZCwgeyB0aW1lc3RhbXAgfSkgPT4ge1xuICAgICAgYXdhaXQgc2VuZFJQQyh3b3JsZCwgJ2V2bV9taW5lJywgW3RpbWVzdGFtcC52YWxdKTtcbiAgICAgIHJldHVybiB3b3JsZDtcbiAgICB9XG4gICksXG5cbiAgbmV3IFZpZXc8eyB0aW1lc3RhbXA6IE51bWJlclYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBGcmVlemVUaW1lXG5cbiAgICAgICogXCJGcmVlemVUaW1lIHRpbWVzdGFtcDo8TnVtYmVyPlwiIC0gRnJlZXplIEdhbmFjaGUgZXZtIHRpbWUgdG8gc3BlY2lmaWMgdGltZXN0YW1wXG4gICAgICAgICogRS5nLiBcIkZyZWV6ZVRpbWUgMTU3MzU5NzQwMFwiXG4gICAgYCxcbiAgICAnRnJlZXplVGltZScsXG4gICAgW25ldyBBcmcoJ3RpbWVzdGFtcCcsIGdldE51bWJlclYpXSxcbiAgICBhc3luYyAod29ybGQsIHsgdGltZXN0YW1wIH0pID0+IHtcbiAgICAgIGF3YWl0IHNlbmRSUEMod29ybGQsICdldm1fZnJlZXplVGltZScsIFt0aW1lc3RhbXAudmFsXSk7XG4gICAgICByZXR1cm4gd29ybGQ7XG4gICAgfVxuICApLFxuXG4gIG5ldyBWaWV3PHt9PihcbiAgICBgXG4gICAgICAjIyMjIE1pbmVCbG9ja1xuXG4gICAgICAqIFwiTWluZUJsb2NrXCIgLSBJbmNyZWFzZSBHYW5hY2hlIGV2bSBibG9jayBudW1iZXJcbiAgICAgICAgKiBFLmcuIFwiTWluZUJsb2NrXCJcbiAgICBgLFxuICAgICdNaW5lQmxvY2snLFxuICAgIFtdLFxuICAgIGFzeW5jICh3b3JsZCwgeyB9KSA9PiB7XG4gICAgICBhd2FpdCBzZW5kUlBDKHdvcmxkLCAnZXZtX21pbmUnLCBbXSk7XG4gICAgICByZXR1cm4gd29ybGQ7XG4gICAgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgYmxvY2tOdW1iZXI6IE51bWJlclYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBTZXRCbG9ja051bWJlclxuXG4gICAgICAqIFwiU2V0QmxvY2tOdW1iZXIgMTBcIiAtIEluY3JlYXNlIEdhbmFjaGUgZXZtIGJsb2NrIG51bWJlclxuICAgICAgICAqIEUuZy4gXCJTZXRCbG9ja051bWJlciAxMFwiXG4gICAgYCxcbiAgICAnU2V0QmxvY2tOdW1iZXInLFxuICAgIFtuZXcgQXJnKCdibG9ja051bWJlcicsIGdldE51bWJlclYpXSxcbiAgICBhc3luYyAod29ybGQsIGZyb20sIHsgYmxvY2tOdW1iZXIgfSkgPT4ge1xuICAgICAgYXdhaXQgc2VuZFJQQyh3b3JsZCwgJ2V2bV9taW5lQmxvY2tOdW1iZXInLCBbYmxvY2tOdW1iZXIudG9OdW1iZXIoKSAtIDFdKVxuICAgICAgcmV0dXJuIHdvcmxkO1xuICAgIH1cbiAgKSxcblxuICBuZXcgQ29tbWFuZDx7IGJsb2NrTnVtYmVyOiBOdW1iZXJWLCBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgQmxvY2tcblxuICAgICAgKiBcIkJsb2NrIDEwICguLi5ldmVudClcIiAtIFNldCBibG9jayB0byBibG9jayBOIGFuZCBydW4gZXZlbnRcbiAgICAgICAgKiBFLmcuIFwiQmxvY2sgMTAgKENvbXAgRGVwbG95IEFkbWluKVwiXG4gICAgYCxcbiAgICAnQmxvY2snLFxuICAgIFtcbiAgICAgIG5ldyBBcmcoJ2Jsb2NrTnVtYmVyJywgZ2V0TnVtYmVyViksXG4gICAgICBuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50VilcbiAgICBdLFxuICAgIGFzeW5jICh3b3JsZCwgZnJvbSwgeyBibG9ja051bWJlciwgZXZlbnQgfSkgPT4ge1xuICAgICAgYXdhaXQgc2VuZFJQQyh3b3JsZCwgJ2V2bV9taW5lQmxvY2tOdW1iZXInLCBbYmxvY2tOdW1iZXIudG9OdW1iZXIoKSAtIDJdKVxuICAgICAgcmV0dXJuIGF3YWl0IHByb2Nlc3NDb3JlRXZlbnQod29ybGQsIGV2ZW50LnZhbCwgZnJvbSk7XG4gICAgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgYmxvY2tOdW1iZXI6IE51bWJlclYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBBZHZhbmNlQmxvY2tzXG5cbiAgICAgICogXCJBZHZhbmNlQmxvY2tzIDEwXCIgLSBJbmNyZWFzZSBHYW5hY2hlIGxhdGVzdCArIGJsb2NrIG51bWJlclxuICAgICAgICAqIEUuZy4gXCJBZHZhbmNlQmxvY2tzIDEwXCJcbiAgICBgLFxuICAgICdBZHZhbmNlQmxvY2tzJyxcbiAgICBbbmV3IEFyZygnYmxvY2tOdW1iZXInLCBnZXROdW1iZXJWKV0sXG4gICAgYXN5bmMgKHdvcmxkLCBmcm9tLCB7IGJsb2NrTnVtYmVyIH0pID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRCbG9ja051bWJlciA9IGF3YWl0IGdldEN1cnJlbnRCbG9ja051bWJlcih3b3JsZCk7XG4gICAgICBhd2FpdCBzZW5kUlBDKHdvcmxkLCAnZXZtX21pbmVCbG9ja051bWJlcicsIFtOdW1iZXIoYmxvY2tOdW1iZXIudmFsKSArIGN1cnJlbnRCbG9ja051bWJlcl0pO1xuICAgICAgcmV0dXJuIHdvcmxkO1xuICAgIH1cbiAgKSxcblxuICBuZXcgVmlldzx7fT4oXG4gICAgYFxuICAgICAgIyMjIyBJbnNwZWN0XG5cbiAgICAgICogXCJJbnNwZWN0XCIgLSBQcmludHMgZGVidWdnaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSB3b3JsZFxuICAgIGAsXG4gICAgJ0luc3BlY3QnLFxuICAgIFtdLFxuICAgIGFzeW5jICh3b3JsZCwgeyB9KSA9PiBpbnNwZWN0KHdvcmxkLCBudWxsKVxuICApLFxuXG4gIG5ldyBWaWV3PHsgbWVzc2FnZTogU3RyaW5nViB9PihcbiAgICBgXG4gICAgICAjIyMjIERlYnVnXG5cbiAgICAgICogXCJEZWJ1ZyBtZXNzYWdlOjxTdHJpbmc+XCIgLSBTYW1lIGFzIGluc3BlY3QgYnV0IHByZXBlbmRzIHdpdGggYSBzdHJpbmdcbiAgICBgLFxuICAgICdEZWJ1ZycsXG4gICAgW25ldyBBcmcoJ21lc3NhZ2UnLCBnZXRTdHJpbmdWKV0sXG4gICAgYXN5bmMgKHdvcmxkLCB7IG1lc3NhZ2UgfSkgPT4gaW5zcGVjdCh3b3JsZCwgbWVzc2FnZS52YWwpXG4gICksXG5cbiAgbmV3IFZpZXc8eyBhY2NvdW50OiBBZGRyZXNzVjsgZXZlbnQ6IEV2ZW50ViB9PihcbiAgICBgXG4gICAgICAjIyMjIEZyb21cblxuICAgICAgKiBcIkZyb20gPFVzZXI+IDxFdmVudD5cIiAtIFJ1bnMgZXZlbnQgYXMgdGhlIGdpdmVuIHVzZXJcbiAgICAgICAgKiBFLmcuIFwiRnJvbSBHZW9mZiAoQ1Rva2VuIGNaUlggTWludCA1ZTE4KVwiXG4gICAgYCxcbiAgICAnRnJvbScsXG4gICAgW25ldyBBcmcoJ2FjY291bnQnLCBnZXRBZGRyZXNzViksIG5ldyBBcmcoJ2V2ZW50JywgZ2V0RXZlbnRWKV0sXG4gICAgYXN5bmMgKHdvcmxkLCB7IGFjY291bnQsIGV2ZW50IH0pID0+IHByb2Nlc3NDb3JlRXZlbnQod29ybGQsIGV2ZW50LnZhbCwgYWNjb3VudC52YWwpXG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgVHJ4XG5cbiAgICAgICogXCJUcnggLi4udHJ4RXZlbnRcIiAtIEhhbmRsZXMgZXZlbnQgdG8gc2V0IGRldGFpbHMgb2YgbmV4dCB0cmFuc2FjdGlvblxuICAgICAgICAqIEUuZy4gXCJUcnggVmFsdWUgMS4wZTE4IChDVG9rZW4gY0V0aCBNaW50IDEuMGUxOClcIlxuICAgIGAsXG4gICAgJ1RyeCcsXG4gICAgW25ldyBBcmcoJ2V2ZW50JywgZ2V0RXZlbnRWLCB7IHZhcmlhZGljOiB0cnVlIH0pXSxcbiAgICBhc3luYyAod29ybGQsIGZyb20sIHsgZXZlbnQgfSkgPT4gcHJvY2Vzc1RyeEV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pLFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IHRyeENvbW1hbmRzKCkgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgZXZlbnQ6IEV2ZW50ViB9PihcbiAgICBgXG4gICAgICAjIyMjIEludmFyaWFudFxuXG4gICAgICAqIFwiSW52YXJpYW50IC4uLmludmFyaWFudFwiIC0gQWRkcyBhIG5ldyBpbnZhcmlhbnQgdG8gdGhlIHdvcmxkIHdoaWNoIGlzIGNoZWNrZWQgYWZ0ZXIgZWFjaCB0cmFuc2FjdGlvblxuICAgICAgICAqIEUuZy4gXCJJbnZhcmlhbnQgU3RhdGljIChDVG9rZW4gY1pSWCBUb3RhbFN1cHBseSlcIlxuICAgIGAsXG4gICAgJ0ludmFyaWFudCcsXG4gICAgW25ldyBBcmcoJ2V2ZW50JywgZ2V0RXZlbnRWLCB7IHZhcmlhZGljOiB0cnVlIH0pXSxcbiAgICBhc3luYyAod29ybGQsIGZyb20sIHsgZXZlbnQgfSkgPT4gcHJvY2Vzc0ludmFyaWFudEV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pLFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IGludmFyaWFudENvbW1hbmRzKCkgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgZXZlbnQ6IEV2ZW50ViB9PihcbiAgICBgXG4gICAgICAjIyMjIEV4cGVjdFxuXG4gICAgICAqIFwiRXhwZWN0IC4uLmV4cGVjdGF0aW9uXCIgLSBBZGRzIGFuIGV4cGVjdGF0aW9uIHRvIGhvbGQgYWZ0ZXIgdGhlIG5leHQgdHJhbnNhY3Rpb25cbiAgICAgICAgKiBFLmcuIFwiRXhwZWN0IENoYW5nZXMgKENUb2tlbiBjWlJYIFRvdGFsU3VwcGx5KSArMTAuMGUxOFwiXG4gICAgYCxcbiAgICAnRXhwZWN0JyxcbiAgICBbbmV3IEFyZygnZXZlbnQnLCBnZXRFdmVudFYsIHsgdmFyaWFkaWM6IHRydWUgfSldLFxuICAgIGFzeW5jICh3b3JsZCwgZnJvbSwgeyBldmVudCB9KSA9PiBwcm9jZXNzRXhwZWN0YXRpb25FdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKSxcbiAgICB7IHN1YkV4cHJlc3Npb25zOiBleHBlY3RhdGlvbkNvbW1hbmRzKCkgfVxuICApLFxuXG4gIG5ldyBWaWV3PHsgdHlwZTogU3RyaW5nViB9PihcbiAgICBgXG4gICAgICAjIyMjIEhvbGRJbnZhcmlhbnRzXG5cbiAgICAgICogXCJIb2xkSW52YXJpYW50cyB0eXBlOjxTdHJpbmc+XCIgLSBTa2lwcyBjaGVja2luZyBpbnZhcmlhbnRzIG9uIG5leHQgY29tbWFuZC5cbiAgICAgICAgKiBFLmcuIFwiSG9sZEludmFyaWFudHNcIiAtIFNraXBzIGFsbCBpbnZhcmlhbnRzXG4gICAgICAgICogRS5nLiBcIkhvbGRJbnZhcmlhbnRzIEFsbFwiIC0gU2tpcHMgYWxsIGludmFyaWFudHNcbiAgICAgICAgKiBFLmcuIFwiSG9sZEludmFyaWFudHMgU3VjY2Vzc1wiIC0gU2tpcHMgXCJzdWNjZXNzXCIgaW52YXJpYW50c1xuICAgICAgICAqIEUuZy4gXCJIb2xkSW52YXJpYW50cyBSZW1haW5zXCIgLSBTa2lwcyBcInJlbWFpbnNcIiBpbnZhcmlhbnRzXG4gICAgICAgICogRS5nLiBcIkhvbGRJbnZhcmlhbnRzIFN0YXRpY1wiIC0gU2tpcHMgXCJzdGF0aWNcIiBpbnZhcmlhbnRzXG4gICAgYCxcbiAgICAnSG9sZEludmFyaWFudHMnLFxuICAgIFtuZXcgQXJnKCd0eXBlJywgZ2V0U3RyaW5nViwgeyBkZWZhdWx0OiBuZXcgU3RyaW5nVignQWxsJykgfSldLFxuICAgIGFzeW5jICh3b3JsZCwgeyB0eXBlIH0pID0+IGhvbGRJbnZhcmlhbnRzKHdvcmxkLCB0eXBlLnZhbClcbiAgKSxcblxuICBuZXcgVmlldzx7IHR5cGU6IFN0cmluZ1YgfT4oXG4gICAgYFxuICAgICAgIyMjIyBDbGVhckludmFyaWFudHNcblxuICAgICAgKiBcIkNsZWFySW52YXJpYW50cyB0eXBlOjxTdHJpbmc+XCIgLSBSZW1vdmVzIGFsbCBpbnZhcmlhbnRzLlxuICAgICAgICAqIEUuZy4gXCJDbGVhckludmFyaWFudHNcIiAtIFJlbW92ZXMgYWxsIGludmFyaWFudHNcbiAgICAgICAgKiBFLmcuIFwiQ2xlYXJJbnZhcmlhbnRzIEFsbFwiIC0gUmVtb3ZlcyBhbGwgaW52YXJpYW50c1xuICAgICAgICAqIEUuZy4gXCJDbGVhckludmFyaWFudHMgU3VjY2Vzc1wiIC0gUmVtb3ZlcyBcInN1Y2Nlc3NcIiBpbnZhcmlhbnRzXG4gICAgICAgICogRS5nLiBcIkNsZWFySW52YXJpYW50cyBSZW1haW5zXCIgLSBSZW1vdmVzIFwicmVtYWluc1wiIGludmFyaWFudHNcbiAgICAgICAgKiBFLmcuIFwiQ2xlYXJJbnZhcmlhbnRzIFN0YXRpY1wiIC0gUmVtb3ZlcyBcInN0YXRpY1wiIGludmFyaWFudHNcbiAgICBgLFxuICAgICdDbGVhckludmFyaWFudHMnLFxuICAgIFtuZXcgQXJnKCd0eXBlJywgZ2V0U3RyaW5nViwgeyBkZWZhdWx0OiBuZXcgU3RyaW5nVignQWxsJykgfSldLFxuICAgIGFzeW5jICh3b3JsZCwgeyB0eXBlIH0pID0+IGNsZWFySW52YXJpYW50cyh3b3JsZCwgdHlwZS52YWwpXG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgQXNzZXJ0XG5cbiAgICAgICogXCJBc3NlcnQgLi4uZXZlbnRcIiAtIFZhbGlkYXRlcyBnaXZlbiBhc3NlcnRpb24sIHJhaXNpbmcgYW4gZXhjZXB0aW9uIGlmIGFzc2VydGlvbiBmYWlsc1xuICAgICAgICAqIEUuZy4gXCJBc3NlcnQgRXF1YWwgKEVyYzIwIEJBVCBUb2tlbkJhbGFuY2UgR2VvZmYpIChFeGFjdGx5IDUuMClcIlxuICAgIGAsXG4gICAgJ0Fzc2VydCcsXG4gICAgW25ldyBBcmcoJ2V2ZW50JywgZ2V0RXZlbnRWLCB7IHZhcmlhZGljOiB0cnVlIH0pXSxcbiAgICBhc3luYyAod29ybGQsIGZyb20sIHsgZXZlbnQgfSkgPT4gcHJvY2Vzc0Fzc2VydGlvbkV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pLFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IGFzc2VydGlvbkNvbW1hbmRzKCkgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgZ2F0ZTogVmFsdWU7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBHYXRlXG5cbiAgICAgICogXCJHYXRlIHZhbHVlIGV2ZW50XCIgLSBSdW5zIGV2ZW50IG9ubHkgaWYgdmFsdWUgaXMgZmFsc2V5LiBUaHVzLCBnYXRlIGNhbiBiZSB1c2VkIHRvIGJ1aWxkIGlkZW1wb3RlbmN5LlxuICAgICAgICAqIEUuZy4gXCJHYXRlIChFcmMyMCBaUlggQWRkcmVzcykgKEVyYzIwIERlcGxveSBCQVQpXCJcbiAgICBgLFxuICAgICdHYXRlJyxcbiAgICBbbmV3IEFyZygnZ2F0ZScsIGdldENvcmVWYWx1ZSwgeyByZXNjdWU6IG5ldyBOb3RoaW5nVigpIH0pLCBuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50VildLFxuICAgIGFzeW5jICh3b3JsZCwgZnJvbSwgeyBnYXRlLCBldmVudCB9KSA9PiB7XG4gICAgICBpZiAoZ2F0ZS50cnV0aHkoKSkge1xuICAgICAgICByZXR1cm4gd29ybGQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc0NvcmVFdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKTtcbiAgICAgIH1cbiAgICB9XG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBnaXZlbjogVmFsdWU7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBHaXZlblxuXG4gICAgICAqIFwiR2l2ZW4gdmFsdWUgZXZlbnRcIiAtIFJ1bnMgZXZlbnQgb25seSBpZiB2YWx1ZSBpcyB0cnV0aHkuIFRodXMsIGdpdmVuIGNhbiBiZSB1c2VkIHRvIGJ1aWxkIGV4aXN0ZW5jZSBjaGVja3MuXG4gICAgICAgICogRS5nLiBcIkdpdmVuICgkdmFyKSAoUHJpY2VPcmFjbGUgU2V0UHJpY2UgY0JBVCAkdmFyKVwiXG4gICAgYCxcbiAgICAnR2l2ZW4nLFxuICAgIFtuZXcgQXJnKCdnaXZlbicsIGdldENvcmVWYWx1ZSwgeyByZXNjdWU6IG5ldyBOb3RoaW5nVigpIH0pLCBuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50VildLFxuICAgIGFzeW5jICh3b3JsZCwgZnJvbSwgeyBnaXZlbiwgZXZlbnQgfSkgPT4ge1xuICAgICAgaWYgKGdpdmVuLnRydXRoeSgpKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQ29yZUV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHdvcmxkO1xuICAgICAgfVxuICAgIH1cbiAgKSxcblxuICBuZXcgQ29tbWFuZDx7IGFkZHJlc3M6IEFkZHJlc3NWOyBhbW91bnQ6IE51bWJlclYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBTZW5kXG5cbiAgICAgICogXCJTZW5kIDxBZGRyZXNzPiA8QW1vdW50PlwiIC0gU2VuZHMgYSBnaXZlbiBhbW91bnQgb2YgZXRoIHRvIGdpdmVuIGFkZHJlc3NcbiAgICAgICAgKiBFLmcuIFwiU2VuZCBjRVRIIDAuNWUxOFwiXG4gICAgYCxcbiAgICAnU2VuZCcsXG4gICAgW25ldyBBcmcoJ2FkZHJlc3MnLCBnZXRBZGRyZXNzViksIG5ldyBBcmcoJ2Ftb3VudCcsIGdldE51bWJlclYpXSxcbiAgICAod29ybGQsIGZyb20sIHsgYWRkcmVzcywgYW1vdW50IH0pID0+IHNlbmRFdGhlcih3b3JsZCwgZnJvbSwgYWRkcmVzcy52YWwsIGFtb3VudC5lbmNvZGUoKSlcbiAgKSxcblxuICBuZXcgQ29tbWFuZDx7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBVbml0cm9sbGVyXG5cbiAgICAgICogXCJVbml0cm9sbGVyIC4uLmV2ZW50XCIgLSBSdW5zIGdpdmVuIFVuaXRyb2xsZXIgZXZlbnRcbiAgICAgICAgKiBFLmcuIFwiVW5pdHJvbGxlciBTZXRQZW5kaW5nSW1wbCBNeUNvbXB0cm9sbGVySW1wbFwiXG4gICAgYCxcbiAgICAnVW5pdHJvbGxlcicsXG4gICAgW25ldyBBcmcoJ2V2ZW50JywgZ2V0RXZlbnRWLCB7IHZhcmlhZGljOiB0cnVlIH0pXSxcbiAgICAod29ybGQsIGZyb20sIHsgZXZlbnQgfSkgPT4gcHJvY2Vzc1VuaXRyb2xsZXJFdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKSxcbiAgICB7IHN1YkV4cHJlc3Npb25zOiB1bml0cm9sbGVyQ29tbWFuZHMoKSB9XG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgQ29tcHRyb2xsZXJcblxuICAgICAgKiBcIkNvbXB0cm9sbGVyIC4uLmV2ZW50XCIgLSBSdW5zIGdpdmVuIENvbXB0cm9sbGVyIGV2ZW50XG4gICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVyIF9zZXRSZXNlcnZlRmFjdG9yIDAuNVwiXG4gICAgYCxcbiAgICAnQ29tcHRyb2xsZXInLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHByb2Nlc3NDb21wdHJvbGxlckV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pLFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IGNvbXB0cm9sbGVyQ29tbWFuZHMoKSB9XG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgQ29tcHRyb2xsZXJJbXBsXG5cbiAgICAgICogXCJDb21wdHJvbGxlckltcGwgLi4uZXZlbnRcIiAtIFJ1bnMgZ2l2ZW4gQ29tcHRyb2xsZXJJbXBsIGV2ZW50XG4gICAgICAgICogRS5nLiBcIkNvbXB0cm9sbGVySW1wbCBNeUltcGwgQmVjb21lXCJcbiAgICBgLFxuICAgICdDb21wdHJvbGxlckltcGwnLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHByb2Nlc3NDb21wdHJvbGxlckltcGxFdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKSxcbiAgICB7IHN1YkV4cHJlc3Npb25zOiBjb21wdHJvbGxlckltcGxDb21tYW5kcygpIH1cbiAgKSxcblxuICBuZXcgQ29tbWFuZDx7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBDVG9rZW5cblxuICAgICAgKiBcIkNUb2tlbiAuLi5ldmVudFwiIC0gUnVucyBnaXZlbiBDVG9rZW4gZXZlbnRcbiAgICAgICAgKiBFLmcuIFwiQ1Rva2VuIGNaUlggTWludCA1ZTE4XCJcbiAgICBgLFxuICAgICdDVG9rZW4nLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHByb2Nlc3NDVG9rZW5FdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKSxcbiAgICB7IHN1YkV4cHJlc3Npb25zOiBjVG9rZW5Db21tYW5kcygpIH1cbiAgKSxcblxuICBuZXcgQ29tbWFuZDx7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBDVG9rZW5EZWxlZ2F0ZVxuXG4gICAgICAqIFwiQ1Rva2VuRGVsZWdhdGUgLi4uZXZlbnRcIiAtIFJ1bnMgZ2l2ZW4gQ1Rva2VuRGVsZWdhdGUgZXZlbnRcbiAgICAgICAgKiBFLmcuIFwiQ1Rva2VuRGVsZWdhdGUgRGVwbG95IENEYWlEZWxlZ2F0ZSBjRGFpRGVsZWdhdGVcIlxuICAgIGAsXG4gICAgJ0NUb2tlbkRlbGVnYXRlJyxcbiAgICBbbmV3IEFyZygnZXZlbnQnLCBnZXRFdmVudFYsIHsgdmFyaWFkaWM6IHRydWUgfSldLFxuICAgICh3b3JsZCwgZnJvbSwgeyBldmVudCB9KSA9PiBwcm9jZXNzQ1Rva2VuRGVsZWdhdGVFdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKSxcbiAgICB7IHN1YkV4cHJlc3Npb25zOiBjVG9rZW5EZWxlZ2F0ZUNvbW1hbmRzKCkgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgZXZlbnQ6IEV2ZW50ViB9PihcbiAgICBgXG4gICAgICAjIyMjIEVyYzIwXG5cbiAgICAgICogXCJFcmMyMCAuLi5ldmVudFwiIC0gUnVucyBnaXZlbiBFcmMyMCBldmVudFxuICAgICAgICAqIEUuZy4gXCJFcmMyMCBaUlggRmFjdWV0IEdlb2ZmIDVlMThcIlxuICAgIGAsXG4gICAgJ0VyYzIwJyxcbiAgICBbbmV3IEFyZygnZXZlbnQnLCBnZXRFdmVudFYsIHsgdmFyaWFkaWM6IHRydWUgfSldLFxuICAgICh3b3JsZCwgZnJvbSwgeyBldmVudCB9KSA9PiBwcm9jZXNzRXJjMjBFdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKSxcbiAgICB7IHN1YkV4cHJlc3Npb25zOiBlcmMyMENvbW1hbmRzKCkgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgZXZlbnQ6IEV2ZW50ViB9PihcbiAgICBgXG4gICAgICAjIyMjIEludGVyZXN0UmF0ZU1vZGVsXG5cbiAgICAgICogXCJJbnRlcmVzdFJhdGVNb2RlbCAuLi5ldmVudFwiIC0gUnVucyBnaXZlbiBpbnRlcmVzdCByYXRlIG1vZGVsIGV2ZW50XG4gICAgICAgICogRS5nLiBcIkludGVyZXN0UmF0ZU1vZGVsIERlcGxveSBGaXhlZCBTdGRSYXRlIDAuNVwiXG4gICAgYCxcbiAgICAnSW50ZXJlc3RSYXRlTW9kZWwnLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHByb2Nlc3NJbnRlcmVzdFJhdGVNb2RlbEV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pLFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IGludGVyZXN0UmF0ZU1vZGVsQ29tbWFuZHMoKSB9XG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgUHJpY2VPcmFjbGVcblxuICAgICAgKiBcIlByaWNlT3JhY2xlIC4uLmV2ZW50XCIgLSBSdW5zIGdpdmVuIFByaWNlIE9yYWNsZSBldmVudFxuICAgICAgICAqIEUuZy4gXCJQcmljZU9yYWNsZSBTZXRQcmljZSBjWlJYIDEuNVwiXG4gICAgYCxcbiAgICAnUHJpY2VPcmFjbGUnLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHByb2Nlc3NQcmljZU9yYWNsZUV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pLFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IHByaWNlT3JhY2xlQ29tbWFuZHMoKSB9XG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgUHJpY2VPcmFjbGVQcm94eVxuXG4gICAgICAqIFwiUHJpY2VPcmFjbGVQcm94eSAuLi5ldmVudFwiIC0gUnVucyBnaXZlbiBQcmljZSBPcmFjbGUgZXZlbnRcbiAgICAgICogRS5nLiBcIlByaWNlT3JhY2xlUHJveHkgRGVwbG95IChVbml0cm9sbGVyIEFkZHJlc3MpIChQcmljZU9yYWNsZSBBZGRyZXNzKSAoQ1Rva2VuIGNFVEggQWRkcmVzcylcIlxuICAgIGAsXG4gICAgJ1ByaWNlT3JhY2xlUHJveHknLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHtcbiAgICAgIHJldHVybiBwcm9jZXNzUHJpY2VPcmFjbGVQcm94eUV2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pO1xuICAgIH0sXG4gICAgeyBzdWJFeHByZXNzaW9uczogcHJpY2VPcmFjbGVQcm94eUNvbW1hbmRzKCkgfVxuICApLFxuXG4gIG5ldyBDb21tYW5kPHsgZXZlbnQ6IEV2ZW50ViB9PihcbiAgICBgXG4gICAgICAjIyMjIE1heGltaWxsaW9uXG5cbiAgICAgICogXCJNYXhpbWlsbGlvbiAuLi5ldmVudFwiIC0gUnVucyBnaXZlbiBNYXhpbWlsbGlvbiBldmVudFxuICAgICAgKiBFLmcuIFwiTWF4aW1pbGxpb24gRGVwbG95IChDVG9rZW4gY0VUSCBBZGRyZXNzKVwiXG4gICAgYCxcbiAgICAnTWF4aW1pbGxpb24nLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHtcbiAgICAgIHJldHVybiBwcm9jZXNzTWF4aW1pbGxpb25FdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKTtcbiAgICB9LFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IG1heGltaWxsaW9uQ29tbWFuZHMoKSB9XG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgVGltZWxvY2tcblxuICAgICAgKiBcIlRpbWVsb2NrIC4uLmV2ZW50XCIgLSBSdW5zIGdpdmVuIFRpbWVsb2NrIGV2ZW50XG4gICAgICAqIEUuZy4gXCJUaW1lbG9jayBEZXBsb3kgR2VvZmYgNjA0ODAwXCJcbiAgICBgLFxuICAgICdUaW1lbG9jaycsXG4gICAgW25ldyBBcmcoJ2V2ZW50JywgZ2V0RXZlbnRWLCB7IHZhcmlhZGljOiB0cnVlIH0pXSxcbiAgICAod29ybGQsIGZyb20sIHsgZXZlbnQgfSkgPT4ge1xuICAgICAgcmV0dXJuIHByb2Nlc3NUaW1lbG9ja0V2ZW50KHdvcmxkLCBldmVudC52YWwsIGZyb20pO1xuICAgIH0sXG4gICAgeyBzdWJFeHByZXNzaW9uczogdGltZWxvY2tDb21tYW5kcygpIH1cbiAgKSxcblxuICBuZXcgQ29tbWFuZDx7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBDb21wXG5cbiAgICAgICogXCJDb21wIC4uLmV2ZW50XCIgLSBSdW5zIGdpdmVuIGNvbXAgZXZlbnRcbiAgICAgICogRS5nLiBcIkNvbXAgRGVwbG95XCJcbiAgICBgLFxuICAgICdDb21wJyxcbiAgICBbbmV3IEFyZygnZXZlbnQnLCBnZXRFdmVudFYsIHsgdmFyaWFkaWM6IHRydWUgfSldLFxuICAgICh3b3JsZCwgZnJvbSwgeyBldmVudCB9KSA9PiB7XG4gICAgICByZXR1cm4gcHJvY2Vzc0NvbXBFdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKTtcbiAgICB9LFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IGNvbXBDb21tYW5kcygpIH1cbiAgKSxcblxuICBuZXcgQ29tbWFuZDx7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBHb3Zlcm5vclxuXG4gICAgICAqIFwiR292ZXJub3IgLi4uZXZlbnRcIiAtIFJ1bnMgZ2l2ZW4gZ292ZXJub3IgZXZlbnRcbiAgICAgICogRS5nLiBcIkdvdmVybm9yIERlcGxveSBBbHBoYVwiXG4gICAgYCxcbiAgICAnR292ZXJub3InLFxuICAgIFtuZXcgQXJnKCdldmVudCcsIGdldEV2ZW50ViwgeyB2YXJpYWRpYzogdHJ1ZSB9KV0sXG4gICAgKHdvcmxkLCBmcm9tLCB7IGV2ZW50IH0pID0+IHtcbiAgICAgIHJldHVybiBwcm9jZXNzR292ZXJub3JFdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKTtcbiAgICB9LFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IGdvdmVybm9yQ29tbWFuZHMoKSB9XG4gICksXG5cbiAgbmV3IENvbW1hbmQ8eyBldmVudDogRXZlbnRWIH0+KFxuICAgIGBcbiAgICAgICMjIyMgR292ZXJub3JCcmF2b1xuXG4gICAgICAqIFwiR292ZXJub3JCcmF2byAuLi5ldmVudFwiIC0gUnVucyBnaXZlbiBnb3Zlcm5vckJyYXZvIGV2ZW50XG4gICAgICAqIEUuZy4gXCJHb3Zlcm5vckJyYXZvIERlcGxveSBCcmF2b0RlbGVnYXRlXCJcbiAgICBgLFxuICAgICdHb3Zlcm5vckJyYXZvJyxcbiAgICBbbmV3IEFyZygnZXZlbnQnLCBnZXRFdmVudFYsIHsgdmFyaWFkaWM6IHRydWUgfSldLFxuICAgICh3b3JsZCwgZnJvbSwgeyBldmVudCB9KSA9PiB7XG4gICAgICByZXR1cm4gcHJvY2Vzc0dvdmVybm9yQnJhdm9FdmVudCh3b3JsZCwgZXZlbnQudmFsLCBmcm9tKTtcbiAgICB9LFxuICAgIHsgc3ViRXhwcmVzc2lvbnM6IGdvdmVybm9yQnJhdm9Db21tYW5kcygpIH1cbiAgKSxcblxuICBidWlsZENvbnRyYWN0RXZlbnQ8Q291bnRlcj4oXCJDb3VudGVyXCIsIGZhbHNlKSxcbiAgYnVpbGRDb250cmFjdEV2ZW50PENvbXBvdW5kTGVucz4oXCJDb21wb3VuZExlbnNcIiwgZmFsc2UpLFxuICBidWlsZENvbnRyYWN0RXZlbnQ8UmVzZXJ2b2lyPihcIlJlc2Vydm9pclwiLCB0cnVlKSxcblxuICBuZXcgVmlldzx7IGV2ZW50OiBFdmVudFYgfT4oXG4gICAgYFxuICAgICAgIyMjIyBIZWxwXG5cbiAgICAgICogXCJIZWxwIC4uLmV2ZW50XCIgLSBQcmludHMgaGVscCBmb3IgZ2l2ZW4gY29tbWFuZFxuICAgICAgKiBFLmcuIFwiSGVscCBGcm9tXCJcbiAgICBgLFxuICAgICdIZWxwJyxcbiAgICBbbmV3IEFyZygnZXZlbnQnLCBnZXRFdmVudFYsIHsgdmFyaWFkaWM6IHRydWUgfSldLFxuICAgIGFzeW5jICh3b3JsZCwgeyBldmVudCB9KSA9PiB7XG4gICAgICB3b3JsZC5wcmludGVyLnByaW50TGluZSgnJyk7XG4gICAgICBsZXQgeyBjb21tYW5kcyB9ID0gYXdhaXQgZ2V0Q29tbWFuZHMod29ybGQpO1xuICAgICAgcHJpbnRIZWxwKHdvcmxkLnByaW50ZXIsIGV2ZW50LnZhbCwgY29tbWFuZHMpO1xuXG4gICAgICByZXR1cm4gd29ybGQ7XG4gICAgfVxuICApXG5dO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRDb21tYW5kcyh3b3JsZDogV29ybGQpIHtcbiAgaWYgKHdvcmxkLmNvbW1hbmRzKSB7XG4gICAgcmV0dXJuIHsgd29ybGQsIGNvbW1hbmRzOiB3b3JsZC5jb21tYW5kcyB9O1xuICB9XG5cbiAgbGV0IGFsbENvbW1hbmRzID0gYXdhaXQgUHJvbWlzZS5hbGwoY29tbWFuZHMubWFwKChjb21tYW5kKSA9PiB7XG4gICAgaWYgKHR5cGVvZiAoY29tbWFuZCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBjb21tYW5kKHdvcmxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjb21tYW5kKTtcbiAgICB9XG4gIH0pKTtcblxuICByZXR1cm4geyB3b3JsZDogd29ybGQuc2V0KCdjb21tYW5kcycsIGFsbENvbW1hbmRzKSwgY29tbWFuZHM6IGFsbENvbW1hbmRzIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzQ29yZUV2ZW50KHdvcmxkOiBXb3JsZCwgZXZlbnQ6IEV2ZW50LCBmcm9tOiBzdHJpbmcgfCBudWxsKTogUHJvbWlzZTxXb3JsZD4ge1xuICBsZXQgeyB3b3JsZDogbmV4dFdvcmxkLCBjb21tYW5kcyB9ID0gYXdhaXQgZ2V0Q29tbWFuZHMod29ybGQpO1xuICByZXR1cm4gYXdhaXQgcHJvY2Vzc0NvbW1hbmRFdmVudDxhbnk+KCdDb3JlJywgY29tbWFuZHMsIG5leHRXb3JsZCwgZXZlbnQsIGZyb20pO1xufVxuIl19
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompValue = exports.compFetchers = void 0;
const CoreValue_1 = require("../CoreValue");
const Value_1 = require("../Value");
const Command_1 = require("../Command");
const ContractLookup_1 = require("../ContractLookup");
function compFetchers() {
    return [
        new Command_1.Fetcher(`
        #### Address

        * "<Comp> Address" - Returns the address of Comp token
          * E.g. "Comp Address"
      `, "Address", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true })
        ], async (world, { comp }) => new Value_1.AddressV(comp._address)),
        new Command_1.Fetcher(`
        #### Name

        * "<Comp> Name" - Returns the name of the Comp token
          * E.g. "Comp Name"
      `, "Name", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true })
        ], async (world, { comp }) => new Value_1.StringV(await comp.methods.name().call())),
        new Command_1.Fetcher(`
        #### Symbol

        * "<Comp> Symbol" - Returns the symbol of the Comp token
          * E.g. "Comp Symbol"
      `, "Symbol", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true })
        ], async (world, { comp }) => new Value_1.StringV(await comp.methods.symbol().call())),
        new Command_1.Fetcher(`
        #### Decimals

        * "<Comp> Decimals" - Returns the number of decimals of the Comp token
          * E.g. "Comp Decimals"
      `, "Decimals", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true })
        ], async (world, { comp }) => new Value_1.NumberV(await comp.methods.decimals().call())),
        new Command_1.Fetcher(`
        #### TotalSupply

        * "Comp TotalSupply" - Returns Comp token's total supply
      `, "TotalSupply", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true })
        ], async (world, { comp }) => new Value_1.NumberV(await comp.methods.totalSupply().call())),
        new Command_1.Fetcher(`
        #### TokenBalance

        * "Comp TokenBalance <Address>" - Returns the Comp token balance of a given address
          * E.g. "Comp TokenBalance Geoff" - Returns Geoff's Comp balance
      `, "TokenBalance", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true }),
            new Command_1.Arg("address", CoreValue_1.getAddressV)
        ], async (world, { comp, address }) => new Value_1.NumberV(await comp.methods.balanceOf(address.val).call())),
        new Command_1.Fetcher(`
        #### Allowance

        * "Comp Allowance owner:<Address> spender:<Address>" - Returns the Comp allowance from owner to spender
          * E.g. "Comp Allowance Geoff Torrey" - Returns the Comp allowance of Geoff to Torrey
      `, "Allowance", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true }),
            new Command_1.Arg("owner", CoreValue_1.getAddressV),
            new Command_1.Arg("spender", CoreValue_1.getAddressV)
        ], async (world, { comp, owner, spender }) => new Value_1.NumberV(await comp.methods.allowance(owner.val, spender.val).call())),
        new Command_1.Fetcher(`
        #### GetCurrentVotes

        * "Comp GetCurrentVotes account:<Address>" - Returns the current Comp votes balance for an account
          * E.g. "Comp GetCurrentVotes Geoff" - Returns the current Comp vote balance of Geoff
      `, "GetCurrentVotes", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { comp, account }) => new Value_1.NumberV(await comp.methods.getCurrentVotes(account.val).call())),
        new Command_1.Fetcher(`
        #### GetPriorVotes

        * "Comp GetPriorVotes account:<Address> blockBumber:<Number>" - Returns the current Comp votes balance at given block
          * E.g. "Comp GetPriorVotes Geoff 5" - Returns the Comp vote balance for Geoff at block 5
      `, "GetPriorVotes", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
            new Command_1.Arg("blockNumber", CoreValue_1.getNumberV),
        ], async (world, { comp, account, blockNumber }) => new Value_1.NumberV(await comp.methods.getPriorVotes(account.val, blockNumber.encode()).call())),
        new Command_1.Fetcher(`
        #### GetCurrentVotesBlock

        * "Comp GetCurrentVotesBlock account:<Address>" - Returns the current Comp votes checkpoint block for an account
          * E.g. "Comp GetCurrentVotesBlock Geoff" - Returns the current Comp votes checkpoint block for Geoff
      `, "GetCurrentVotesBlock", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { comp, account }) => {
            const numCheckpoints = Number(await comp.methods.numCheckpoints(account.val).call());
            const checkpoint = await comp.methods.checkpoints(account.val, numCheckpoints - 1).call();
            return new Value_1.NumberV(checkpoint.fromBlock);
        }),
        new Command_1.Fetcher(`
        #### VotesLength

        * "Comp VotesLength account:<Address>" - Returns the Comp vote checkpoint array length
          * E.g. "Comp VotesLength Geoff" - Returns the Comp vote checkpoint array length of Geoff
      `, "VotesLength", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { comp, account }) => new Value_1.NumberV(await comp.methods.numCheckpoints(account.val).call())),
        new Command_1.Fetcher(`
        #### AllVotes

        * "Comp AllVotes account:<Address>" - Returns information about all votes an account has had
          * E.g. "Comp AllVotes Geoff" - Returns the Comp vote checkpoint array
      `, "AllVotes", [
            new Command_1.Arg("comp", ContractLookup_1.getComp, { implicit: true }),
            new Command_1.Arg("account", CoreValue_1.getAddressV),
        ], async (world, { comp, account }) => {
            const numCheckpoints = Number(await comp.methods.numCheckpoints(account.val).call());
            const checkpoints = await Promise.all(new Array(numCheckpoints).fill(undefined).map(async (_, i) => {
                const { fromBlock, votes } = await comp.methods.checkpoints(account.val, i).call();
                return new Value_1.StringV(`Block ${fromBlock}: ${votes} vote${votes !== 1 ? "s" : ""}`);
            }));
            return new Value_1.ListV(checkpoints);
        })
    ];
}
exports.compFetchers = compFetchers;
async function getCompValue(world, event) {
    return await Command_1.getFetcherValue("Comp", compFetchers(), world, event);
}
exports.getCompValue = getCompValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcFZhbHVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1ZhbHVlL0NvbXBWYWx1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSw0Q0FHc0I7QUFDdEIsb0NBTWtCO0FBQ2xCLHdDQUEyRDtBQUMzRCxzREFBNEM7QUFFNUMsU0FBZ0IsWUFBWTtJQUMxQixPQUFPO1FBQ0wsSUFBSSxpQkFBTyxDQUEyQjs7Ozs7T0FLbkMsRUFDRCxTQUFTLEVBQ1Q7WUFDRSxJQUFJLGFBQUcsQ0FBQyxNQUFNLEVBQUUsd0JBQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUM3QyxFQUNELEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FDdkQ7UUFFRCxJQUFJLGlCQUFPLENBQTBCOzs7OztPQUtsQyxFQUNELE1BQU0sRUFDTjtZQUNFLElBQUksYUFBRyxDQUFDLE1BQU0sRUFBRSx3QkFBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQzdDLEVBQ0QsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGVBQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FDekU7UUFFRCxJQUFJLGlCQUFPLENBQTBCOzs7OztPQUtsQyxFQUNELFFBQVEsRUFDUjtZQUNFLElBQUksYUFBRyxDQUFDLE1BQU0sRUFBRSx3QkFBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQzdDLEVBQ0QsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGVBQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxF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QyxDQUFDO1lBRUosT0FBTyxJQUFJLGFBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQ0Y7S0FDRixDQUFDO0FBQ0osQ0FBQztBQXBMRCxvQ0FvTEM7QUFFTSxLQUFLLFVBQVUsWUFBWSxDQUFDLEtBQVksRUFBRSxLQUFZO0lBQzNELE9BQU8sTUFBTSx5QkFBZSxDQUFXLE1BQU0sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUZELG9DQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnQgfSBmcm9tICcuLi9FdmVudCc7XG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7IENvbXAgfSBmcm9tICcuLi9Db250cmFjdC9Db21wJztcbmltcG9ydCB7XG4gIGdldEFkZHJlc3NWLFxuICBnZXROdW1iZXJWXG59IGZyb20gJy4uL0NvcmVWYWx1ZSc7XG5pbXBvcnQge1xuICBBZGRyZXNzVixcbiAgTGlzdFYsXG4gIE51bWJlclYsXG4gIFN0cmluZ1YsXG4gIFZhbHVlXG59IGZyb20gJy4uL1ZhbHVlJztcbmltcG9ydCB7IEFyZywgRmV0Y2hlciwgZ2V0RmV0Y2hlclZhbHVlIH0gZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgeyBnZXRDb21wIH0gZnJvbSAnLi4vQ29udHJhY3RMb29rdXAnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcEZldGNoZXJzKCkge1xuICByZXR1cm4gW1xuICAgIG5ldyBGZXRjaGVyPHsgY29tcDogQ29tcCB9LCBBZGRyZXNzVj4oYFxuICAgICAgICAjIyMjIEFkZHJlc3NcblxuICAgICAgICAqIFwiPENvbXA+IEFkZHJlc3NcIiAtIFJldHVybnMgdGhlIGFkZHJlc3Mgb2YgQ29tcCB0b2tlblxuICAgICAgICAgICogRS5nLiBcIkNvbXAgQWRkcmVzc1wiXG4gICAgICBgLFxuICAgICAgXCJBZGRyZXNzXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wXCIsIGdldENvbXAsIHsgaW1wbGljaXQ6IHRydWUgfSlcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgY29tcCB9KSA9PiBuZXcgQWRkcmVzc1YoY29tcC5fYWRkcmVzcylcbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBjb21wOiBDb21wIH0sIFN0cmluZ1Y+KGBcbiAgICAgICAgIyMjIyBOYW1lXG5cbiAgICAgICAgKiBcIjxDb21wPiBOYW1lXCIgLSBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBDb21wIHRva2VuXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcCBOYW1lXCJcbiAgICAgIGAsXG4gICAgICBcIk5hbWVcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXBcIiwgZ2V0Q29tcCwgeyBpbXBsaWNpdDogdHJ1ZSB9KVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBjb21wIH0pID0+IG5ldyBTdHJpbmdWKGF3YWl0IGNvbXAubWV0aG9kcy5uYW1lKCkuY2FsbCgpKVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7IGNvbXA6IENvbXAgfSwgU3RyaW5nVj4oYFxuICAgICAgICAjIyMjIFN5bWJvbFxuXG4gICAgICAgICogXCI8Q29tcD4gU3ltYm9sXCIgLSBSZXR1cm5zIHRoZSBzeW1ib2wgb2YgdGhlIENvbXAgdG9rZW5cbiAgICAgICAgICAqIEUuZy4gXCJDb21wIFN5bWJvbFwiXG4gICAgICBgLFxuICAgICAgXCJTeW1ib2xcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXBcIiwgZ2V0Q29tcCwgeyBpbXBsaWNpdDogdHJ1ZSB9KVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBjb21wIH0pID0+IG5ldyBTdHJpbmdWKGF3YWl0IGNvbXAubWV0aG9kcy5zeW1ib2woKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgY29tcDogQ29tcCB9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgRGVjaW1hbHNcblxuICAgICAgICAqIFwiPENvbXA+IERlY2ltYWxzXCIgLSBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZGVjaW1hbHMgb2YgdGhlIENvbXAgdG9rZW5cbiAgICAgICAgICAqIEUuZy4gXCJDb21wIERlY2ltYWxzXCJcbiAgICAgIGAsXG4gICAgICBcIkRlY2ltYWxzXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wXCIsIGdldENvbXAsIHsgaW1wbGljaXQ6IHRydWUgfSlcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgY29tcCB9KSA9PiBuZXcgTnVtYmVyVihhd2FpdCBjb21wLm1ldGhvZHMuZGVjaW1hbHMoKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgY29tcDogQ29tcCB9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgVG90YWxTdXBwbHlcblxuICAgICAgICAqIFwiQ29tcCBUb3RhbFN1cHBseVwiIC0gUmV0dXJucyBDb21wIHRva2VuJ3MgdG90YWwgc3VwcGx5XG4gICAgICBgLFxuICAgICAgXCJUb3RhbFN1cHBseVwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcFwiLCBnZXRDb21wLCB7IGltcGxpY2l0OiB0cnVlIH0pXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IGNvbXAgfSkgPT4gbmV3IE51bWJlclYoYXdhaXQgY29tcC5tZXRob2RzLnRvdGFsU3VwcGx5KCkuY2FsbCgpKVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7IGNvbXA6IENvbXAsIGFkZHJlc3M6IEFkZHJlc3NWIH0sIE51bWJlclY+KGBcbiAgICAgICAgIyMjIyBUb2tlbkJhbGFuY2VcblxuICAgICAgICAqIFwiQ29tcCBUb2tlbkJhbGFuY2UgPEFkZHJlc3M+XCIgLSBSZXR1cm5zIHRoZSBDb21wIHRva2VuIGJhbGFuY2Ugb2YgYSBnaXZlbiBhZGRyZXNzXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcCBUb2tlbkJhbGFuY2UgR2VvZmZcIiAtIFJldHVybnMgR2VvZmYncyBDb21wIGJhbGFuY2VcbiAgICAgIGAsXG4gICAgICBcIlRva2VuQmFsYW5jZVwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcFwiLCBnZXRDb21wLCB7IGltcGxpY2l0OiB0cnVlIH0pLFxuICAgICAgICBuZXcgQXJnKFwiYWRkcmVzc1wiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgY29tcCwgYWRkcmVzcyB9KSA9PiBuZXcgTnVtYmVyVihhd2FpdCBjb21wLm1ldGhvZHMuYmFsYW5jZU9mKGFkZHJlc3MudmFsKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgY29tcDogQ29tcCwgb3duZXI6IEFkZHJlc3NWLCBzcGVuZGVyOiBBZGRyZXNzViB9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgQWxsb3dhbmNlXG5cbiAgICAgICAgKiBcIkNvbXAgQWxsb3dhbmNlIG93bmVyOjxBZGRyZXNzPiBzcGVuZGVyOjxBZGRyZXNzPlwiIC0gUmV0dXJucyB0aGUgQ29tcCBhbGxvd2FuY2UgZnJvbSBvd25lciB0byBzcGVuZGVyXG4gICAgICAgICAgKiBFLmcuIFwiQ29tcCBBbGxvd2FuY2UgR2VvZmYgVG9ycmV5XCIgLSBSZXR1cm5zIHRoZSBDb21wIGFsbG93YW5jZSBvZiBHZW9mZiB0byBUb3JyZXlcbiAgICAgIGAsXG4gICAgICBcIkFsbG93YW5jZVwiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcFwiLCBnZXRDb21wLCB7IGltcGxpY2l0OiB0cnVlIH0pLFxuICAgICAgICBuZXcgQXJnKFwib3duZXJcIiwgZ2V0QWRkcmVzc1YpLFxuICAgICAgICBuZXcgQXJnKFwic3BlbmRlclwiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgY29tcCwgb3duZXIsIHNwZW5kZXIgfSkgPT4gbmV3IE51bWJlclYoYXdhaXQgY29tcC5tZXRob2RzLmFsbG93YW5jZShvd25lci52YWwsIHNwZW5kZXIudmFsKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgY29tcDogQ29tcCwgYWNjb3VudDogQWRkcmVzc1YgfSwgTnVtYmVyVj4oYFxuICAgICAgICAjIyMjIEdldEN1cnJlbnRWb3Rlc1xuXG4gICAgICAgICogXCJDb21wIEdldEN1cnJlbnRWb3RlcyBhY2NvdW50OjxBZGRyZXNzPlwiIC0gUmV0dXJucyB0aGUgY3VycmVudCBDb21wIHZvdGVzIGJhbGFuY2UgZm9yIGFuIGFjY291bnRcbiAgICAgICAgICAqIEUuZy4gXCJDb21wIEdldEN1cnJlbnRWb3RlcyBHZW9mZlwiIC0gUmV0dXJucyB0aGUgY3VycmVudCBDb21wIHZvdGUgYmFsYW5jZSBvZiBHZW9mZlxuICAgICAgYCxcbiAgICAgIFwiR2V0Q3VycmVudFZvdGVzXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wXCIsIGdldENvbXAsIHsgaW1wbGljaXQ6IHRydWUgfSksXG4gICAgICAgIG5ldyBBcmcoXCJhY2NvdW50XCIsIGdldEFkZHJlc3NWKSxcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgY29tcCwgYWNjb3VudCB9KSA9PiBuZXcgTnVtYmVyVihhd2FpdCBjb21wLm1ldGhvZHMuZ2V0Q3VycmVudFZvdGVzKGFjY291bnQudmFsKS5jYWxsKCkpXG4gICAgKSxcblxuICAgIG5ldyBGZXRjaGVyPHsgY29tcDogQ29tcCwgYWNjb3VudDogQWRkcmVzc1YsIGJsb2NrTnVtYmVyOiBOdW1iZXJWIH0sIE51bWJlclY+KGBcbiAgICAgICAgIyMjIyBHZXRQcmlvclZvdGVzXG5cbiAgICAgICAgKiBcIkNvbXAgR2V0UHJpb3JWb3RlcyBhY2NvdW50OjxBZGRyZXNzPiBibG9ja0J1bWJlcjo8TnVtYmVyPlwiIC0gUmV0dXJucyB0aGUgY3VycmVudCBDb21wIHZvdGVzIGJhbGFuY2UgYXQgZ2l2ZW4gYmxvY2tcbiAgICAgICAgICAqIEUuZy4gXCJDb21wIEdldFByaW9yVm90ZXMgR2VvZmYgNVwiIC0gUmV0dXJucyB0aGUgQ29tcCB2b3RlIGJhbGFuY2UgZm9yIEdlb2ZmIGF0IGJsb2NrIDVcbiAgICAgIGAsXG4gICAgICBcIkdldFByaW9yVm90ZXNcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXBcIiwgZ2V0Q29tcCwgeyBpbXBsaWNpdDogdHJ1ZSB9KSxcbiAgICAgICAgbmV3IEFyZyhcImFjY291bnRcIiwgZ2V0QWRkcmVzc1YpLFxuICAgICAgICBuZXcgQXJnKFwiYmxvY2tOdW1iZXJcIiwgZ2V0TnVtYmVyViksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IGNvbXAsIGFjY291bnQsIGJsb2NrTnVtYmVyIH0pID0+IG5ldyBOdW1iZXJWKGF3YWl0IGNvbXAubWV0aG9kcy5nZXRQcmlvclZvdGVzKGFjY291bnQudmFsLCBibG9ja051bWJlci5lbmNvZGUoKSkuY2FsbCgpKVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7IGNvbXA6IENvbXAsIGFjY291bnQ6IEFkZHJlc3NWIH0sIE51bWJlclY+KGBcbiAgICAgICAgIyMjIyBHZXRDdXJyZW50Vm90ZXNCbG9ja1xuXG4gICAgICAgICogXCJDb21wIEdldEN1cnJlbnRWb3Rlc0Jsb2NrIGFjY291bnQ6PEFkZHJlc3M+XCIgLSBSZXR1cm5zIHRoZSBjdXJyZW50IENvbXAgdm90ZXMgY2hlY2twb2ludCBibG9jayBmb3IgYW4gYWNjb3VudFxuICAgICAgICAgICogRS5nLiBcIkNvbXAgR2V0Q3VycmVudFZvdGVzQmxvY2sgR2VvZmZcIiAtIFJldHVybnMgdGhlIGN1cnJlbnQgQ29tcCB2b3RlcyBjaGVja3BvaW50IGJsb2NrIGZvciBHZW9mZlxuICAgICAgYCxcbiAgICAgIFwiR2V0Q3VycmVudFZvdGVzQmxvY2tcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImNvbXBcIiwgZ2V0Q29tcCwgeyBpbXBsaWNpdDogdHJ1ZSB9KSxcbiAgICAgICAgbmV3IEFyZyhcImFjY291bnRcIiwgZ2V0QWRkcmVzc1YpLFxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBjb21wLCBhY2NvdW50IH0pID0+IHtcbiAgICAgICAgY29uc3QgbnVtQ2hlY2twb2ludHMgPSBOdW1iZXIoYXdhaXQgY29tcC5tZXRob2RzLm51bUNoZWNrcG9pbnRzKGFjY291bnQudmFsKS5jYWxsKCkpO1xuICAgICAgICBjb25zdCBjaGVja3BvaW50ID0gYXdhaXQgY29tcC5tZXRob2RzLmNoZWNrcG9pbnRzKGFjY291bnQudmFsLCBudW1DaGVja3BvaW50cyAtIDEpLmNhbGwoKTtcblxuICAgICAgICByZXR1cm4gbmV3IE51bWJlclYoY2hlY2twb2ludC5mcm9tQmxvY2spO1xuICAgICAgfVxuICAgICksXG5cbiAgICBuZXcgRmV0Y2hlcjx7IGNvbXA6IENvbXAsIGFjY291bnQ6IEFkZHJlc3NWIH0sIE51bWJlclY+KGBcbiAgICAgICAgIyMjIyBWb3Rlc0xlbmd0aFxuXG4gICAgICAgICogXCJDb21wIFZvdGVzTGVuZ3RoIGFjY291bnQ6PEFkZHJlc3M+XCIgLSBSZXR1cm5zIHRoZSBDb21wIHZvdGUgY2hlY2twb2ludCBhcnJheSBsZW5ndGhcbiAgICAgICAgICAqIEUuZy4gXCJDb21wIFZvdGVzTGVuZ3RoIEdlb2ZmXCIgLSBSZXR1cm5zIHRoZSBDb21wIHZvdGUgY2hlY2twb2ludCBhcnJheSBsZW5ndGggb2YgR2VvZmZcbiAgICAgIGAsXG4gICAgICBcIlZvdGVzTGVuZ3RoXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJjb21wXCIsIGdldENvbXAsIHsgaW1wbGljaXQ6IHRydWUgfSksXG4gICAgICAgIG5ldyBBcmcoXCJhY2NvdW50XCIsIGdldEFkZHJlc3NWKSxcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgY29tcCwgYWNjb3VudCB9KSA9PiBuZXcgTnVtYmVyVihhd2FpdCBjb21wLm1ldGhvZHMubnVtQ2hlY2twb2ludHMoYWNjb3VudC52YWwpLmNhbGwoKSlcbiAgICApLFxuXG4gICAgbmV3IEZldGNoZXI8eyBjb21wOiBDb21wLCBhY2NvdW50OiBBZGRyZXNzViB9LCBMaXN0Vj4oYFxuICAgICAgICAjIyMjIEFsbFZvdGVzXG5cbiAgICAgICAgKiBcIkNvbXAgQWxsVm90ZXMgYWNjb3VudDo8QWRkcmVzcz5cIiAtIFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYWxsIHZvdGVzIGFuIGFjY291bnQgaGFzIGhhZFxuICAgICAgICAgICogRS5nLiBcIkNvbXAgQWxsVm90ZXMgR2VvZmZcIiAtIFJldHVybnMgdGhlIENvbXAgdm90ZSBjaGVja3BvaW50IGFycmF5XG4gICAgICBgLFxuICAgICAgXCJBbGxWb3Rlc1wiLFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwiY29tcFwiLCBnZXRDb21wLCB7IGltcGxpY2l0OiB0cnVlIH0pLFxuICAgICAgICBuZXcgQXJnKFwiYWNjb3VudFwiLCBnZXRBZGRyZXNzViksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IGNvbXAsIGFjY291bnQgfSkgPT4ge1xuICAgICAgICBjb25zdCBudW1DaGVja3BvaW50cyA9IE51bWJlcihhd2FpdCBjb21wLm1ldGhvZHMubnVtQ2hlY2twb2ludHMoYWNjb3VudC52YWwpLmNhbGwoKSk7XG4gICAgICAgIGNvbnN0IGNoZWNrcG9pbnRzID0gYXdhaXQgUHJvbWlzZS5hbGwobmV3IEFycmF5KG51bUNoZWNrcG9pbnRzKS5maWxsKHVuZGVmaW5lZCkubWFwKGFzeW5jIChfLCBpKSA9PiB7XG4gICAgICAgICAgY29uc3Qge2Zyb21CbG9jaywgdm90ZXN9ID0gYXdhaXQgY29tcC5tZXRob2RzLmNoZWNrcG9pbnRzKGFjY291bnQudmFsLCBpKS5jYWxsKCk7XG5cbiAgICAgICAgICByZXR1cm4gbmV3IFN0cmluZ1YoYEJsb2NrICR7ZnJvbUJsb2NrfTogJHt2b3Rlc30gdm90ZSR7dm90ZXMgIT09IDEgPyBcInNcIiA6IFwiXCJ9YCk7XG4gICAgICAgIH0pKTtcblxuICAgICAgICByZXR1cm4gbmV3IExpc3RWKGNoZWNrcG9pbnRzKTtcbiAgICAgIH1cbiAgICApXG4gIF07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDb21wVmFsdWUod29ybGQ6IFdvcmxkLCBldmVudDogRXZlbnQpOiBQcm9taXNlPFZhbHVlPiB7XG4gIHJldHVybiBhd2FpdCBnZXRGZXRjaGVyVmFsdWU8YW55LCBhbnk+KFwiQ29tcFwiLCBjb21wRmV0Y2hlcnMoKSwgd29ybGQsIGV2ZW50KTtcbn1cbiJdfQ==
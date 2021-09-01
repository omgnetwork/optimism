"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProposalValue = exports.proposalFetchers = exports.getProposalId = void 0;
const Governor_1 = require("../Contract/Governor");
const ContractLookup_1 = require("../ContractLookup");
const CoreValue_1 = require("../CoreValue");
const Value_1 = require("../Value");
const Command_1 = require("../Command");
async function getProposalId(world, governor, proposalIdent) {
    if (typeof proposalIdent === 'string' && proposalIdent === 'LastProposal') {
        return Number(await governor.methods.proposalCount().call());
    }
    else if (Array.isArray(proposalIdent) && proposalIdent[0] === 'ActiveProposal' && typeof proposalIdent[1] === 'string') {
        let proposer = ContractLookup_1.getAddress(world, proposalIdent[1]);
        return Number(await governor.methods.latestProposalIds(proposer).call());
    }
    else {
        try {
            return (await CoreValue_1.getNumberV(world, proposalIdent)).toNumber();
        }
        catch (e) {
            throw new Error(`Unknown proposal identifier \`${proposalIdent}\`, expected Number or "LastProposal"`);
        }
    }
}
exports.getProposalId = getProposalId;
async function getProposal(world, governor, proposalIdent, getter) {
    return await getter(governor, new Value_1.NumberV(await getProposalId(world, governor, proposalIdent)).encode());
}
async function getProposalState(world, governor, proposalIdent) {
    const proposalId = await getProposalId(world, governor, proposalIdent);
    const stateEnum = await governor.methods.state(proposalId).call();
    return new Value_1.StringV(Governor_1.proposalStateEnums[stateEnum]);
}
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function proposalFetchers(governor) {
    const fields = {
        id: CoreValue_1.getNumberV,
        proposer: CoreValue_1.getAddressV,
        eta: CoreValue_1.getNumberV,
        targets: {
            constructor: CoreValue_1.getArrayV(CoreValue_1.getStringV),
            getter: async (governor, proposalId) => (await governor.methods.getActions(proposalId).call())[0]
        },
        values: {
            constructor: CoreValue_1.getArrayV(CoreValue_1.getNumberV),
            getter: async (governor, proposalId) => (await governor.methods.getActions(proposalId).call())[1]
        },
        signatures: {
            constructor: CoreValue_1.getArrayV(CoreValue_1.getStringV),
            getter: async (governor, proposalId) => (await governor.methods.getActions(proposalId).call())[2]
        },
        calldatas: {
            constructor: CoreValue_1.getArrayV(CoreValue_1.getStringV),
            getter: async (governor, proposalId) => (await governor.methods.getActions(proposalId).call())[3]
        },
        startBlock: CoreValue_1.getNumberV,
        endBlock: CoreValue_1.getNumberV,
        forVotes: CoreValue_1.getNumberV,
        againstVotes: CoreValue_1.getNumberV
    };
    const defaultedFields = Object.entries(fields).map(([field, values]) => {
        let givenValues;
        if (typeof values === 'object') {
            givenValues = values;
        }
        else {
            givenValues = {
                constructor: values
            };
        }
        ;
        return {
            field: field,
            event: capitalize(field.toString()),
            getter: async (governor, proposalId) => (await governor.methods.proposals(proposalId).call())[field],
            constructor: values,
            name: field.toString(),
            ...givenValues
        };
    });
    const baseFetchers = defaultedFields.map(({ field, constructor, event, name, getter }) => {
        return new Command_1.Fetcher(`
        #### ${event}

        * "Governor <Governor> Proposal <Proposal> ${event}" - Returns the ${name || field} of given proposal
          * E.g. "Governor GovernorScenario Proposal 5 ${event}"
          * E.g. "Governor GovernorScenario Proposal LastProposal ${event}"
      `, event, [
            new Command_1.Arg("proposalIdent", CoreValue_1.getEventV)
        ], async (world, { proposalIdent }) => await constructor(world, await getProposal(world, governor, proposalIdent.val, getter)), { namePos: 1 });
    });
    const otherFetchers = [
        new Command_1.Fetcher(`
        #### HasVoted

        * "Governor <Governor> Proposal <Proposal> HasVoted <voter>" - Returns true if the given address has voted on given proposal
          * E.g. "Governor GovernorScenario Proposal 5 HasVoted Geoff"
          * E.g. "Governor GovernorScenario Proposal LastProposal HasVoted Geoff"
      `, "HasVoted", [
            new Command_1.Arg("proposalIdent", CoreValue_1.getEventV),
            new Command_1.Arg("voter", CoreValue_1.getAddressV)
        ], async (world, { proposalIdent, voter }) => {
            const receipt = await governor.methods.getReceipt(await getProposalId(world, governor, proposalIdent.val), voter.val).call();
            return new Value_1.BoolV(receipt.hasVoted);
        }, { namePos: 1 }),
        new Command_1.Fetcher(`
        #### Supported

        * "Governor <Governor> Proposal <Proposal> Supported <voter>" - Returns true if the given address has voted on given proposal
          * E.g. "Governor GovernorScenario Proposal 5 Supported Geoff"
          * E.g. "Governor GovernorScenario Proposal LastProposal Supported Geoff"
      `, "Supported", [
            new Command_1.Arg("proposalIdent", CoreValue_1.getEventV),
            new Command_1.Arg("voter", CoreValue_1.getAddressV)
        ], async (world, { proposalIdent, voter }) => {
            const receipt = await governor.methods.getReceipt(await getProposalId(world, governor, proposalIdent.val), voter.val).call();
            return new Value_1.BoolV(receipt.support);
        }, { namePos: 1 }),
        new Command_1.Fetcher(`
        #### VotesCast

        * "Governor <Governor> Proposal <Proposal> VotesCast <voter>" - Returns true if the given address has voted on given proposal
          * E.g. "Governor GovernorScenario Proposal 5 VotesCast Geoff"
          * E.g. "Governor GovernorScenario Proposal LastProposal VotesCast Geoff"
      `, "VotesCast", [
            new Command_1.Arg("proposalIdent", CoreValue_1.getEventV),
            new Command_1.Arg("voter", CoreValue_1.getAddressV)
        ], async (world, { proposalIdent, voter }) => {
            const receipt = await governor.methods.getReceipt(await getProposalId(world, governor, proposalIdent.val), voter.val).call();
            return new Value_1.NumberV(receipt.votes);
        }, { namePos: 1 }),
        new Command_1.Fetcher(`
        #### State

        * "Governor <Governor> Proposal <Proposal> State" - Returns a string of a proposal's current state
          * E.g. "Governor GovernorScenario Proposal LastProposal State"
      `, "State", [
            new Command_1.Arg("proposalIdent", CoreValue_1.getEventV),
        ], async (world, { proposalIdent }) => {
            return await getProposalState(world, governor, proposalIdent.val);
        }, { namePos: 1 })
    ];
    return baseFetchers.concat(otherFetchers);
}
exports.proposalFetchers = proposalFetchers;
async function getProposalValue(world, governor, event) {
    return await Command_1.getFetcherValue("Proposal", proposalFetchers(governor), world, event);
}
exports.getProposalValue = getProposalValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvcG9zYWxWYWx1ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9WYWx1ZS9Qcm9wb3NhbFZhbHVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1EQUFvRTtBQUNwRSxzREFBK0M7QUFDL0MsNENBTXNCO0FBQ3RCLG9DQU9rQjtBQUNsQix3Q0FBMkQ7QUFHcEQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxLQUFZLEVBQUUsUUFBa0IsRUFBRSxhQUFvQjtJQUN4RixJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsSUFBSSxhQUFhLEtBQUssY0FBYyxFQUFFO1FBQ3pFLE9BQU8sTUFBTSxDQUFDLE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzlEO1NBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxnQkFBZ0IsSUFBSSxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7UUFDeEgsSUFBSSxRQUFRLEdBQUcsMkJBQVUsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkQsT0FBTyxNQUFNLENBQUMsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDMUU7U0FBTTtRQUNMLElBQUk7WUFDRixPQUFPLENBQUMsTUFBTSxzQkFBVSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzVEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxhQUFhLHVDQUF1QyxDQUFDLENBQUM7U0FDeEc7S0FDRjtBQUNILENBQUM7QUFkRCxzQ0FjQztBQUVELEtBQUssVUFBVSxX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QyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvRixDQUFDO0FBRkQsNENBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudCB9IGZyb20gJy4uL0V2ZW50JztcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSAnLi4vV29ybGQnO1xuaW1wb3J0IHsgR292ZXJub3IsIHByb3Bvc2FsU3RhdGVFbnVtcyB9IGZyb20gJy4uL0NvbnRyYWN0L0dvdmVybm9yJztcbmltcG9ydCB7IGdldEFkZHJlc3MgfSBmcm9tICcuLi9Db250cmFjdExvb2t1cCc7XG5pbXBvcnQge1xuICBnZXRBZGRyZXNzVixcbiAgZ2V0QXJyYXlWLFxuICBnZXRFdmVudFYsXG4gIGdldE51bWJlclYsXG4gIGdldFN0cmluZ1Zcbn0gZnJvbSAnLi4vQ29yZVZhbHVlJztcbmltcG9ydCB7XG4gIEFkZHJlc3NWLFxuICBCb29sVixcbiAgRXZlbnRWLFxuICBOdW1iZXJWLFxuICBTdHJpbmdWLFxuICBWYWx1ZVxufSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQgeyBBcmcsIEZldGNoZXIsIGdldEZldGNoZXJWYWx1ZSB9IGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHsgZW5jb2RlZE51bWJlciB9IGZyb20gJy4uL0VuY29kaW5nJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb3Bvc2FsSWQod29ybGQ6IFdvcmxkLCBnb3Zlcm5vcjogR292ZXJub3IsIHByb3Bvc2FsSWRlbnQ6IEV2ZW50KTogUHJvbWlzZTxudW1iZXI+IHtcbiAgaWYgKHR5cGVvZiBwcm9wb3NhbElkZW50ID09PSAnc3RyaW5nJyAmJiBwcm9wb3NhbElkZW50ID09PSAnTGFzdFByb3Bvc2FsJykge1xuICAgIHJldHVybiBOdW1iZXIoYXdhaXQgZ292ZXJub3IubWV0aG9kcy5wcm9wb3NhbENvdW50KCkuY2FsbCgpKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3Bvc2FsSWRlbnQpICYmIHByb3Bvc2FsSWRlbnRbMF0gPT09ICdBY3RpdmVQcm9wb3NhbCcgJiYgdHlwZW9mIHByb3Bvc2FsSWRlbnRbMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgbGV0IHByb3Bvc2VyID0gZ2V0QWRkcmVzcyh3b3JsZCwgcHJvcG9zYWxJZGVudFsxXSk7XG5cbiAgICByZXR1cm4gTnVtYmVyKGF3YWl0IGdvdmVybm9yLm1ldGhvZHMubGF0ZXN0UHJvcG9zYWxJZHMocHJvcG9zZXIpLmNhbGwoKSk7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoYXdhaXQgZ2V0TnVtYmVyVih3b3JsZCwgcHJvcG9zYWxJZGVudCkpLnRvTnVtYmVyKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb3Bvc2FsIGlkZW50aWZpZXIgXFxgJHtwcm9wb3NhbElkZW50fVxcYCwgZXhwZWN0ZWQgTnVtYmVyIG9yIFwiTGFzdFByb3Bvc2FsXCJgKTtcbiAgICB9XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0UHJvcG9zYWwod29ybGQ6IFdvcmxkLCBnb3Zlcm5vcjogR292ZXJub3IsIHByb3Bvc2FsSWRlbnQ6IEV2ZW50LCBnZXR0ZXI6IChnb3ZlbmVyOiBHb3Zlcm5vciwgbnVtYmVyOiBlbmNvZGVkTnVtYmVyKSA9PiBQcm9taXNlPEV2ZW50Pik6IFByb21pc2U8RXZlbnQ+IHtcbiAgcmV0dXJuIGF3YWl0IGdldHRlcihnb3Zlcm5vciwgbmV3IE51bWJlclYoYXdhaXQgZ2V0UHJvcG9zYWxJZCh3b3JsZCwgZ292ZXJub3IsIHByb3Bvc2FsSWRlbnQpKS5lbmNvZGUoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFByb3Bvc2FsU3RhdGUod29ybGQ6IFdvcmxkLCBnb3Zlcm5vcjogR292ZXJub3IsIHByb3Bvc2FsSWRlbnQ6IEV2ZW50KTogUHJvbWlzZTxTdHJpbmdWPiB7XG4gIGNvbnN0IHByb3Bvc2FsSWQgPSBhd2FpdCBnZXRQcm9wb3NhbElkKHdvcmxkLCBnb3Zlcm5vciwgcHJvcG9zYWxJZGVudCk7XG4gIGNvbnN0IHN0YXRlRW51bSA9IGF3YWl0IGdvdmVybm9yLm1ldGhvZHMuc3RhdGUocHJvcG9zYWxJZCkuY2FsbCgpO1xuICByZXR1cm4gbmV3IFN0cmluZ1YocHJvcG9zYWxTdGF0ZUVudW1zW3N0YXRlRW51bV0pO1xufVxuXG5mdW5jdGlvbiBjYXBpdGFsaXplKHMpIHtcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvcG9zYWxGZXRjaGVycyhnb3Zlcm5vcjogR292ZXJub3IpIHtcbiAgY29uc3QgZmllbGRzID0ge1xuICAgIGlkOiBnZXROdW1iZXJWLFxuICAgIHByb3Bvc2VyOiBnZXRBZGRyZXNzVixcbiAgICBldGE6IGdldE51bWJlclYsXG4gICAgdGFyZ2V0czoge1xuICAgICAgY29uc3RydWN0b3I6IGdldEFycmF5VihnZXRTdHJpbmdWKSxcbiAgICAgIGdldHRlcjogYXN5bmMgKGdvdmVybm9yLCBwcm9wb3NhbElkKSA9PiAoYXdhaXQgZ292ZXJub3IubWV0aG9kcy5nZXRBY3Rpb25zKHByb3Bvc2FsSWQpLmNhbGwoKSlbMF1cbiAgICB9LFxuICAgIHZhbHVlczoge1xuICAgICAgY29uc3RydWN0b3I6IGdldEFycmF5VihnZXROdW1iZXJWKSxcbiAgICAgIGdldHRlcjogYXN5bmMgKGdvdmVybm9yLCBwcm9wb3NhbElkKSA9PiAoYXdhaXQgZ292ZXJub3IubWV0aG9kcy5nZXRBY3Rpb25zKHByb3Bvc2FsSWQpLmNhbGwoKSlbMV1cbiAgICB9LFxuICAgIHNpZ25hdHVyZXM6IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBnZXRBcnJheVYoZ2V0U3RyaW5nViksXG4gICAgICBnZXR0ZXI6IGFzeW5jIChnb3Zlcm5vciwgcHJvcG9zYWxJZCkgPT4gKGF3YWl0IGdvdmVybm9yLm1ldGhvZHMuZ2V0QWN0aW9ucyhwcm9wb3NhbElkKS5jYWxsKCkpWzJdXG4gICAgfSxcbiAgICBjYWxsZGF0YXM6IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBnZXRBcnJheVYoZ2V0U3RyaW5nViksXG4gICAgICBnZXR0ZXI6IGFzeW5jIChnb3Zlcm5vciwgcHJvcG9zYWxJZCkgPT4gKGF3YWl0IGdvdmVybm9yLm1ldGhvZHMuZ2V0QWN0aW9ucyhwcm9wb3NhbElkKS5jYWxsKCkpWzNdXG4gICAgfSxcbiAgICBzdGFydEJsb2NrOiBnZXROdW1iZXJWLFxuICAgIGVuZEJsb2NrOiBnZXROdW1iZXJWLFxuICAgIGZvclZvdGVzOiBnZXROdW1iZXJWLFxuICAgIGFnYWluc3RWb3RlczogZ2V0TnVtYmVyVlxuICB9O1xuXG4gIGNvbnN0IGRlZmF1bHRlZEZpZWxkcyA9IE9iamVjdC5lbnRyaWVzKGZpZWxkcykubWFwKChbZmllbGQsIHZhbHVlc10pID0+IHtcbiAgICBsZXQgZ2l2ZW5WYWx1ZXM7XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGdpdmVuVmFsdWVzID0gdmFsdWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBnaXZlblZhbHVlcyA9IHtcbiAgICAgICAgY29uc3RydWN0b3I6IHZhbHVlc1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgZXZlbnQ6IGNhcGl0YWxpemUoZmllbGQudG9TdHJpbmcoKSksXG4gICAgICBnZXR0ZXI6IGFzeW5jIChnb3Zlcm5vciwgcHJvcG9zYWxJZCkgPT4gKGF3YWl0IGdvdmVybm9yLm1ldGhvZHMucHJvcG9zYWxzKHByb3Bvc2FsSWQpLmNhbGwoKSlbZmllbGRdLFxuICAgICAgY29uc3RydWN0b3I6IHZhbHVlcyxcbiAgICAgIG5hbWU6IGZpZWxkLnRvU3RyaW5nKCksXG4gICAgICAuLi5naXZlblZhbHVlc1xuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IGJhc2VGZXRjaGVycyA9IDxGZXRjaGVyPG9iamVjdCwgVmFsdWU+W10+ZGVmYXVsdGVkRmllbGRzLm1hcCgoeyBmaWVsZCwgY29uc3RydWN0b3IsIGV2ZW50LCBuYW1lLCBnZXR0ZXIgfSkgPT4ge1xuICAgIHJldHVybiBuZXcgRmV0Y2hlcjx7IHByb3Bvc2FsSWRlbnQ6IEV2ZW50ViB9LCBWYWx1ZT4oYFxuICAgICAgICAjIyMjICR7ZXZlbnR9XG5cbiAgICAgICAgKiBcIkdvdmVybm9yIDxHb3Zlcm5vcj4gUHJvcG9zYWwgPFByb3Bvc2FsPiAke2V2ZW50fVwiIC0gUmV0dXJucyB0aGUgJHtuYW1lIHx8IGZpZWxkfSBvZiBnaXZlbiBwcm9wb3NhbFxuICAgICAgICAgICogRS5nLiBcIkdvdmVybm9yIEdvdmVybm9yU2NlbmFyaW8gUHJvcG9zYWwgNSAke2V2ZW50fVwiXG4gICAgICAgICAgKiBFLmcuIFwiR292ZXJub3IgR292ZXJub3JTY2VuYXJpbyBQcm9wb3NhbCBMYXN0UHJvcG9zYWwgJHtldmVudH1cIlxuICAgICAgYCxcbiAgICAgIGV2ZW50LFxuICAgICAgW1xuICAgICAgICBuZXcgQXJnKFwicHJvcG9zYWxJZGVudFwiLCBnZXRFdmVudFYpXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IHByb3Bvc2FsSWRlbnQgfSkgPT4gYXdhaXQgY29uc3RydWN0b3Iod29ybGQsIGF3YWl0IGdldFByb3Bvc2FsKHdvcmxkLCBnb3Zlcm5vciwgcHJvcG9zYWxJZGVudC52YWwsIGdldHRlcikpLFxuICAgICAgeyBuYW1lUG9zOiAxIH1cbiAgICApXG4gIH0pO1xuXG4gIGNvbnN0IG90aGVyRmV0Y2hlcnMgPSA8RmV0Y2hlcjxvYmplY3QsIFZhbHVlPltdPltcbiAgICBuZXcgRmV0Y2hlcjx7IHByb3Bvc2FsSWRlbnQ6IEV2ZW50Viwgdm90ZXI6IEFkZHJlc3NWIH0sIEJvb2xWPihgXG4gICAgICAgICMjIyMgSGFzVm90ZWRcblxuICAgICAgICAqIFwiR292ZXJub3IgPEdvdmVybm9yPiBQcm9wb3NhbCA8UHJvcG9zYWw+IEhhc1ZvdGVkIDx2b3Rlcj5cIiAtIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gYWRkcmVzcyBoYXMgdm90ZWQgb24gZ2l2ZW4gcHJvcG9zYWxcbiAgICAgICAgICAqIEUuZy4gXCJHb3Zlcm5vciBHb3Zlcm5vclNjZW5hcmlvIFByb3Bvc2FsIDUgSGFzVm90ZWQgR2VvZmZcIlxuICAgICAgICAgICogRS5nLiBcIkdvdmVybm9yIEdvdmVybm9yU2NlbmFyaW8gUHJvcG9zYWwgTGFzdFByb3Bvc2FsIEhhc1ZvdGVkIEdlb2ZmXCJcbiAgICAgIGAsXG4gICAgICBcIkhhc1ZvdGVkXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJwcm9wb3NhbElkZW50XCIsIGdldEV2ZW50ViksXG4gICAgICAgIG5ldyBBcmcoXCJ2b3RlclwiLCBnZXRBZGRyZXNzVilcbiAgICAgIF0sXG4gICAgICBhc3luYyAod29ybGQsIHsgcHJvcG9zYWxJZGVudCwgdm90ZXIgfSkgPT4ge1xuICAgICAgICBjb25zdCByZWNlaXB0ID0gYXdhaXQgZ292ZXJub3IubWV0aG9kcy5nZXRSZWNlaXB0KGF3YWl0IGdldFByb3Bvc2FsSWQod29ybGQsIGdvdmVybm9yLCBwcm9wb3NhbElkZW50LnZhbCksIHZvdGVyLnZhbCkuY2FsbCgpO1xuICAgICAgICByZXR1cm4gbmV3IEJvb2xWKHJlY2VpcHQuaGFzVm90ZWQpO1xuICAgICAgfSxcbiAgICAgIHsgbmFtZVBvczogMSB9XG4gICAgKSxcbiAgICBuZXcgRmV0Y2hlcjx7IHByb3Bvc2FsSWRlbnQ6IEV2ZW50Viwgdm90ZXI6IEFkZHJlc3NWIH0sIEJvb2xWPihgXG4gICAgICAgICMjIyMgU3VwcG9ydGVkXG5cbiAgICAgICAgKiBcIkdvdmVybm9yIDxHb3Zlcm5vcj4gUHJvcG9zYWwgPFByb3Bvc2FsPiBTdXBwb3J0ZWQgPHZvdGVyPlwiIC0gUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBhZGRyZXNzIGhhcyB2b3RlZCBvbiBnaXZlbiBwcm9wb3NhbFxuICAgICAgICAgICogRS5nLiBcIkdvdmVybm9yIEdvdmVybm9yU2NlbmFyaW8gUHJvcG9zYWwgNSBTdXBwb3J0ZWQgR2VvZmZcIlxuICAgICAgICAgICogRS5nLiBcIkdvdmVybm9yIEdvdmVybm9yU2NlbmFyaW8gUHJvcG9zYWwgTGFzdFByb3Bvc2FsIFN1cHBvcnRlZCBHZW9mZlwiXG4gICAgICBgLFxuICAgICAgXCJTdXBwb3J0ZWRcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcInByb3Bvc2FsSWRlbnRcIiwgZ2V0RXZlbnRWKSxcbiAgICAgICAgbmV3IEFyZyhcInZvdGVyXCIsIGdldEFkZHJlc3NWKVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBwcm9wb3NhbElkZW50LCB2b3RlciB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBnb3Zlcm5vci5tZXRob2RzLmdldFJlY2VpcHQoYXdhaXQgZ2V0UHJvcG9zYWxJZCh3b3JsZCwgZ292ZXJub3IsIHByb3Bvc2FsSWRlbnQudmFsKSwgdm90ZXIudmFsKS5jYWxsKCk7XG4gICAgICAgIHJldHVybiBuZXcgQm9vbFYocmVjZWlwdC5zdXBwb3J0KTtcbiAgICAgIH0sXG4gICAgICB7IG5hbWVQb3M6IDEgfVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8eyBwcm9wb3NhbElkZW50OiBFdmVudFYsIHZvdGVyOiBBZGRyZXNzViB9LCBOdW1iZXJWPihgXG4gICAgICAgICMjIyMgVm90ZXNDYXN0XG5cbiAgICAgICAgKiBcIkdvdmVybm9yIDxHb3Zlcm5vcj4gUHJvcG9zYWwgPFByb3Bvc2FsPiBWb3Rlc0Nhc3QgPHZvdGVyPlwiIC0gUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBhZGRyZXNzIGhhcyB2b3RlZCBvbiBnaXZlbiBwcm9wb3NhbFxuICAgICAgICAgICogRS5nLiBcIkdvdmVybm9yIEdvdmVybm9yU2NlbmFyaW8gUHJvcG9zYWwgNSBWb3Rlc0Nhc3QgR2VvZmZcIlxuICAgICAgICAgICogRS5nLiBcIkdvdmVybm9yIEdvdmVybm9yU2NlbmFyaW8gUHJvcG9zYWwgTGFzdFByb3Bvc2FsIFZvdGVzQ2FzdCBHZW9mZlwiXG4gICAgICBgLFxuICAgICAgXCJWb3Rlc0Nhc3RcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcInByb3Bvc2FsSWRlbnRcIiwgZ2V0RXZlbnRWKSxcbiAgICAgICAgbmV3IEFyZyhcInZvdGVyXCIsIGdldEFkZHJlc3NWKVxuICAgICAgXSxcbiAgICAgIGFzeW5jICh3b3JsZCwgeyBwcm9wb3NhbElkZW50LCB2b3RlciB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlY2VpcHQgPSBhd2FpdCBnb3Zlcm5vci5tZXRob2RzLmdldFJlY2VpcHQoYXdhaXQgZ2V0UHJvcG9zYWxJZCh3b3JsZCwgZ292ZXJub3IsIHByb3Bvc2FsSWRlbnQudmFsKSwgdm90ZXIudmFsKS5jYWxsKCk7XG4gICAgICAgIHJldHVybiBuZXcgTnVtYmVyVihyZWNlaXB0LnZvdGVzKTtcbiAgICAgIH0sXG4gICAgICB7IG5hbWVQb3M6IDEgfVxuICAgICksXG4gICAgbmV3IEZldGNoZXI8eyBwcm9wb3NhbElkZW50OiBFdmVudFYgfSwgU3RyaW5nVj4oYFxuICAgICAgICAjIyMjIFN0YXRlXG5cbiAgICAgICAgKiBcIkdvdmVybm9yIDxHb3Zlcm5vcj4gUHJvcG9zYWwgPFByb3Bvc2FsPiBTdGF0ZVwiIC0gUmV0dXJucyBhIHN0cmluZyBvZiBhIHByb3Bvc2FsJ3MgY3VycmVudCBzdGF0ZVxuICAgICAgICAgICogRS5nLiBcIkdvdmVybm9yIEdvdmVybm9yU2NlbmFyaW8gUHJvcG9zYWwgTGFzdFByb3Bvc2FsIFN0YXRlXCJcbiAgICAgIGAsXG4gICAgICBcIlN0YXRlXCIsXG4gICAgICBbXG4gICAgICAgIG5ldyBBcmcoXCJwcm9wb3NhbElkZW50XCIsIGdldEV2ZW50ViksXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7IHByb3Bvc2FsSWRlbnQgfSkgPT4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgZ2V0UHJvcG9zYWxTdGF0ZSh3b3JsZCwgZ292ZXJub3IsIHByb3Bvc2FsSWRlbnQudmFsKTtcbiAgICAgIH0sXG4gICAgICB7IG5hbWVQb3M6IDEgfVxuICAgIClcbiAgXTtcblxuICByZXR1cm4gYmFzZUZldGNoZXJzLmNvbmNhdChvdGhlckZldGNoZXJzKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb3Bvc2FsVmFsdWUod29ybGQ6IFdvcmxkLCBnb3Zlcm5vcjogR292ZXJub3IsIGV2ZW50OiBFdmVudCk6IFByb21pc2U8VmFsdWU+IHtcbiAgcmV0dXJuIGF3YWl0IGdldEZldGNoZXJWYWx1ZTxhbnksIGFueT4oXCJQcm9wb3NhbFwiLCBwcm9wb3NhbEZldGNoZXJzKGdvdmVybm9yKSwgd29ybGQsIGV2ZW50KTtcbn1cbiJdfQ==
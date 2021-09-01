"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserValue = exports.userFetchers = void 0;
const CoreValue_1 = require("../CoreValue");
const Command_1 = require("../Command");
const Value_1 = require("../Value");
async function getUserAddress(world, user) {
    return new Value_1.AddressV(user);
}
function userFetchers() {
    return [
        new Command_1.Fetcher(`
        #### Address

        * "User <User> Address" - Returns address of user
          * E.g. "User Geoff Address" - Returns Geoff's address
      `, "Address", [
            new Command_1.Arg("account", CoreValue_1.getAddressV)
        ], async (world, { account }) => account, { namePos: 1 })
    ];
}
exports.userFetchers = userFetchers;
async function getUserValue(world, event) {
    return await Command_1.getFetcherValue("User", userFetchers(), world, event);
}
exports.getUserValue = getUserValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlclZhbHVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1ZhbHVlL1VzZXJWYWx1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw0Q0FFc0I7QUFDdEIsd0NBQXlEO0FBQ3pELG9DQUdrQjtBQUVsQixLQUFLLFVBQVUsY0FBYyxDQUFDLEtBQVksRUFBRSxJQUFZO0lBQ3RELE9BQU8sSUFBSSxnQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxTQUFnQixZQUFZO0lBQzFCLE9BQU87UUFDTCxJQUFJLGlCQUFPLENBQWdDOzs7OztPQUt4QyxFQUNELFNBQVMsRUFDVDtZQUNFLElBQUksYUFBRyxDQUFDLFNBQVMsRUFBRSx1QkFBVyxDQUFDO1NBQ2hDLEVBQ0QsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQ25DLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUNiO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFoQkQsb0NBZ0JDO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxLQUFZLEVBQUUsS0FBWTtJQUMzRCxPQUFPLE1BQU0seUJBQWUsQ0FBVyxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9FLENBQUM7QUFGRCxvQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnR9IGZyb20gJy4uL0V2ZW50JztcbmltcG9ydCB7V29ybGR9IGZyb20gJy4uL1dvcmxkJztcbmltcG9ydCB7XG4gIGdldEFkZHJlc3NWXG59IGZyb20gJy4uL0NvcmVWYWx1ZSc7XG5pbXBvcnQge0FyZywgRmV0Y2hlciwgZ2V0RmV0Y2hlclZhbHVlfSBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7XG4gIEFkZHJlc3NWLFxuICBWYWx1ZVxufSBmcm9tICcuLi9WYWx1ZSc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFVzZXJBZGRyZXNzKHdvcmxkOiBXb3JsZCwgdXNlcjogc3RyaW5nKTogUHJvbWlzZTxBZGRyZXNzVj4ge1xuICByZXR1cm4gbmV3IEFkZHJlc3NWKHVzZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlckZldGNoZXJzKCkge1xuICByZXR1cm4gW1xuICAgIG5ldyBGZXRjaGVyPHthY2NvdW50OiBBZGRyZXNzVn0sIEFkZHJlc3NWPihgXG4gICAgICAgICMjIyMgQWRkcmVzc1xuXG4gICAgICAgICogXCJVc2VyIDxVc2VyPiBBZGRyZXNzXCIgLSBSZXR1cm5zIGFkZHJlc3Mgb2YgdXNlclxuICAgICAgICAgICogRS5nLiBcIlVzZXIgR2VvZmYgQWRkcmVzc1wiIC0gUmV0dXJucyBHZW9mZidzIGFkZHJlc3NcbiAgICAgIGAsXG4gICAgICBcIkFkZHJlc3NcIixcbiAgICAgIFtcbiAgICAgICAgbmV3IEFyZyhcImFjY291bnRcIiwgZ2V0QWRkcmVzc1YpXG4gICAgICBdLFxuICAgICAgYXN5bmMgKHdvcmxkLCB7YWNjb3VudH0pID0+IGFjY291bnQsXG4gICAgICB7bmFtZVBvczogMX1cbiAgICApXG4gIF07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRVc2VyVmFsdWUod29ybGQ6IFdvcmxkLCBldmVudDogRXZlbnQpOiBQcm9taXNlPFZhbHVlPiB7XG4gIHJldHVybiBhd2FpdCBnZXRGZXRjaGVyVmFsdWU8YW55LCBhbnk+KFwiVXNlclwiLCB1c2VyRmV0Y2hlcnMoKSwgd29ybGQsIGV2ZW50KTtcbn1cbiJdfQ==
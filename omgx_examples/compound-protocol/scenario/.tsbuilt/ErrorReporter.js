"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComptrollerErrorReporter = exports.CTokenErrorReporter = exports.NoErrorReporter = exports.formatResult = void 0;
const ErrorReporterConstants_1 = require("./ErrorReporterConstants");
class NoErrorReporterType {
    getError(error) {
        return null;
    }
    getInfo(info) {
        return null;
    }
    getDetail(error, detail) {
        return detail.toString();
    }
}
class CTokenErrorReporterType {
    getError(error) {
        if (error === null) {
            return null;
        }
        else {
            return ErrorReporterConstants_1.TokenErr.ErrorInv[Number(error)];
        }
    }
    getInfo(info) {
        if (info === null) {
            return null;
        }
        else {
            return ErrorReporterConstants_1.TokenErr.FailureInfoInv[Number(info)];
        }
    }
    getDetail(error, detail) {
        // Little hack to let us use proper names for cross-contract errors
        if (this.getError(error) === "COMPTROLLER_REJECTION") {
            let comptrollerError = exports.ComptrollerErrorReporter.getError(detail);
            if (comptrollerError) {
                return comptrollerError;
            }
        }
        return detail.toString();
    }
}
class ComptrollerErrorReporterType {
    getError(error) {
        if (error === null) {
            return null;
        }
        else {
            // TODO: This probably isn't right...
            return ErrorReporterConstants_1.ComptrollerErr.ErrorInv[Number(error)];
        }
    }
    getInfo(info) {
        if (info === null) {
            return null;
        }
        else {
            // TODO: This probably isn't right...
            return ErrorReporterConstants_1.ComptrollerErr.FailureInfoInv[Number(info)];
        }
    }
    getDetail(error, detail) {
        if (this.getError(error) === "REJECTION") {
            let comptrollerError = exports.ComptrollerErrorReporter.getError(detail);
            if (comptrollerError) {
                return comptrollerError;
            }
        }
        return detail.toString();
    }
}
function formatResult(errorReporter, result) {
    const errorStr = errorReporter.getError(result);
    if (errorStr !== null) {
        return `Error=${errorStr}`;
    }
    else {
        return `Result=${result}`;
    }
}
exports.formatResult = formatResult;
// Singleton instances
exports.NoErrorReporter = new NoErrorReporterType();
exports.CTokenErrorReporter = new CTokenErrorReporterType();
exports.ComptrollerErrorReporter = new ComptrollerErrorReporterType();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJyb3JSZXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9FcnJvclJlcG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFFQUFrRTtBQVFsRSxNQUFNLG1CQUFtQjtJQUN2QixRQUFRLENBQUMsS0FBVTtRQUNqQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBUztRQUNmLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFVLEVBQUUsTUFBYztRQUNsQyxPQUFPLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7QUFFRCxNQUFNLHVCQUF1QjtJQUMzQixRQUFRLENBQUMsS0FBVTtRQUNqQixJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDbEIsT0FBTyxJQUFJLENBQUM7U0FDYjthQUFNO1lBQ0wsT0FBTyxpQ0FBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUN6QztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsSUFBUztRQUNmLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNiO2FBQU07WUFDTCxPQUFPLGlDQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFVLEVBQUUsTUFBYztRQUNsQyxtRUFBbUU7UUFDbkUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLHVCQUF1QixFQUFFO1lBQ3BELElBQUksZ0JBQWdCLEdBQUcsZ0NBQXdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWpFLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3BCLE9BQU8sZ0JBQWdCLENBQUM7YUFDekI7U0FDRjtRQUVELE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FDRjtBQUVELE1BQU0sNEJBQTRCO0lBQ2hDLFFBQVEsQ0FBQyxLQUFVO1FBQ2pCLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQztTQUNiO2FBQU07WUFDTCxxQ0FBcUM7WUFDckMsT0FBTyx1Q0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMvQztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsSUFBUztRQUNmLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNiO2FBQU07WUFDTCxxQ0FBcUM7WUFDckMsT0FBTyx1Q0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNwRDtJQUNILENBQUM7SUFFRCxTQUFTLENBQUMsS0FBVSxFQUFFLE1BQWM7UUFDbEMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLFdBQVcsRUFBRTtZQUN4QyxJQUFJLGdCQUFnQixHQUFHLGdDQUF3QixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVqRSxJQUFJLGdCQUFnQixFQUFFO2dCQUNwQixPQUFPLGdCQUFnQixDQUFDO2FBQ3pCO1NBQ0Y7UUFFRCxPQUFPLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7QUFFRCxTQUFnQixZQUFZLENBQUMsYUFBNEIsRUFBRSxNQUFXO0lBQ3BFLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEQsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1FBQ3JCLE9BQU8sU0FBUyxRQUFRLEVBQUUsQ0FBQTtLQUMzQjtTQUFNO1FBQ0wsT0FBTyxVQUFVLE1BQU0sRUFBRSxDQUFDO0tBQzNCO0FBQ0gsQ0FBQztBQVBELG9DQU9DO0FBRUQsc0JBQXNCO0FBQ1QsUUFBQSxlQUFlLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQzVDLFFBQUEsbUJBQW1CLEdBQUcsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO0FBQ3BELFFBQUEsd0JBQXdCLEdBQUcsSUFBSSw0QkFBNEIsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wdHJvbGxlckVyciwgVG9rZW5FcnJ9IGZyb20gJy4vRXJyb3JSZXBvcnRlckNvbnN0YW50cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JSZXBvcnRlciB7XG4gIGdldEVycm9yKGVycm9yOiBhbnkpOiBzdHJpbmcgfCBudWxsXG4gIGdldEluZm8oaW5mbzogYW55KTogc3RyaW5nIHwgbnVsbFxuICBnZXREZXRhaWwoZXJyb3I6IGFueSwgZGV0YWlsOiBudW1iZXIpOiBzdHJpbmdcbn1cblxuY2xhc3MgTm9FcnJvclJlcG9ydGVyVHlwZSBpbXBsZW1lbnRzIEVycm9yUmVwb3J0ZXIge1xuICBnZXRFcnJvcihlcnJvcjogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRJbmZvKGluZm86IGFueSk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0RGV0YWlsKGVycm9yOiBhbnksIGRldGFpbDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZGV0YWlsLnRvU3RyaW5nKCk7XG4gIH1cbn1cblxuY2xhc3MgQ1Rva2VuRXJyb3JSZXBvcnRlclR5cGUgaW1wbGVtZW50cyBFcnJvclJlcG9ydGVyIHtcbiAgZ2V0RXJyb3IoZXJyb3I6IGFueSk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmIChlcnJvciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBUb2tlbkVyci5FcnJvckludltOdW1iZXIoZXJyb3IpXTtcbiAgICB9XG4gIH1cblxuICBnZXRJbmZvKGluZm86IGFueSk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmIChpbmZvID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFRva2VuRXJyLkZhaWx1cmVJbmZvSW52W051bWJlcihpbmZvKV07XG4gICAgfVxuICB9XG5cbiAgZ2V0RGV0YWlsKGVycm9yOiBhbnksIGRldGFpbDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAvLyBMaXR0bGUgaGFjayB0byBsZXQgdXMgdXNlIHByb3BlciBuYW1lcyBmb3IgY3Jvc3MtY29udHJhY3QgZXJyb3JzXG4gICAgaWYgKHRoaXMuZ2V0RXJyb3IoZXJyb3IpID09PSBcIkNPTVBUUk9MTEVSX1JFSkVDVElPTlwiKSB7XG4gICAgICBsZXQgY29tcHRyb2xsZXJFcnJvciA9IENvbXB0cm9sbGVyRXJyb3JSZXBvcnRlci5nZXRFcnJvcihkZXRhaWwpO1xuXG4gICAgICBpZiAoY29tcHRyb2xsZXJFcnJvcikge1xuICAgICAgICByZXR1cm4gY29tcHRyb2xsZXJFcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGV0YWlsLnRvU3RyaW5nKCk7XG4gIH1cbn1cblxuY2xhc3MgQ29tcHRyb2xsZXJFcnJvclJlcG9ydGVyVHlwZSBpbXBsZW1lbnRzIEVycm9yUmVwb3J0ZXIge1xuICBnZXRFcnJvcihlcnJvcjogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKGVycm9yID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogVGhpcyBwcm9iYWJseSBpc24ndCByaWdodC4uLlxuICAgICAgcmV0dXJuIENvbXB0cm9sbGVyRXJyLkVycm9ySW52W051bWJlcihlcnJvcildO1xuICAgIH1cbiAgfVxuXG4gIGdldEluZm8oaW5mbzogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKGluZm8gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPOiBUaGlzIHByb2JhYmx5IGlzbid0IHJpZ2h0Li4uXG4gICAgICByZXR1cm4gQ29tcHRyb2xsZXJFcnIuRmFpbHVyZUluZm9JbnZbTnVtYmVyKGluZm8pXTtcbiAgICB9XG4gIH1cblxuICBnZXREZXRhaWwoZXJyb3I6IGFueSwgZGV0YWlsOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmdldEVycm9yKGVycm9yKSA9PT0gXCJSRUpFQ1RJT05cIikge1xuICAgICAgbGV0IGNvbXB0cm9sbGVyRXJyb3IgPSBDb21wdHJvbGxlckVycm9yUmVwb3J0ZXIuZ2V0RXJyb3IoZGV0YWlsKTtcblxuICAgICAgaWYgKGNvbXB0cm9sbGVyRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGNvbXB0cm9sbGVyRXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRldGFpbC50b1N0cmluZygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRSZXN1bHQoZXJyb3JSZXBvcnRlcjogRXJyb3JSZXBvcnRlciwgcmVzdWx0OiBhbnkpOiBzdHJpbmcge1xuICBjb25zdCBlcnJvclN0ciA9IGVycm9yUmVwb3J0ZXIuZ2V0RXJyb3IocmVzdWx0KTtcbiAgaWYgKGVycm9yU3RyICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGBFcnJvcj0ke2Vycm9yU3RyfWBcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYFJlc3VsdD0ke3Jlc3VsdH1gO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZXNcbmV4cG9ydCBjb25zdCBOb0Vycm9yUmVwb3J0ZXIgPSBuZXcgTm9FcnJvclJlcG9ydGVyVHlwZSgpO1xuZXhwb3J0IGNvbnN0IENUb2tlbkVycm9yUmVwb3J0ZXIgPSBuZXcgQ1Rva2VuRXJyb3JSZXBvcnRlclR5cGUoKTtcbmV4cG9ydCBjb25zdCBDb21wdHJvbGxlckVycm9yUmVwb3J0ZXIgPSBuZXcgQ29tcHRyb2xsZXJFcnJvclJlcG9ydGVyVHlwZSgpO1xuIl19
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printHelp = void 0;
const Utils_1 = require("./Utils");
function printHelp(printer, event, expressions, path = []) {
    if (event.length === 0) {
        let banner;
        if (path.length === 0) {
            banner = (`
## Compound Command Runner

The Compound Command Runner makes it easy to interact with Compound. You can input simple commands
and it will construct Web3 calls to pull data or generate transactions. A list of available commands
is included below. To dig further into a command run \`Help <Command>\`, such as \`Help From\` or for
sub-commands run \`Help CToken\` or \`Help CToken Mint\`.
`).trim();
        }
        else {
            if (expressions.length > 0) {
                banner = `### ${path.join(" ")} Sub-Commands`;
            }
        }
        if (!!banner) {
            printer.printMarkdown(banner);
        }
        expressions.forEach((expression) => {
            printer.printMarkdown(`\n${expression.doc}`);
            if (expression.subExpressions.length > 0) {
                printer.printMarkdown(`For more information, run: \`Help ${path} ${expression.name}\``);
            }
        });
    }
    else {
        const [first, ...rest] = event;
        const expressionName = Utils_1.mustString(first);
        let expression = expressions.find((expression) => expression.name.toLowerCase() === expressionName.toLowerCase());
        if (expression) {
            if (rest.length === 0) {
                printer.printMarkdown(`${expression.doc}`);
            }
            printHelp(printer, rest, expression.subExpressions, path.concat(expression.name));
        }
        else {
            let matchingExpressions = expressions.filter((expression) => expression.name.toLowerCase().startsWith(expressionName.toLowerCase()));
            if (matchingExpressions.length === 0) {
                printer.printLine(`\nError: cannot find help docs for ${path.concat(first).join(" ")}`);
            }
            else {
                if (rest.length === 0) {
                    matchingExpressions.forEach((expression) => {
                        printer.printMarkdown(`${expression.doc}`);
                    });
                }
                else {
                    printer.printLine(`\nError: cannot find help docs for ${path.concat(event).join(" ")}`);
                }
            }
        }
    }
}
exports.printHelp = printHelp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9IZWxwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1DQUFtQztBQUduQyxTQUFnQixTQUFTLENBQUMsT0FBZ0IsRUFBRSxLQUFZLEVBQUUsV0FBOEIsRUFBRSxPQUFlLEVBQUU7SUFDekcsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN0QixJQUFJLE1BQU0sQ0FBQztRQUVYLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsTUFBTSxHQUFHLENBQ2Y7Ozs7Ozs7Q0FPQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDTDthQUFNO1lBQ0wsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDMUIsTUFBTSxHQUFHLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO2FBQy9DO1NBQ0Y7UUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDWixPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQy9CO1FBRUQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM3QyxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDeEMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxxQ0FBcUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO2FBQ3pGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtTQUFNO1FBQ0wsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMvQixNQUFNLGNBQWMsR0FBRyxrQkFBVSxDQUFRLEtBQUssQ0FBQyxDQUFDO1FBRWhELElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFbEgsSUFBSSxVQUFVLEVBQUU7WUFDZCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDNUM7WUFFRCxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDbkY7YUFBTTtZQUNMLElBQUksbUJBQW1CLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVySSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3BDLE9BQU8sQ0FBQyxTQUFTLENBQUMsc0NBQXNDLElBQUksQ0FBQyxNQUFNLENBQVMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNqRztpQkFBTTtnQkFDTCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNyQixtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTt3QkFDekMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO29CQUM3QyxDQUFDLENBQUMsQ0FBQztpQkFDSjtxQkFBTTtvQkFDTCxPQUFPLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxJQUFJLENBQUMsTUFBTSxDQUFXLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ25HO2FBQ0Y7U0FDRjtLQUNGO0FBQ0gsQ0FBQztBQTFERCw4QkEwREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50fSBmcm9tICcuL0V2ZW50JztcbmltcG9ydCB7RXhwcmVzc2lvbn0gZnJvbSAnLi9Db21tYW5kJztcbmltcG9ydCB7bXVzdFN0cmluZ30gZnJvbSAnLi9VdGlscyc7XG5pbXBvcnQge1ByaW50ZXJ9IGZyb20gJy4vUHJpbnRlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmludEhlbHAocHJpbnRlcjogUHJpbnRlciwgZXZlbnQ6IEV2ZW50LCBleHByZXNzaW9uczogRXhwcmVzc2lvbjxhbnk+W10sIHBhdGg6IHN0cmluZ1tdPVtdKSB7XG4gIGlmIChldmVudC5sZW5ndGggPT09IDApIHtcbiAgICBsZXQgYmFubmVyO1xuXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICBiYW5uZXIgPSAoXG5gXG4jIyBDb21wb3VuZCBDb21tYW5kIFJ1bm5lclxuXG5UaGUgQ29tcG91bmQgQ29tbWFuZCBSdW5uZXIgbWFrZXMgaXQgZWFzeSB0byBpbnRlcmFjdCB3aXRoIENvbXBvdW5kLiBZb3UgY2FuIGlucHV0IHNpbXBsZSBjb21tYW5kc1xuYW5kIGl0IHdpbGwgY29uc3RydWN0IFdlYjMgY2FsbHMgdG8gcHVsbCBkYXRhIG9yIGdlbmVyYXRlIHRyYW5zYWN0aW9ucy4gQSBsaXN0IG9mIGF2YWlsYWJsZSBjb21tYW5kc1xuaXMgaW5jbHVkZWQgYmVsb3cuIFRvIGRpZyBmdXJ0aGVyIGludG8gYSBjb21tYW5kIHJ1biBcXGBIZWxwIDxDb21tYW5kPlxcYCwgc3VjaCBhcyBcXGBIZWxwIEZyb21cXGAgb3IgZm9yXG5zdWItY29tbWFuZHMgcnVuIFxcYEhlbHAgQ1Rva2VuXFxgIG9yIFxcYEhlbHAgQ1Rva2VuIE1pbnRcXGAuXG5gKS50cmltKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChleHByZXNzaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGJhbm5lciA9IGAjIyMgJHtwYXRoLmpvaW4oXCIgXCIpfSBTdWItQ29tbWFuZHNgO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghIWJhbm5lcikge1xuICAgICAgcHJpbnRlci5wcmludE1hcmtkb3duKGJhbm5lcik7XG4gICAgfVxuXG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCgoZXhwcmVzc2lvbikgPT4ge1xuICAgICAgcHJpbnRlci5wcmludE1hcmtkb3duKGBcXG4ke2V4cHJlc3Npb24uZG9jfWApO1xuICAgICAgaWYgKGV4cHJlc3Npb24uc3ViRXhwcmVzc2lvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBwcmludGVyLnByaW50TWFya2Rvd24oYEZvciBtb3JlIGluZm9ybWF0aW9uLCBydW46IFxcYEhlbHAgJHtwYXRofSAke2V4cHJlc3Npb24ubmFtZX1cXGBgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBbZmlyc3QsIC4uLnJlc3RdID0gZXZlbnQ7XG4gICAgY29uc3QgZXhwcmVzc2lvbk5hbWUgPSBtdXN0U3RyaW5nKDxFdmVudD5maXJzdCk7XG4gIFxuICAgIGxldCBleHByZXNzaW9uID0gZXhwcmVzc2lvbnMuZmluZCgoZXhwcmVzc2lvbikgPT4gZXhwcmVzc2lvbi5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IGV4cHJlc3Npb25OYW1lLnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgaWYgKGV4cHJlc3Npb24pIHtcbiAgICAgIGlmIChyZXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBwcmludGVyLnByaW50TWFya2Rvd24oYCR7ZXhwcmVzc2lvbi5kb2N9YCk7XG4gICAgICB9XG5cbiAgICAgIHByaW50SGVscChwcmludGVyLCByZXN0LCBleHByZXNzaW9uLnN1YkV4cHJlc3Npb25zLCBwYXRoLmNvbmNhdChleHByZXNzaW9uLm5hbWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG1hdGNoaW5nRXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucy5maWx0ZXIoKGV4cHJlc3Npb24pID0+IGV4cHJlc3Npb24ubmFtZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoZXhwcmVzc2lvbk5hbWUudG9Mb3dlckNhc2UoKSkpO1xuXG4gICAgICBpZiAobWF0Y2hpbmdFeHByZXNzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcHJpbnRlci5wcmludExpbmUoYFxcbkVycm9yOiBjYW5ub3QgZmluZCBoZWxwIGRvY3MgZm9yICR7cGF0aC5jb25jYXQoPHN0cmluZz5maXJzdCkuam9pbihcIiBcIil9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBtYXRjaGluZ0V4cHJlc3Npb25zLmZvckVhY2goKGV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICAgIHByaW50ZXIucHJpbnRNYXJrZG93bihgJHtleHByZXNzaW9uLmRvY31gKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcmludGVyLnByaW50TGluZShgXFxuRXJyb3I6IGNhbm5vdCBmaW5kIGhlbHAgZG9jcyBmb3IgJHtwYXRoLmNvbmNhdCg8c3RyaW5nW10+ZXZlbnQpLmpvaW4oXCIgXCIpfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
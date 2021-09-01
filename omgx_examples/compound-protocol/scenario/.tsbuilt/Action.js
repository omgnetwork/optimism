"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
class Action {
    constructor(log, invokation) {
        this.log = log;
        this.invokation = invokation;
    }
    toString() {
        return `Action: log=${this.log}, result=${this.invokation.toString()}`;
    }
}
exports.Action = Action;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxNQUFhLE1BQU07SUFJakIsWUFBWSxHQUFXLEVBQUUsVUFBeUI7UUFDaEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQsUUFBUTtRQUNOLE9BQU8sZUFBZSxJQUFJLENBQUMsR0FBRyxZQUFZLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztJQUN6RSxDQUFDO0NBQ0Y7QUFaRCx3QkFZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW52b2thdGlvbn0gZnJvbSAnLi9JbnZva2F0aW9uJztcblxuZXhwb3J0IGNsYXNzIEFjdGlvbjxUPiB7XG4gIGxvZzogc3RyaW5nO1xuICBpbnZva2F0aW9uOiBJbnZva2F0aW9uPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKGxvZzogc3RyaW5nLCBpbnZva2F0aW9uOiBJbnZva2F0aW9uPFQ+KSB7XG4gICAgdGhpcy5sb2cgPSBsb2c7XG4gICAgdGhpcy5pbnZva2F0aW9uID0gaW52b2thdGlvbjtcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgQWN0aW9uOiBsb2c9JHt0aGlzLmxvZ30sIHJlc3VsdD0ke3RoaXMuaW52b2thdGlvbi50b1N0cmluZygpfWA7XG4gIH1cbn1cbiJdfQ==
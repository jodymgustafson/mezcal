export type InterpreterVariables = Record<string, (number | string)>;
export type VariableValue = (number | string);

export class InterpreterContext {
    constructor(readonly enclosing: InterpreterContext = undefined, readonly variables: Record<string, VariableValue> = {}) {}

    getVariable<T = VariableValue>(name: string): T | undefined {
        let value = this.variables[name] as T;
        if (value === undefined && this.enclosing) {
            value = this.enclosing.getVariable(name);
        }
        
        return value;
    }

    setVariable(name: string, value: VariableValue, isLet = false): void {
        if (!isLet && this.variables[name] === undefined && this.enclosing && this.enclosing.getVariable(name) !== undefined) {
            this.enclosing.setVariable(name, value);
        }
        else {
            this.variables[name] = value;
        }
    }
}

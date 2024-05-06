export type InterpreterVariables = Record<string, (number | string)>;
export type VariableValue = (number | string);

export class InterpreterEnvironment {
    constructor(readonly variables: Record<string, VariableValue> = {}) {}

    getVariable<T = VariableValue>(name: string): T | undefined {
        return this.variables[name] as T;
    }

    setVariable(name: string, value: VariableValue): void {
        this.variables[name] = value;
    }
}
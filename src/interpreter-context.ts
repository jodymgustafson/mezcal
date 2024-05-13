import { Callable } from "./interpreter";

export type VariableValue = (number | string);
export type InterpreterVariables = Record<string, VariableValue>;
export type InterpreterFunctions = Record<string, Callable>;

export class InterpreterContext {
    private readonly vars: Record<string, VariableValue | Callable>;

    /**
     * Creates a new instance
     * @param enclosing The enclosing scope, undefined for top level
     * @param variables Set of variables available at start
     * @param functions Set of functions available at start
     */
    constructor(readonly enclosing: InterpreterContext = undefined,
        variables: InterpreterVariables = {},
        functions: InterpreterFunctions = {}
    ) {
        this.vars = { ...variables, ...functions };
    }

    /**
     * Sets the value of a variable
     * @param name Name of the variable
     * @param value Value of the variable
     * @param isLet Set true if it's being set with a let statement so it gets the correct block scope
     */
    setVariable(name: string, value: VariableValue | Callable, isLet = false): void {
        if (!isLet && this.vars[name] === undefined && this.enclosing && this.enclosing.getVariable(name) !== undefined) {
            this.enclosing.setVariable(name, value);
        }
        else {
            this.vars[name] = value;
        }
    }

    getVariable<T = VariableValue | Callable>(name: string): T | undefined {
        let value = this.vars[name] as T;
        if (value === undefined && this.enclosing) {
            // Check for it in the enclosing scope
            value = this.enclosing.getVariable(name);
        }
        
        return value;
    }
}

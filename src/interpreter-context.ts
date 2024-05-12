import { Callable } from "./interpreter";

export type VariableValue = (number | string);
export type InterpreterVariables = Record<string, VariableValue>;

export type InterpreterFunctions = Record<string, Callable>;

export class InterpreterContext {
    /**
     * Creates a new instance
     * @param enclosing The enclosing scope, undefined for top level
     * @param variables Set of variables available at start
     * @param functions Set of functions available at start
     */
    constructor(readonly enclosing: InterpreterContext = undefined,
        readonly variables: InterpreterVariables = {},
        readonly functions: InterpreterFunctions = {}
    ) { }

    /**
     * Sets the value of a variable
     * @param name Name of the variable
     * @param value Value of the variable
     * @param isLet Set true if it's being set with a let statement so it gets the correct block scope
     */
    setVariable(name: string, value: VariableValue, isLet = false): void {
        if (!isLet && this.variables[name] === undefined && this.enclosing && this.enclosing.getVariable(name) !== undefined) {
            this.enclosing.setVariable(name, value);
        }
        else {
            this.variables[name] = value;
        }
    }

    getVariable<T = VariableValue>(name: string): T | undefined {
        let value = this.variables[name] as T;
        if (value === undefined && this.enclosing) {
            // Check for it in the enclosing scope
            value = this.enclosing.getVariable(name);
        }
        
        return value;
    }

    /**
     * Adds a function definition
     * @param name Name of the function
     * @param def Definition of the function
     */
    setFunction(name: string, def: Callable): void {
        this.functions[name] = def;
    }

    /**
     * Gets a function definition
     * @param name Name of the function
     * @returns The function definition or undefined if not exists
     */
    getFunction(name: string): Callable | undefined {
        let fn = this.functions[name];
        if (fn === undefined && this.enclosing) {
            // Check for it in the enclosing scope
            fn = this.enclosing.getFunction(name);
        }

        return fn;
    }
}

import { argv } from "process";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";
import { InterpreterContext, InterpreterVariables } from "./internal/interpreter-context";
import { nativeFunctions } from "./internal/native-functions";

/**
 * Executes Mezcal code given an optional set of variables
 * @param source Mezcal code
 * @param variables A map of variable names to values
 * @returns The result of the execution
 */
export function execute(source: string, variables?: InterpreterVariables): number | string | boolean {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    if (scanner.errors.length > 0) {
        console.error("There were scanner errors:");
        console.error(JSON.stringify(scanner.errors));
    }
    else {
        console.log(JSON.stringify(tokens, null, 2));
        const parser = new Parser(tokens);
        const ast = parser.parse();
        if (parser.errors.length > 0) {
            console.error("There were parser errors:");
            console.error(parser.errors[0].message);
        }
        else {
            // console.log(new AstPrinter().print(ast));
            const int = new Interpreter(new InterpreterContext(undefined, variables, nativeFunctions));
            return int.interpret(ast);
        }
    }
}
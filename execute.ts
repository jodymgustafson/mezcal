import { argv } from "process";
import { Scanner } from "./src/scanner";
import { Parser } from "./src/parser";
import { InterpreterVariables, Interpreter } from "./src/interpreter";

const input = argv[2];
if (input) {
    const code = execute(input);
    console.log(JSON.stringify(code));
}
else {
    console.log("Usage: execute [expr]");
}

/**
 * Executes an expression
 * @param expr Mathematical expression
 * @param variables A map of variable names to values
 * @returns The result of the expression
 */
export function execute(expr: string, variables?: InterpreterVariables): number {
    const scanner = new Scanner(expr);
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
            const int = new Interpreter(variables);
            return int.interpret(ast);
        }
    }
}
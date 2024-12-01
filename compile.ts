import { argv } from "process";
import { Scanner } from "./src/scanner";
import { Parser } from "./src/parser";
import { StackVMCompiler } from "./src/stackvm-compiler";

const input = argv[2];
if (input) {
    const code = compile(input);
    console.log(JSON.stringify(code));
}
else {
    console.log("Usage: compile [expr]");
}

/**
 * Compiles an expression into StackVM assembly code.
 * @param expr Mathematical expression
 * @returns An array of assembly code instructions
 */
export function compile(expr: string): string[] {
    const scanner = new Scanner(expr);
    const tokens = scanner.scanTokens();
    if (scanner.errors.length > 0) {
        console.error("There were scanner errors:");
        console.error(JSON.stringify(scanner.errors));
    }
    else {
        // console.log(JSON.stringify(tokens, null, 2));
        const parser = new Parser(tokens);
        const ast = parser.parse();
        if (parser.errors.length > 0) {
            console.error("There were parser errors:");
            console.error(parser.errors[0].message);
        }
        else {
            // console.log(new AstPrinter().print(ast));
            const compiler = new StackVMCompiler();
            return compiler.compile(ast);
        }
    }

    return [];
}
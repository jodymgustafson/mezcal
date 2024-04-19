import { argv } from "process";
import { MexScanner } from "./src/mex-scanner";
import { MexParser } from "./src/mex-parser";
import { Mex2SVMCompiler } from "./src/mex-compiler";

const input = argv[2];
if (input) {
    const code = compile(input);
    console.log(JSON.stringify(code));
}
else {
    console.log("Usage: compile [exp]");
}

export function compile(expr: string): string[] {
    const scanner = new MexScanner(expr);
    const tokens = scanner.scanTokens();
    if (scanner.errors.length > 0) {
        console.error("There were scanner errors:");
        console.error(JSON.stringify(scanner.errors));
    }
    else {
        // console.log(JSON.stringify(tokens, null, 2));
        const parser = new MexParser(tokens);
        const ast = parser.parse();
        if (parser.errors.length > 0) {
            console.error("There were parser errors:");
            console.error(parser.errors[0].message);
        }
        else {
            // console.log(new AstPrinter().print(ast));
            const compiler = new Mex2SVMCompiler();
            return compiler.compile(ast);
        }
    }
}
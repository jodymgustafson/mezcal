import { AstPrinter } from "./ast-printer";
import { ScanError } from "./internal/lexical-scanner";
import { nativeFunctions } from "./internal/native-functions";
import { Interpreter } from "./interpreter";
import { InterpreterContext } from "./internal/interpreter-context";
import { ParseError, Parser } from "./parser";
import { Scanner } from "./scanner";

export class MezcalRuntimeError<T = Error | ScanError | ParseError> extends Error {
    constructor(msg: string, readonly errors: T[]) {
        super(msg);
    }
}

/**
 * The Mezcal runtime. This class that has an interpreter that is used to
 * execute any number of statements while keeping track of state.
 */
export class Runtime {
    debug = false;

    constructor(readonly interpreter = new Interpreter(new InterpreterContext(undefined, undefined, nativeFunctions))) { }

    /**
     * Runs Mezcal source code in the interpreter
     * @param source Mezcal source code
     * @param basePath Path to use as the base when resolving imports
     * @returns Result of the evaluation
     */
    evaluate(source: string): number | string {
        const scanner = new Scanner(source);
        const tokens = scanner.scanTokens();
        if (scanner.errors.length > 0) {
            throw new MezcalRuntimeError("There were scanner errors", scanner.errors);
        }
        if (this.debug) console.log(JSON.stringify(tokens, null, 2));

        const parser = new Parser(tokens);
        const ast = parser.parse();
        if (parser.errors.length > 0) {
            throw new MezcalRuntimeError("There were parser errors", parser.errors);
            // parser.errors.map(e => ({ message: e.message, line: e.token.line })));
        }
        if (this.debug) console.log(JSON.stringify(ast, null, 2));
        if (this.debug) console.log(new AstPrinter().print(ast[0]));

        return this.interpreter.interpret(ast);
    }
}

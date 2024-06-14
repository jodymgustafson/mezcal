import { ScanError } from "./common/lexical-scanner";
import { nativeFunctions } from "./internal/native-functions";
import { Interpreter } from "./interpreter";
import { InterpreterContext } from "./interpreter-context";
import { ParseError, Parser } from "./parser";
import { Scanner } from "./scanner";

export class MezcalRuntimeError<T = ScanError | ParseError> extends Error {
    constructor(msg: string, readonly errors: T[]) {
        super(msg);
    }
}

/**
 * Defines a class that has an interpreter that is used to execute any number of statements
 * while keeping the state
 */
export class Runtime {
    constructor(readonly interpreter = new Interpreter(new InterpreterContext(undefined, undefined, nativeFunctions))) { }

    /**
     * Runs Mezcal source code in the interpreter
     * @param source Mezcal source code
     * @returns Result of the run
     */
    evaluate(source: string): number {
        const scanner = new Scanner(source);
        const tokens = scanner.scanTokens();
        if (scanner.errors.length > 0) {
            throw new MezcalRuntimeError("There were scanner errors", scanner.errors);
        }

        // console.log(JSON.stringify(tokens, null, 2));
        const parser = new Parser(tokens);
        const ast = parser.parse();
        if (parser.errors.length > 0) {
            throw new MezcalRuntimeError("There were parser errors", parser.errors);
            // parser.errors.map(e => ({ message: e.message, line: e.token.line })));
        }

        return this.interpreter.interpret(ast);
    }
}

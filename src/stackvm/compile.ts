import { Scanner } from "../scanner";
import { StackVmCompiler, StackVmCompilerOutput } from "./stackvm-compiler";

/**
 * Compiles Mezcal code into StackVM assembly code.
 * @param source Mezcal source code to compile
 * @returns Output of the compiler containing assembly code instructions
 */
export function compile(source: string): StackVmCompilerOutput {
    console.log("Scanning source...");
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    if (scanner.errors.length > 0) {
        console.error("There were scanner errors:");
        console.error(JSON.stringify(scanner.errors));
    }
    else {
        console.log("Compiling source...");//, JSON.stringify(tokens));
        const compiler = new StackVmCompiler(tokens);
        const instrs = compiler.parse();
        // console.log(JSON.stringify(instrs, null, 2));
        return instrs;
    }

    return {};
}

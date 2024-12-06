import { StackVmCompilerOutput } from "./stackvm-compiler";

/**
 * Performs tree shaking to remove unused functions from the output
 * @param code Output of the compiler
 * @returns Optimized output
 */
export function optimizeOutput(code: StackVmCompilerOutput): StackVmCompilerOutput {
    console.log("Optimizing output...");
    const fnNames = Object.keys(code);
    fnNames.forEach(fnName => {
        if (fnName !== "main") {
            if (!isFunctionCalled(fnName, code)) {
                console.log("Removing unused function: " + fnName);
                delete code[fnName];
            }
        }
    });

    return code;
}

function isFunctionCalled(fnName: string, code: StackVmCompilerOutput): boolean {
    const fnNames = Object.keys(code);
    for (const name of fnNames) {
        const fn = code[name];
        if (fn.findIndex(instr => instr === "call " + fnName) >= 0) {
            return true;
        }
    }

    return false;
}
import { StackVmCompilerOutput } from "./stackvm-compiler";

/**
 * Creates the contents of the yaml file used by StackVM.
 * @param appName Name of the SVM app
 * @param compilerOutput Output from the compiler
 * @returns Yaml file contents as a string
 */
export function createSVM(appName: string, compilerOutput: StackVmCompilerOutput): string {
    const s = [
        "stackvm:",
        `  version: "0.0.0"`,
        `  name: ${appName}`,
        "  functions:",
    ];

    Object.keys(compilerOutput).forEach(fn => {
        s.push(
            `  - name: ${fn}`,
            `    description: ${fn}`,
            `    definition: |`
        );
        compilerOutput[fn].forEach(c => s.push(`      ${c}`));
    });

    return s.join("\n");
}

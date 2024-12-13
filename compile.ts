/*
    ___  ___                  _ 
    |  \/  |                 | |
    | .  . | ___ _______ __ _| |
    | |\/| |/ _ \_  / __/ _` | |
    | |  | |  __// / (_| (_| | |
    \_|  |_/\___/___\___\__,_|_|
                                
    🐛 The Mezcal to StackVM compiler.

    - Compiles a mezcal program and writes it to a yml file that can be run by StackVM 
    - Usage: compile [file] [to-file]?
    - If you don't specify a to-file it will append .yml to the input file name
*/

import fs from 'fs';
import { argv } from "process";
import { StackVmCompilerOutput } from "./src/stackvm/stackvm-compiler";
import { optimizeOutput } from "./src/stackvm/tree-shaker";
import { loadFile } from "./src/load-file";
import { compile } from "./src/stackvm/compile";
import { createSVM } from "./src/stackvm/create-svm";

(async () => {
    try {
        const filePath = argv[2];
        const toPath = argv[3] || filePath + ".yml";
        if (filePath) {
            const source = await loadFile(filePath);
            const output = compile(source);
            writeSVMFile(filePath, optimizeOutput(output), toPath);
            console.log("Completed successfully.")
        }
        else {
            console.log("Usage: compile [file] [to-file]?");
        }
    }
    catch (err) {
        console.error(err);
    }
})();

function writeSVMFile(appName: string, code: StackVmCompilerOutput, filePath: string): void {
    const svm = createSVM(appName, code);
    console.log("Writing StackVM file:", filePath);
    fs.writeFileSync(filePath, svm);
}

/*
    ___  ___                  _ 
    |  \/  |                 | |
    | .  . | ___ _______ __ _| |
    | |\/| |/ _ \_  / __/ _` | |
    | |  | |  __// / (_| (_| | |
    \_|  |_/\___/___\___\__,_|_|
                                
    🐛 The Mezcal to StackVM compiler.
*/

import { argv } from "process";
import { Scanner } from "./src/scanner";
import { StackVmCompiler, StackVmCompilerOutput } from "./src/stackvm/stackvm-compiler";
import fs from 'fs';
import path from 'node:path';
import { optimizeOutput } from "./src/stackvm/tree-shaker";
const readline = require('readline');

(async () => {
    try {
        const filePath = argv[2];
        const toPath = argv[3] || filePath + ".yml";
        if (filePath) {
            const source = await load(filePath);
            const code = compile(source);
            writeSVMFile(filePath, optimizeOutput(code), toPath);
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

/**
 * Load the file and expands any imports
 * @param filePath The file to load
 * @returns Result of the evaluation
 */
async function load(filePath: string, basePath = "./"): Promise<string> {
    try {
        // const contents = fs.readFileSync(filePath, 'utf8');
        let contents = "";
        const relPath = path.join(basePath, filePath);
        if (!fs.existsSync(relPath)) {
            throw new Error("Path doesn't exist " + relPath);
        }

        const rl = readline.createInterface({
            input: fs.createReadStream(relPath),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            if (/^\s*import\s+".+"$/.test(line)) {
                const importPath = line.split("import")[1].trim().slice(1, -1);
                console.log("Importing file", importPath);
                contents += await load(importPath, filePath);
            }
            else {
                contents += line + "\n";
            }
        };

        // console.log(contents);
        return contents;
    }
    catch (err) {
        console.error(err);
        throw new Error("Error loading file: " + err.message);
    }
}

function writeSVMFile(appName: string, code: StackVmCompilerOutput, filePath: string): void {
    const s = [
        "stackvm:",
        `  version: "0.0.0"`,
        `  name: ${appName}`,
        "  functions:",
    ];

    Object.keys(code).forEach(fn => {
        s.push(`  - name: ${fn}`,
            `    description: ${fn}`,
            `    definition: |`
        );
        code[fn].forEach(c => s.push(`      ${c}`));
    });

    console.log("Writing StackVM file:", filePath);
    fs.writeFileSync(filePath, s.join("\n"));
}
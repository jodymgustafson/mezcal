import { argv } from "process";
import { Scanner } from "./src/scanner";
import { StackVmCompiler } from "./src/stackvm/parser";
import fs from 'fs';
import path from 'node:path';

try {
    const filePath = argv[2];
    if (filePath) {
        const source = load(filePath);
        const code = compile(source);
        if (code.length > 0) {
            writeSVMFile(code, filePath);
        }
    }
    else {
        console.log("Usage: compile [file]");
    }
}
catch (err) {
    console.error(err);
}

/**
 * Compiles an expression into StackVM assembly code.
 * @param expr Mathematical expression
 * @returns An array of assembly code instructions
 */
export function compile(expr: string): string[] {
    console.log("Scanning source...");
    const scanner = new Scanner(expr);
    const tokens = scanner.scanTokens();
    if (scanner.errors.length > 0) {
        console.error("There were scanner errors:");
        console.error(JSON.stringify(scanner.errors));
    }
    else {
        console.log("compiling source");//, JSON.stringify(tokens));
        const compiler = new StackVmCompiler(tokens);
        const instrs = compiler.parse();
        // console.log(JSON.stringify(instrs, null, 2));
        return instrs;
    }

    return [];
}

/**
 * Load the file and evaluates it
 * @param filePath The file to load
 * @returns Result of the evaluation
 */
function load(filePath: string): string {
    try {
        return fs.readFileSync(filePath, 'utf8');
    }
    catch (err) {
        console.error(err);
        throw new Error("Error loading file", err);
    }
}

function writeSVMFile(code: string[], filePath: string): void {
    const s = [
        "stackvm:",
        `  version: "0.0.0"`,
        `  name: ${filePath}`,
        "  functions:",
        "  - name: main",
        "    description: Entry function",
        "    definition: |"
    ];

    code.forEach(c => s.push(`      ${c}`));

    console.log("Writing yml file");
    fs.writeFileSync(filePath + ".yml", s.join("\n"));
}
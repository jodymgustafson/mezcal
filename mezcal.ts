/*
    ___  ___                  _ 
    |  \/  |                 | |
    | .  . | ___ _______ __ _| |
    | |\/| |/ _ \_  / __/ _` | |
    | |  | |  __// / (_| (_| | |
    \_|  |_/\___/___\___\__,_|_|
                                
    🐛 The Mezcal command line and REPL.
    - To run a program pass the path to a Mezcal program on the command line.
    - Otherwise it will enter REPL mode.
*/

import { readLineAsync } from "./src/internal/read-line";
import { Runtime } from "./src/runtime";
import { exit } from "process";
import { RuntimeError } from './src/interpreter';
import { Token } from './src/internal/token';
import { ParseError } from './src/parser';
import { ScanError } from "./src/internal/lexical-scanner";

const VERSION = require("../package.json").version;

const runtime = new Runtime();

if (process.argv.length > 2) {
    const arg = process.argv[2];
    if (arg === "-v") {
        showVersion();
    }
    else {
        runProgramFile(arg);
    }
    exit();
}

// Enter REPL mode
const DEFAULT_PROMPT = "Mez> ";
const EDIT_PROMPT = "... ";

let quit = false;
let editMode = false;
let editorText = "";
let prompt = DEFAULT_PROMPT;

(async () => {
    // REPL loop
    showVersion();
    console.log("Type ':help' for more information.");
    while (!quit) {
        try {
            let expr = await readLineAsync(prompt);
            expr = checkCommand(expr);
            if (expr) {
                try {
                    const value = runtime.evaluate(expr);
                    runtime.evaluate(`result=${value}`);
                    console.log(JSON.stringify(value));
                }
                catch (err) {
                    logError(err);
                }
            }
        }
        catch (err) {
            logError(err);
        }
    }

    console.log("👋 bye");
    exit();
})();

function logError(err: any) {
    // console.log(JSON.stringify(err))
    if (err instanceof RuntimeError) {
        let msg = `ERROR "${err.message}"`;
        const token = err.operator as Token;
        if (token && token.lexeme !== "error") {
            msg += ` On line ${token.line}`;
            if (token.lexeme) {
                msg += ` near ${token.lexeme}`;
            }
        }
        console.error(msg);
    }
    else {
        // Scanner or parser error
        console.error("ERROR", err.message);
        if (err.errors) {
            for (const e of err.errors) {
                if (e instanceof ParseError)
                    console.error(e.message, "On line", e.token.line);
                else if (e instanceof ScanError)
                    console.error(e.message, "On line", e.line);
                else
                    console.error(e.message);
            }
        }
    }
}

/**
 * Checks for a command input by user
 * @param expr The expression entered
 * @returns The expression to evaluate if the command should be evaluated, or empty string
 */
function checkCommand(expr: string): string {
    if (expr === ":b" || expr === ":break" || expr === "") {
        if (editMode) {
            editMode = false;
            prompt = DEFAULT_PROMPT;
            return editorText;
        }
    }
    else if (editMode) {
        editorText += "\n" + expr;
    }
    else if (expr === ":q" || expr === ":quit") {
        quit = true;
    }
    else if (expr.startsWith(":l ") || expr.startsWith(":load ")) {
        const filePath = expr.split(" ")[1];
        console.log(runtime.load(filePath));
        return "";
    }
    else if (expr === ":e" || expr === ":editor") {
        editMode = true;
        editorText = "";
        prompt = EDIT_PROMPT;
    }
    else if (expr === ":h" || expr === ":help") {
        showHelp();
    }
    else if (expr === ":v" || expr === ":version") {
        showVersion();
    }
    else if (expr.startsWith(":")) {
        console.error("Unknown command", expr);
    }
    else {
        // No command, evaluate the expression
        return expr;
    }

    return "";
}

function runProgramFile(filePath: string): void {
    try {
        console.log(runtime.load(filePath));
    }
    catch (err) {
        logError(err);
    }
}

function showHelp(): void {
    console.log(":h(elp) => Show help");
    console.log(":q(uit) => Quit");
    console.log(":l(oad) path/to/file => Loads a Mezcal file and executes it");
    console.log(":e(ditor) => Enter multiline edit mode");
    console.log(":b(reak) => Exit multiline edit mode");
    console.log(":v(ersion) => Show version");
    console.log("The 'result' variable will always be set to the result of the last evaluation.");
}

function showVersion(): void {
    console.log("🐛 Mezcal v" + VERSION);
}

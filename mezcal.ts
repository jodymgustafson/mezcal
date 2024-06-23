/*
 __  __  ____  ____  ___    __    __   
(  \/  )( ___)(_   )/ __)  /__\  (  )  
 )    (  )__)  / /_( (__  /(__)\  )(__ 
(_/\/\_)(____)(____)\___)(__)(__)(____)

___  ___                  _ 
|  \/  |                 | |
| .  . | ___ _______ __ _| |
| |\/| |/ _ \_  / __/ _` | |
| |  | |  __// / (_| (_| | |
\_|  |_/\___/___\___\__,_|_|
                            
The Mezcal REPL.
To run a program pass the path to a Mezcal program on the command line.
Otherwise it will enter REPL mode.
*/
import fs from 'fs';
import { readLineAsync } from "./src/internal/read-line";
import { Runtime } from "./src/runtime";
import { exit } from "process";
import { RuntimeError } from './src/interpreter';
import { Token } from './src/common/token';
import { ParseError } from './src/parser';
import { ScanError } from "./src/common/lexical-scanner";

const runtime = new Runtime();

if (process.argv.length > 2) {
    const source = fs.readFileSync(process.argv[2], 'utf8');
    if (source) {
        try {
            const v = runtime.evaluate(source);
            console.log(JSON.stringify(v));
        }
        catch (err) {
            logError(err);
        }
    }
    exit();
}

let quit = false;
let editMode = false;
let editorText = "";
let prompt = "Mez> ";
let basePath = ".";

(async () => {
    // REPL loop
    console.log("🚀 Mezcal v1.0.0");
    console.log("Type ':help' for more information.");
    while (!quit) {
        try {
            let expr = await readLineAsync(prompt);
            expr = checkCommand(expr);
            if (expr) {
                try {
                    const value = runtime.evaluate(expr);
                    console.log(JSON.stringify(value));
                }
                catch (err) {
                    logError(err);
                }
            }
        }
        catch (err) {
            logError(err);
            // console.error(err.message);
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

function checkCommand(expr: string): string {
    if (expr.startsWith(":")) {
        if (expr === ":b" || expr === ":break" || (editMode && expr === "")) {
            if (editMode) {
                editMode = false;
                prompt = ">";
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
            prompt = "...";
        }
        else if (expr === ":h" || expr === ":help") {
            showHelp();
        }

        console.error("Unknown command", expr);
    }
    else {
        // No command, evaluate the expression
        return expr;
    }
}

function showHelp() {
    console.log(":h(elp) => Show help");
    console.log(":q(uit) => Quit");
    console.log(":l(oad) path/to/file => Loads a Mezcal file and executes it");
    console.log(":e(ditor) => Enter multiline edit mode");
    console.log(":b(reak) => Exit multiline edit mode");
}

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

const mezcal = new Runtime();

if (process.argv.length > 2) {
    const source = fs.readFileSync(process.argv[2], 'utf8');
    if (source) {
        try {
            const v = mezcal.evaluate(source);
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
let prompt = ">";

(async () => {
    // REPL loop
    console.log("🚀 Mezcal v1.0.0");
    console.log("Type ':help' for more information.");
    while (!quit) {
        try {
            let expr = await readLineAsync(prompt + " ");
            expr = checkCommand(expr);
            if (expr) {
                try {
                    const value = mezcal.evaluate(expr);
                    console.log(JSON.stringify(value));
                }
                catch (err) {
                    logError(err);
                }
            }
        }
        catch (err) {
            console.error(err.message);
        }
    }

    console.log("👋 bye");
    exit();
})();

function logError(err: any) {
    if (err instanceof RuntimeError) {
        const token = err.operator as Token;
        console.error("ERROR", err.message, "On line", token.line, "near", token.lexeme);
    }
    else {
        console.error("ERROR", err.message);
        if (err.errors) {
            for (const e of err.errors) {
                console.error(e.message);
            }
        }
    }
}

function checkCommand(expr: string): string {
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
        return fs.readFileSync(filePath, 'utf8');
    }
    else if (expr === ":e" || expr === ":editor") {
        editMode = true;
        editorText = "";
        prompt = "...";
    }
    else if (expr === ":h" || expr === ":help") {
        showHelp();
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

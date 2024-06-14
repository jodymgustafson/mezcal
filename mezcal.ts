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

const mezcal = new Runtime();

if (process.argv.length > 2) {
    const data = fs.readFileSync(process.argv[2], 'utf8');
    if (data) {
        try {
            const v = mezcal.evaluate(data);
            console.log(JSON.stringify(v));
        }
        catch (err) {
            console.error(err.message);
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
                    console.error(err.message);
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
        return loadFile(expr);
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

function loadFile(expr: string): string {
    const filePath = expr.split(" ")[1];
    return fs.readFileSync(filePath, 'utf8');
}

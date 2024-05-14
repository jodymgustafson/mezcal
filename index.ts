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
                            
*/
import fs from 'fs';
import { readLineAsync } from "./src/internal/read-line";
import { Runtime } from "./src/runtime";
import { exit } from "process";

if (process.argv.length > 2) {
    const data = fs.readFileSync(process.argv[2], 'utf8');
    if (data) {
        const mezcal = new Runtime();
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

(async () => {
    // REPL loop
    const mezcal = new Runtime();
    console.log("🚀 Mezcal v1.0.0");
    console.log("Type ':h' for more information.");
    let quit = false;
    while (!quit) {
        try {
            const expr = await readLineAsync("> ");
            if (expr === ":q") {
                quit = true;
            }
            else if (expr === ":h") {
                showHelp();
            }
            else {
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

function showHelp() {
    console.log(":h => Show help");
    console.log(":q => Quit");
}
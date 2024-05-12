// const program =`REM This is a program
// start:
//     s$ = "Hello World!"
//     x = 23 + 1.5
//     print s$;
//     if x<=23 print x
// end:`;
//REM End of the program`;

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

import readline from 'readline';
import { Runtime } from "./src/runtime";
import { exit } from "process";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function readLineAsync(message): Promise<string> {
    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            resolve(answer);
        });
    });
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
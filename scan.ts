/*
    ___  ___                  _ 
    |  \/  |                 | |
    | .  . | ___ _______ __ _| |
    | |\/| |/ _ \_  / __/ _` | |
    | |  | |  __// / (_| (_| | |
    \_|  |_/\___/___\___\__,_|_|
                                
    🐛 The Mezcal lexical scanner.

    - Runs the lexical scanner on a Mezcal source file and outputs the tokens to the console. 
    - Usage: scan [file]
*/

import { argv } from "process";
import { Scanner } from "./src/scanner";
import { loadFile } from './src/load-file';

(async () => {
    try {
        const filePath = argv[2];
        if (filePath) {
            const source = await loadFile(filePath);
            scan(source);
            console.log("Completed successfully.")
        }
        else {
            console.log("Usage: scan [file]");
        }
    }
    catch (err) {
        console.error(err);
    }
})();

function scan(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    if (scanner.errors.length > 0) {
        console.error("ERRORS:", JSON.stringify(scanner.errors.map((e) => ({
            message: e.message,
            line: e.line
        })), null, 2));
    }
    else console.log(JSON.stringify(tokens, null, 2));
}

import fs from 'fs';
import path from 'node:path';
import readline from 'readline';

const reImport = /^\s*import\s+".+"$/;

/**
 * Load a Mezcal file from the file system using node and expands any imports
 * @param filePath The file to load
 * @returns Result of the evaluation
 */
export async function loadFile(filePath: string, basePath = "./"): Promise<string> {
    try {
        let contents = "";
        const relPath = path.join(path.dirname(basePath), filePath);
        if (!fs.existsSync(relPath)) {
            throw new Error("Path doesn't exist " + relPath);
        }

        const rl = readline.createInterface({
            input: fs.createReadStream(relPath),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            if (reImport.test(line)) {
                // Remove import and quotes from path
                const importPath = line.split("import")[1].trim().slice(1, -1);
                console.log("Importing file", importPath);
                contents += await loadFile(importPath, relPath);
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

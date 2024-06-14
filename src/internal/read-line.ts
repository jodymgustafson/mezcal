import readline from 'readline';
const prompt = require("prompt-sync")();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function readLineAsync(message: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            resolve(answer);
        });
    });
}

export function readLineSync(message: string): string {
    return prompt(message + " ");
}
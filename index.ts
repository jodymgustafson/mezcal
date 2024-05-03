import { AstPrinter } from "./src/ast-printer";
import { Scanner } from "./src/scanner";
import { Parser } from "./src/parser";
import { Interpreter } from "./src/interpreter";

// const program =`REM This is a program
// start:
//     s$ = "Hello World!"
//     x = 23 + 1.5
//     print s$;
//     if x<=23 print x
// end:`;
//REM End of the program`;

// const scanner = new BasicScanner(program);
// const tokens = scanner.scanTokens();
// if (scanner.errors.length > 0) {
//     console.error(JSON.stringify(scanner.errors));
// }
// else {
//     console.log(JSON.stringify(tokens, null, 2));
// }

// -123 * (45.67)
// const expression = new BinaryExpr(
//     new UnaryExpr(getToken<MathTokenType>("MINUS", "-"), new LiteralExpr(123)),
//     getToken<MathTokenType>("STAR", "*"),
//     new GroupingExpr(new LiteralExpr(45.67)));

// const expr = "2 * (-3 + 1)^2";
// console.log("Parsing", expr);

// const scanner = new Scanner(expr);
// const tokens = scanner.scanTokens();
// if (scanner.errors.length > 0) {
//     console.error("There were scanner errors:");
//     console.error(JSON.stringify(scanner.errors));
// }
// else {
//     console.log(JSON.stringify(tokens, null, 2));
//     const parser = new Parser(tokens);
//     const ast = parser.parse();
//     if (parser.errors.length > 0) {
//         console.error("There were parser errors:");
//         console.error(parser.errors[0].message);
//     }
//     else {
//         console.log(new AstPrinter().print(ast));
//         const interpreter = new Interpreter();
//         interpreter.interpret(ast);
//     }
// }

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
    let quit = false;
    while (!quit) {
        try {
            const expr = await readLineAsync(">");
            if (expr === "q") {
                quit = true;
            }
            else {
                try {
                    console.log(mezcal.evaluate(expr));
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

    console.log("bye");
    exit();
})();

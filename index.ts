import { AstPrinter } from "./src/ast-printer";
import { MexScanner } from "./src/mex-scanner";
import { MexParser } from "./src/mex-parser";
import { MexInterpreter } from "./src/mex-interpreter";

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

const expr = "2 * (-3 + 1)^2";
console.log("Parsing", expr);

const scanner = new MexScanner(expr);
const tokens = scanner.scanTokens();
if (scanner.errors.length > 0) {
    console.error("There were scanner errors:");
    console.error(JSON.stringify(scanner.errors));
}
else {
    console.log(JSON.stringify(tokens, null, 2));
    const parser = new MexParser(tokens);
    const ast = parser.parse();
    if (parser.errors.length > 0) {
        console.error("There were parser errors:");
        console.error(parser.errors[0].message);
    }
    else {
        console.log(new AstPrinter().print(ast));
        const interpreter = new MexInterpreter();
        interpreter.interpret(ast);
    }
}

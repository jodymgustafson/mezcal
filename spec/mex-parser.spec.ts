import { LiteralExpr } from "../src/ast";
import { MexParser } from "../src/mex-parser";

describe("When use the mex parser", () => {
    it("should parse lexical tokens for 2^3", () => {
        // 2^3
        const parser = new MexParser([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'POWER', lexeme: '^', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`{"left":{"value":2},"operator":{"type":"POWER","lexeme":"^","line":1},"right":{"value":3}}`);
    });

    it("should parse lexical tokens for (2+x)*5^3", () => {
        const parser = new MexParser([
            { type: 'LEFT_PAREN', lexeme: '(', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'PLUS', lexeme: '+', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'x', line: 1, value: undefined },
            { type: 'RIGHT_PAREN', lexeme: ')', line: 1, value: undefined },
            { type: 'STAR', lexeme: '*', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '5', line: 1, value: 5 },
            { type: 'POWER', lexeme: '^', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
          ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`{"left":{"expr":{"left":{"value":2},"operator":{"type":"PLUS","lexeme":"+","line":1},"right":{"value":"x"}}},"operator":{"type":"STAR","lexeme":"*","line":1},"right":{"left":{"value":5},"operator":{"type":"POWER","lexeme":"^","line":1},"right":{"value":3}}}`);
    });

    it("should parse lexical tokens for sin(2*pi/x) * (3^x)", () => {
        // sin(2*pi/x) * (3^x)
        const parser = new MexParser([
            { type: 'IDENTIFIER', lexeme: 'sin', line: 1, value: undefined },
            // { type: 'STAR', lexeme: '*', line: 1, value: undefined },
            { type: 'LEFT_PAREN', lexeme: '(', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'STAR', lexeme: '*', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'pi', line: 1, value: undefined },
            { type: 'SLASH', lexeme: '/', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'x', line: 1, value: undefined },
            { type: 'RIGHT_PAREN', lexeme: ')', line: 1, value: undefined },
            { type: 'STAR', lexeme: '*', line: 1, value: undefined },
            { type: 'LEFT_PAREN', lexeme: '(', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'POWER', lexeme: '^', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'x', line: 1, value: undefined },
            { type: 'RIGHT_PAREN', lexeme: ')', line: 1, value: undefined },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`{"left":{"value":2},"operator":{"type":"POWER","lexeme":"^","line":1},"right":{"value":3}}`);
    });
});

import { LiteralExpr } from "../src/expr";
import { Parser } from "../src/parser";

describe("When use the mex parser", () => {
    it("should parse lexical tokens for 2^3", () => {
        const parser = new Parser([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'POWER', lexeme: '^', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`[{"expression":{"left":{"value":2},"operator":{"type":"POWER","lexeme":"^","line":1},"right":{"value":3}}}]`);
    });

    it("should parse lexical tokens for 2 + x", () => {
        const parser = new Parser([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'PLUS', lexeme: '+', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'x', line: 1, value: undefined },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`[{"expression":{"left":{"value":2},"operator":{"type":"PLUS","lexeme":"+","line":1},"right":{"name":"x"}}}]`);
    });

    it("should parse lexical tokens for (2+x)*5^3", () => {
        const parser = new Parser([
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
        expect(JSON.stringify(ast)).toEqual(`[{"expression":{"left":{"expr":{"left":{"value":2},"operator":{"type":"PLUS","lexeme":"+","line":1},"right":{"name":"x"}}},"operator":{"type":"STAR","lexeme":"*","line":1},"right":{"left":{"value":5},"operator":{"type":"POWER","lexeme":"^","line":1},"right":{"value":3}}}}]`);
    });

    it("should parse lexical tokens for sin(2*pi/x) * (3^x)", () => {
        const parser = new Parser([
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
        expect(JSON.stringify(ast)).toEqual(`[{"expression":{"name":"sin"}},{"expression":{"left":{"expr":{"left":{"left":{"value":2},"operator":{"type":"STAR","lexeme":"*","line":1},"right":{"name":"pi"}},"operator":{"type":"SLASH","lexeme":"/","line":1},"right":{"name":"x"}}},"operator":{"type":"STAR","lexeme":"*","line":1},"right":{"expr":{"left":{"value":3},"operator":{"type":"POWER","lexeme":"^","line":1},"right":{"name":"x"}}}}}]`);
    });

    it("should parse lexical tokens for let z = 3", () => {
        const parser = new Parser([
            { type: 'LET', lexeme: 'let', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'z', line: 1, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
          ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`[{"name":{"type":"IDENTIFIER","lexeme":"z","line":1},"initializer":{"value":3}}]`);
    });

    it("should parse lexical tokens for 'let a = 3\\na = a^2'", () => {
        const parser = new Parser([
            { type: 'LET', lexeme: 'let', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 1, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'POWER', lexeme: '^', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 2, value: 2 },
            { type: 'EOF', lexeme: '', line: 2, value: undefined }
          ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`[{"name":{"type":"IDENTIFIER","lexeme":"a","line":1},"initializer":{"value":3}},{"expression":{"name":"a","value":{"left":{"name":"a"},"operator":{"type":"POWER","lexeme":"^","line":2},"right":{"value":2}}}}]`);
    });
});

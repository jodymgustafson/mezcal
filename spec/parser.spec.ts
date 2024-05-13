import { LiteralExpr } from "../src/expr";
import { Parser } from "../src/parser";
import { Scanner } from "../src/scanner";

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
        expect(JSON.stringify(ast)).toEqual(`[{"expression":{"left":{"callee":{"name":"sin"},"paren":{"type":"RIGHT_PAREN","lexeme":")","line":1},"args":[{"left":{"left":{"value":2},"operator":{"type":"STAR","lexeme":"*","line":1},"right":{"name":"pi"}},"operator":{"type":"SLASH","lexeme":"/","line":1},"right":{"name":"x"}}]},"operator":{"type":"STAR","lexeme":"*","line":1},"right":{"expr":{"left":{"value":3},"operator":{"type":"POWER","lexeme":"^","line":1},"right":{"name":"x"}}}}}]`);
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

    it("should parse lexical tokens for\nlet a = 3\nbegin a = 2 end\n a = 1", () => {
        const parser = new Parser([
            { type: 'LET', lexeme: 'let', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 1, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'BEGIN', lexeme: 'begin', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 2, value: 2 },
            { type: 'END', lexeme: 'end', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 3, value: 1 },
            { type: 'EOF', lexeme: '', line: 3, value: undefined }
          ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(`[{"name":{"type":"IDENTIFIER","lexeme":"a","line":1},"initializer":{"value":3}},{"statements":[{"expression":{"name":"a","value":{"value":2}}}]},{"expression":{"name":"a","value":{"value":1}}}]`);
    });    

    it("should parse lexical tokens for\nlet a = 3\nif a < 0 then begin\na = 0\nend\nelse a = 1", () => {
        const parser = new Parser([
            { type: 'LET', lexeme: 'let', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 2, value: 3 },
            { type: 'IF', lexeme: 'if', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'LESS', lexeme: '<', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
            { type: 'THEN', lexeme: 'then', line: 3, value: undefined },
            { type: 'BEGIN', lexeme: 'begin', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 4, value: 0 },
            { type: 'END', lexeme: 'end', line: 5, value: undefined },
            { type: 'ELSE', lexeme: 'else', line: 6, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 6, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 6, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 6, value: 1 },
            { type: 'EOF', lexeme: '', line: 6, value: undefined },
          ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"a","line":2},"initializer":{"value":3}},{"condition":{"left":{"name":"a"},"operator":{"type":"LESS","lexeme":"<","line":3},"right":{"value":0}},"thenBranch":{"statements":[{"expression":{"name":"a","value":{"value":0}}}]},"elseBranch":{"expression":{"name":"a","value":{"value":1}}}}]`
        );
    });    

    it("should get an error when if has no then", () => {
        const parser = new Parser([
            { type: 'IF', lexeme: 'if', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'LESS', lexeme: '<', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
            // { type: 'THEN', lexeme: 'then', line: 3, value: undefined },
            { type: 'BEGIN', lexeme: 'begin', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 4, value: 0 },
            { type: 'END', lexeme: 'end', line: 5, value: undefined },
            { type: 'EOF', lexeme: '', line: 6, value: undefined },
        ]);
        expect(() => parser.parse()).toThrowError("Expect 'then' after if condition.");
    });

    it("should parse lexical tokens for\nlet a = 0\if (a < 0 or a > 0) then a=1\nelse a=-1", () => {
        const parser = new Parser([
            { type: 'LET', lexeme: 'let', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 2, value: 0 },
            { type: 'IF', lexeme: 'if', line: 3, value: undefined },
            { type: 'LEFT_PAREN', lexeme: '(', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'LESS', lexeme: '<', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
            { type: 'OR', lexeme: 'or', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'GREATER', lexeme: '>', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
            { type: 'RIGHT_PAREN', lexeme: ')', line: 3, value: undefined },
            { type: 'THEN', lexeme: 'then', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 3, value: 1 },
            { type: 'ELSE', lexeme: 'else', line: 4, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
            { type: 'MINUS', lexeme: '-', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 4, value: 1 },
            { type: 'EOF', lexeme: '', line: 4, value: undefined },
        ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"a","line":2},"initializer":{"value":0}},{"condition":{"expr":{"left":{"left":{"name":"a"},"operator":{"type":"LESS","lexeme":"<","line":3},"right":{"value":0}},"operator":{"type":"OR","lexeme":"or","line":3},"right":{"left":{"name":"a"},"operator":{"type":"GREATER","lexeme":">","line":3},"right":{"value":0}}}},"thenBranch":{"expression":{"name":"a","value":{"value":1}}},"elseBranch":{"expression":{"name":"a","value":{"operator":{"type":"MINUS","lexeme":"-","line":4},"right":{"value":1}}}}}]`
        );
    });

    it("should parse lexical tokens for\nlet a = 0\nlet b = a or 2", () => {
        const parser = new Parser([
            { type: 'LET', lexeme: 'let', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 2, value: 0 },
            { type: 'LET', lexeme: 'let', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'b', line: 3, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'OR', lexeme: 'or', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 3, value: 2 },
            { type: 'EOF', lexeme: '', line: 3, value: undefined },
        ]);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"a","line":2},"initializer":{"value":0}},{"name":{"type":"IDENTIFIER","lexeme":"b","line":3},"initializer":{"left":{"name":"a"},"operator":{"type":"OR","lexeme":"or","line":3},"right":{"value":2}}}]`
        );
    });

    it("should parse lexical tokens for\nlet a = 0\nwhile a < 100 begin\na = a + 1\nend", () => {
        const source = `
            let a = 0
            while a < 100 begin
                a = a + 1
            end`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"a","line":2},"initializer":{"value":0}},{"condition":{"left":{"name":"a"},"operator":{"type":"LESS","lexeme":"<","line":3},"right":{"value":100}},"body":{"statements":[{"expression":{"name":"a","value":{"left":{"name":"a"},"operator":{"type":"PLUS","lexeme":"+","line":4},"right":{"value":1}}}}]}}]`
        );
    });

    it("should parse lexical tokens for\nlet a = 0\nwhile a < 100 a = a + 1", () => {
        const source = `
            let a = 0
            while a < 100 a = a + 1`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"a","line":2},"initializer":{"value":0}},{"condition":{"left":{"name":"a"},"operator":{"type":"LESS","lexeme":"<","line":3},"right":{"value":100}},"body":{"expression":{"name":"a","value":{"left":{"name":"a"},"operator":{"type":"PLUS","lexeme":"+","line":3},"right":{"value":1}}}}}]`
        );
    });

    it("should parse lexical tokens for\nlet cnt = 0\nfor a = 0 to 100 step 1 cnt = cnt + 1", () => {
        const source = `
            let cnt = 0
            for a = 0 to 100 step 1 cnt = cnt + 1`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"cnt","line":2},"initializer":{"value":0}},{"initializer":{"name":"a","value":{"value":0}},"to":{"value":100},"step":{"value":1},"body":{"expression":{"name":"cnt","value":{"left":{"name":"cnt"},"operator":{"type":"PLUS","lexeme":"+","line":3},"right":{"value":1}}}}}]`
        );
    });

    it("should parse lexical tokens for\nlet cnt = 0\nfor a = 0 to 100 begin\ncnt = cnt + 1\nend", () => {
        const source = `
            let cnt = 0
            for a = 0 to 100 begin
                cnt = cnt + 1
            end`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"cnt","line":2},"initializer":{"value":0}},{"initializer":{"name":"a","value":{"value":0}},"to":{"value":100},"body":{"statements":[{"expression":{"name":"cnt","value":{"left":{"name":"cnt"},"operator":{"type":"PLUS","lexeme":"+","line":4},"right":{"value":1}}}}]}}]`
        );
    });

    it("should parse lexical tokens for\nlet time = clock()", () => {
        const source = `
            let time = clock()`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"time","line":2},"initializer":{"callee":{"name":"clock"},"paren":{"type":"RIGHT_PAREN","lexeme":")","line":2},"args":[]}}]`
        );
    });

    it("should parse lexical tokens for\nfunction add(a, b) begin a + b end\nadd(2, 3)", () => {
        const source = `
            function add(a, b) begin a + b end
            add(2, 3)`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(
            `[{"name":{"type":"IDENTIFIER","lexeme":"add","line":2},"params":[{"type":"IDENTIFIER","lexeme":"a","line":2},{"type":"IDENTIFIER","lexeme":"b","line":2}],"body":[{"expression":{"left":{"name":"a"},"operator":{"type":"PLUS","lexeme":"+","line":2},"right":{"name":"b"}}}]},{"expression":{"callee":{"name":"add"},"paren":{"type":"RIGHT_PAREN","lexeme":")","line":3},"args":[{"value":2},{"value":3}]}}]`
        );
    });
});

import { Scanner } from "../../src/scanner";
import { Parser } from "../../src/stack-vm/parser";

describe("When use stack-vm parser", () => {
    it("should throw an error when invalid token", () => {
        const parser = new Parser([
            { type: 'FOO' as any, lexeme: 'foo', line: 1, value: undefined },
            { type: 'EOF', lexeme: '', line: 1, value: undefined },
        ]);
        expect(() => parser.parse()).toThrowError(`Could not parse {"type":"FOO","lexeme":"foo","line":1}`);
    });

    it("should parse lexical tokens for 2^3", () => {
        const parser = new Parser([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'POWER', lexeme: '^', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        parser.parse();
        expect(parser.instructions).toEqual([":start", "push 2", "push 3", "call pow", "end"]);
    });

    it("should parse lexical tokens for 2 + x", () => {
        const parser = new Parser([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'PLUS', lexeme: '+', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'x', line: 1, value: undefined },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        parser.parse();
        expect(parser.instructions).toEqual([":start", "push 2", "get x", "add", "end"]);
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
        parser.parse();
        expect(parser.instructions).toEqual([":start",
            "push 2",
            "get x",
            "add",
            "push 5",
            "push 3",
            "call pow",
            "mul",
            "end"]);
    });

    it("should parse lexical tokens for\nsin(pi())", () => {
        const source = `sin(pi())`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        parser.parse();
        expect(parser.instructions).toEqual([":start",
            "call pi",
            "call sin",
            "end"]);
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
        expect(parser.parse()).toEqual([":start",
            "push 2",
            "call pi",
            "mul",
            "get x",
            "div",
            "call sin",
            "push 3",
            "get x",
            "call pow",
            "mul",
            "end"]);
    });

    it("should parse lexical tokens for let z = 3", () => {
        const parser = new Parser([
            { type: 'LET', lexeme: 'let', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'z', line: 1, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        expect(parser.parse()).toEqual([":start",
            "push 3",
            "put z",
            "pop",
            "end"]);
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
        expect(parser.parse()).toEqual([":start",
            "push 3",
            "put a",
            "pop",
            "get a",
            "push 2",
            "call pow",
            "put a",
            "pop",
            "end"]);
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
        expect(parser.parse()).toEqual([":start",
            "push 3",
            "put a",
            "pop",
            "push 2",
            "put a",
            "pop",
            "push 1",
            "put a",
            "pop",
            "end"]);
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
        expect(parser.parse()).toEqual([":start",
            "push 3",
            "put a",
            "pop",
            "get a",
            "push 0",
            "cmp",
            "bge __0",
            "pop",
            "push 0",
            "put a",
            "pop",
            "bra :__1",
            ":__0",
            "pop",
            "push 1",
            "put a",
            "pop",
            ":__1",
            "end"]);
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
        expect(() => parser.parse()).toThrowError("Expected THEN but instead found begin.")
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
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([
            {"left":{"name":"a"},"right":{"value":"0"},"name":"ASSIGN"},
            {"conditional":{
                "left":{
                    "left":{"name":"a"},"operator":"LESS","right":{"value":"0"}
                },
                "operator":"OR",
                "right":{
                    "left":{"name":"a"},"operator":"GREATER","right":{"value":"0"}
                }},
                "thenExpr":{"left":{"name":"a"},"right":{"value":"1"},"name":"ASSIGN"},
                "elseExpr":{"left":{"name":"a"},"right":{"operator":"MINUS","expression":{"value":"1"}},"name":"ASSIGN"}
            }
        ]));
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
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([
            {"left":{"name":"a"},"right":{"value":"0"},"name":"ASSIGN"},
            {"left":{"name":"b"},"right":{
                "left":{"name":"a"},"operator":"OR","right":{"value":"2"}
            },"name":"ASSIGN"}
        ]));
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
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([
            {"left":{"name":"a"},"right":{"value":"0"},"name":"ASSIGN"},
            {
                "conditional":{"left":{"name":"a"},"operator":"LESS","right":{"value":"100"}},
                "body":{
                    "left":{"name":"a"},
                    "right":{
                        "left":{"name":"a"},"operator":"PLUS","right":{"value":"1"}
                    },"name":"ASSIGN"
                }
            }
        ]));
    });

    it("should parse lexical tokens for\nlet a = 0\nwhile a < 100 a = a + 1", () => {
        const source = `
            let a = 0
            while a < 100 a = a + 1`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([
            {"left":{"name":"a"},"right":{"value":"0"},"name":"ASSIGN"},
            {
                "conditional":{"left":{"name":"a"},"operator":"LESS","right":{"value":"100"}},
                "body":{
                    "left":{"name":"a"},
                    "right":{
                        "left":{"name":"a"},"operator":"PLUS","right":{"value":"1"}
                    },"name":"ASSIGN"
                }
            }
        ]));
    });

    it("should parse lexical tokens for\nlet cnt = 0\nfor a = 0 to 100 step 1 cnt = cnt + 1", () => {
        const source = `
            let cnt = 0
            for a = 0 to 100 step 1 cnt = cnt + 1`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([
            {"left":{"name":"cnt"},"right":{"value":"0"},"name":"ASSIGN"},
            {
                "fromExpr":{"left":{"name":"a"},"right":{"value":"0"},"name":"ASSIGN"},
                "toExpr":{"value":"100"},
                "stepExpr":{"value":"1"},
                "body":{
                    "left":{"name":"cnt"},
                    "right":{
                        "left":{"name":"cnt"},"operator":"PLUS","right":{"value":"1"}
                    },"name":"ASSIGN"
                }
            }
        ]));
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
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([
            {"left":{"name":"cnt"},"right":{"value":"0"},"name":"ASSIGN"},
            {
                "fromExpr":{"left":{"name":"a"},"right":{"value":"0"},"name":"ASSIGN"},
                "toExpr":{"value":"100"},
                "body":{
                    "left":{"name":"cnt"},
                    "right":{
                        "left":{"name":"cnt"},"operator":"PLUS","right":{"value":"1"}
                    },"name":"ASSIGN"
                }
            }
        ]));
    });

    it("should parse lexical tokens for\nlet time = clock()", () => {
        const source = `
            let time = clock()`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([{
            "left":{"name":"time"},
            "right":{"method":{"name":"clock"},"args":[]},
            "name":"ASSIGN"
        }]));
    });

    it("should parse lexical tokens for a bodyless function", () => {
        const source = `
            function add(a, b) return a + b`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([{
            "fnName":"add",
            "params":["a","b"],
            "body":[{
                "left":{"name":"a"},
                "operator":"PLUS",
                "right":{"name":"b"}
            }]
        }]));
    });

    it("should parse lexical tokens for a function with return", () => {
        const source = `
            function add(a, b) begin
                return a + b
            end`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([{
            "fnName":"add",
            "params":["a","b"],
            "body":[{"expression":{"left":{"name":"a"},"operator":"PLUS","right":{"name":"b"}},"name":"RETURN"}]
        }]));
    });

    it("should parse lexical tokens for a function with multiple returns", () => {
        const source = `
            function fib(n) begin
                if (n <= 1) then return n
                return fib(n - 2) + fib(n - 1)
            end
            fib(3)`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        expect(JSON.stringify(ast)).toEqual(JSON.stringify([{
            "fnName":"fib",
            "params":["n"],
            "body":[
                {"conditional":{
                    "left":{"name":"n"},
                    "operator":"LESS_EQUAL",
                    "right":{"value":"1"}},
                    "thenExpr":{"expression":{"name":"n"},"name":"RETURN"}},
                {"expression":{
                    "left":{"method":{"name":"fib"},"args":[{"left":{"name":"n"},"operator":"MINUS","right":{"value":"2"}}]},
                    "operator":"PLUS",
                    "right":{"method":{"name":"fib"},"args":[{"left":{"name":"n"},"operator":"MINUS","right":{"value":"1"}}]}},
                    "name":"RETURN"
                }
            ]},
            {"method":{"name":"fib"},"args":[{"value":"3"}]
        }]));
    });
});

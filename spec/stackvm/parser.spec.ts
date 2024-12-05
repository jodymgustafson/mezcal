import { Scanner } from "../../src/scanner";
import { StackVmCompiler } from "../../src/stackvm/parser";

describe("When use stackvm parser", () => {
    it("should throw an error when invalid token", () => {
        const parser = new StackVmCompiler([
            { type: 'FOO' as any, lexeme: 'foo', line: 1, value: undefined },
            { type: 'EOF', lexeme: '', line: 1, value: undefined },
        ]);
        expect(() => parser.parse()).toThrowError(`Could not parse {"type":"FOO","lexeme":"foo","line":1}`);
    });

    it("should compile 2^3", () => {
        const parser = new StackVmCompiler([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'POWER', lexeme: '^', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        parser.parse();
        expect(parser.instructions).toEqual(["start:", "push 2", "push 3", "call pow", "end"]);
    });

    it("should compile 2 + x", () => {
        const parser = new StackVmCompiler([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'PLUS', lexeme: '+', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'x', line: 1, value: undefined },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        parser.parse();
        expect(parser.instructions).toEqual(["start:", "push 2", "get x", "add", "end"]);
    });

    it("should compile (-2+x)*5^3", () => {
        const source = `(-2+x)*5^3`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "push -2",
            "get x",
            "add",
            "push 5",
            "push 3",
            "call pow",
            "mul",
            "end"]);
    });

    it("should compile\nsin(pi())", () => {
        const source = `sin(pi())`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "call pi",
            "call sin",
            "end"]);
    });

    it("should compile sin(2*pi/x) * (3^x)", () => {
        const parser = new StackVmCompiler([
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
        expect(parser.parse()).toEqual(["start:",
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

    it("should compile let z = 3", () => {
        const parser = new StackVmCompiler([
            { type: 'LET', lexeme: 'let', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'z', line: 1, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
        expect(parser.parse()).toEqual(["start:",
            "push 3",
            "put z",
            "pop",
            "end"]);
    });

    it("should compile 'let a = 3\\na = a^2'", () => {
        const parser = new StackVmCompiler([
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
        expect(parser.parse()).toEqual(["start:",
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

    it("should compile\nlet a = 3\nbegin a = 2 end\n a = 1", () => {
        const parser = new StackVmCompiler([
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
        expect(parser.parse()).toEqual(["start:",
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

    it("should compile\nlet a = 3\nif a < 0 then begin\na = 0\nend\nelse a = 1", () => {
        const parser = new StackVmCompiler([
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
        expect(parser.parse()).toEqual(["start:",
            "push 3",
            "put a",
            "pop",
            "# begin if",
            "get a",
            "push 0",
            "cmp",
            "bge __0",
            "pop",
            "push 0",
            "put a",
            "pop",
            "bra __1",
            "__0: # else",
            "pop",
            "push 1",
            "put a",
            "pop",
            "__1: # end if",
            "end"]);
    });

    it("should get an error when if has no then", () => {
        const parser = new StackVmCompiler([
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
        expect(() => parser.parse()).toThrowError("Line 3: Expected THEN but instead found begin.")
    });

    // it("should compile\nlet a = 0\if (a < 0 or a > 0) then a=1\nelse a=-1", () => {
    //     const parser = new Parser([
    //         { type: 'LET', lexeme: 'let', line: 2, value: undefined },
    //         { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
    //         { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
    //         { type: 'NUMBER', lexeme: '0', line: 2, value: 0 },
    //         { type: 'IF', lexeme: 'if', line: 3, value: undefined },
    //         { type: 'LEFT_PAREN', lexeme: '(', line: 3, value: undefined },
    //         { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
    //         { type: 'LESS', lexeme: '<', line: 3, value: undefined },
    //         { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
    //         { type: 'OR', lexeme: 'or', line: 3, value: undefined },
    //         { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
    //         { type: 'GREATER', lexeme: '>', line: 3, value: undefined },
    //         { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
    //         { type: 'RIGHT_PAREN', lexeme: ')', line: 3, value: undefined },
    //         { type: 'THEN', lexeme: 'then', line: 3, value: undefined },
    //         { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
    //         { type: 'EQUAL', lexeme: '=', line: 3, value: undefined },
    //         { type: 'NUMBER', lexeme: '1', line: 3, value: 1 },
    //         { type: 'ELSE', lexeme: 'else', line: 4, value: undefined },
    //         { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
    //         { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
    //         { type: 'MINUS', lexeme: '-', line: 4, value: undefined },
    //         { type: 'NUMBER', lexeme: '1', line: 4, value: 1 },
    //         { type: 'EOF', lexeme: '', line: 4, value: undefined },
    //     ]);
    //     expect(parser.parse()).toEqual(["start:",
    //         "push 0", // a=0
    //         "put a",
    //         "pop",
    //         "get a", // a < 0
    //         "push 0",
    //         "cmp",
    //         "bge __0",
    //         "pop",
    //         "get a", // or a > 0
    //         "push 0",
    //         "cmp",
    //         "ble __0",
    //         "pop",
    //         "push 1", // a=1
    //         "put a",
    //         "pop",
    //         "bra __1",
    //         "__0:",
    //         "pop",
    //         "push -1", // a=-1
    //         "put a",
    //         "pop",
    //         "__1:",
    //         "end"]);
    // });

    it("should compile\nlet a = 0\nlet b = a or 2", () => {
        const parser = new StackVmCompiler([
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
        expect(parser.parse()).toEqual(["start:",
            "push 0", // a=0
            "put a",
            "pop",
            "get a", // b=a or 2
            "push 2",
            "or",
            "put b",
            "pop",
            "end"]);
    });

    it("should compile\nlet a = 0\nwhile a < 100 begin\na = a + 1\nend", () => {
        const source = `
            let a = 0
            while a < 100 begin
                a = a + 1
            end`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "push 0", // a=0
            "put a",
            "pop",
            "__0: # while",
            "get a",
            "push 100",
            "cmp", // a<100
            "bge __1",
            "pop",
            "get a", // a=a+1
            "push 1",
            "add",
            "put a",
            "pop",
            "bra __0",
            "__1: # while end",
            "pop",
            "end"]);
        });

    it("should compile\nlet a = 0\nwhile a < 100 a = a + 1", () => {
        const source = `
            let a = 0
            while a < 100 a = a + 1`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "push 0", // a=0
            "put a",
            "pop",
            "__0: # while",
            "get a",
            "push 100",
            "cmp", // a<100
            "bge __1",
            "pop",
            "get a", // a=a+1
            "push 1",
            "add",
            "put a",
            "pop",
            "bra __0", // wend
            "__1: # while end",
            "pop",
            "end"
        ]);
    });

    it("should compile\nlet cnt = 0\nfor a = 0 to 100 begin\ncnt = cnt + 1\nclock()\nend", () => {
        const source = `
            let cnt = 0
            for a = 0 to 100 begin
                cnt = cnt + 1
                clock()
            end`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "push 0", // a=0
            "put cnt",
            "pop",
            "push 0", // a=0
            "put a",
            "pop",
            "__0: # for a",
            "get a",
            "push 100",
            "cmp", // a<100
            "bgt __1",
            "pop",
            "get cnt",
            "push 1",
            "add",
            "put cnt",
            "pop",
            "call clock",
            "get a", // a=a+1
            "push 1",
            "add",
            "put a",
            "pop",
            "bra __0", // end for
            "__1: # end for a",
            "pop",
            "end"
        ]);
    });

    it("should compile\nlet cnt = 0\nfor a = 0 to 100 step 2 cnt = cnt + 1", () => {
        const source = `
            let cnt = 0
            for a = 0 to 100 step 2 cnt = cnt + 1`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "push 0", // a=0
            "put cnt",
            "pop",
            "push 0", // a=0
            "put a",
            "pop",
            "__0: # for a",
            "get a",
            "push 100",
            "cmp", // a<100
            "bgt __1",
            "pop",
            "get cnt",
            "push 1",
            "add",
            "put cnt",
            "pop",
            "get a", // a=a+1
            "push 2",
            "add",
            "put a",
            "pop",
            "bra __0", // end for
            "__1: # end for a",
            "pop",
            "end"
        ]);
    });

    it("should compile\nlet time = clock()", () => {
        const source = `
            let time = clock()`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "call clock",
            "put time",
            "pop",
            "end"
        ]);
    });

    // it("should compile a bodyless function", () => {
    //     const source = `
    //         function add(a, b) return a + b`;
    //     const tokens = new Scanner(source).scanTokens();
    //     const parser = new Parser(tokens);
    //     expect(parser.parse()).toEqual(["start:",
    //         "call clock",
    //         "put time",
    //         "pop",
    //         "end"
    //     ]);
    // });

    // it("should compile a function with return", () => {
    //     const source = `
    //         function add(a, b) begin
    //             return a + b
    //         end`;
    //     const tokens = new Scanner(source).scanTokens();
    //     const parser = new Parser(tokens);
    //     expect(parser.parse()).toEqual(["start:",
    //         "call clock",
    //         "put time",
    //         "pop",
    //         "end"
    //     ]);
    // });

    // it("should compile a function with multiple returns", () => {
    //     const source = `
    //         function fib(n) begin
    //             if (n <= 1) then return n
    //             return fib(n - 2) + fib(n - 1)
    //         end
    //         fib(3)`;
    //     const tokens = new Scanner(source).scanTokens();
    //     const parser = new Parser(tokens);
    //     expect(parser.parse()).toEqual(["start:",
    //         "call clock",
    //         "put time",
    //         "pop",
    //         "end"
    //     ]);
    // });

    
    it(`should compile\nlet a$ = "a"\nif a$ == "a" then print(a$ + "Answer is " + a$ + "!")`, () => {
        const source = `
            let a$ = "a"
            if a$ == "a" then print(a$ + "Answer is " + a$ + "!")`;
        const tokens = new Scanner(source).scanTokens();
        const parser = new StackVmCompiler(tokens);
        expect(parser.parse()).toEqual(["start:",
            "push \"a\"", // a=0
            "put a$",
            "pop",
            "# begin if",
            "get a$",
            "push \"a\"",
            "call str.compare", // a=="a"
            "push 0",
            "cmp",
            "bne __0",
            "pop",
            "get a$",
            `push "Answer is "`,
            "call str.concat",
            "get a$",
            "call str.concat",
            `push "!"`,
            "call str.concat",
            "call writeln",
            "pop",
            "__0: # end if",
            "pop",
            "end"
        ]);
    });

});

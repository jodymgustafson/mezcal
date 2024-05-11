import { Scanner } from "../src/scanner";

describe("When run mex scanner", () => {
    it("Should get correct tokens for 2^3", () => {
        const source = "2^3";
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
            { type: 'POWER', lexeme: '^', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
    });
    it("Should get correct tokens for (2+x)*5^3", () => {
        const source = "(2+x)*5^3";
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
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
    });
    it("Should get correct tokens for sin(2pi/x) * (3^x)", () => {
        const source = "sin(2pi/x) * (3^x)";
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'IDENTIFIER', lexeme: 'sin', line: 1, value: undefined },
            { type: 'LEFT_PAREN', lexeme: '(', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 1, value: 2 },
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
    });
    it("Should get correct tokens for factorial function", () => {
        const source = `# defines a factorial function
            define factorial(n):
                if n < 0 then error "Invalid value" 
                if n = 0 then return 1
                return n * factorial(n - 1)`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'DEFINE', lexeme: 'define', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'factorial', line: 2, value: undefined },
            { type: 'LEFT_PAREN', lexeme: '(', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'n', line: 2, value: undefined },
            { type: 'RIGHT_PAREN', lexeme: ')', line: 2, value: undefined },

            { type: 'IF', lexeme: 'if', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'n', line: 3, value: undefined },
            { type: 'LESS', lexeme: '<', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
            { type: 'THEN', lexeme: 'then', line: 3, value: undefined },
            { type: 'ERROR', lexeme: 'error', line: 3, value: undefined },
            { type: 'STRING', lexeme: '"Invalid value"', line: 3, value: 'Invalid value' },

            { type: 'IF', lexeme: 'if', line: 4, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'n', line: 4, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 4, value: 0 },
            { type: 'THEN', lexeme: 'then', line: 4, value: undefined },
            { type: 'RETURN', lexeme: 'return', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 4, value: 1 },
            
            { type: 'RETURN', lexeme: 'return', line: 5, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'n', line: 5, value: undefined },
            { type: 'STAR', lexeme: '*', line: 5, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'factorial', line: 5, value: undefined },
            { type: 'LEFT_PAREN', lexeme: '(', line: 5, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'n', line: 5, value: undefined },
            { type: 'MINUS', lexeme: '-', line: 5, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 5, value: 1 },
            { type: 'RIGHT_PAREN', lexeme: ')', line: 5, value: undefined },
            { type: 'EOF', lexeme: '', line: 5, value: undefined }
        ]);
    });

    it("Should get correct tokens for assignment let z = 3", () => {
        const source = "let z = 3";
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'LET', lexeme: 'let', line: 1, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'z', line: 1, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 1, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 1, value: 3 },
            { type: 'EOF', lexeme: '', line: 1, value: undefined }
        ]);
    });

    it("Should get correct tokens for assignment let a = 3\\na = a^2", () => {
        const source = `
            let a = 3
            a = a^2`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'LET', lexeme: 'let', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 2, value: 3 },

            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'POWER', lexeme: '^', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 3, value: 2 },
            { type: 'EOF', lexeme: '', line: 3, value: undefined }
        ]);
    });

    it("Should get correct tokens when using blocks:\nlet a = 3\nbegin a = 2 end\n a = 1", () => {
        const source = `
            let a = 3
            begin
                a = 2
            end
            a = 1`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'LET', lexeme: 'let', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 2, value: 3 },

            { type: 'BEGIN', lexeme: 'begin', line: 3, value: undefined },

            { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '2', line: 4, value: 2 },

            { type: 'END', lexeme: 'end', line: 5, value: undefined },

            { type: 'IDENTIFIER', lexeme: 'a', line: 6, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 6, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 6, value: 1 },
            { type: 'EOF', lexeme: '', line: 6, value: undefined }
        ]);
    });

    it("Should get correct tokens when using if-then-else:\nlet a = 3\nif a < 0 then a = 0\n else a = 1", () => {
        const source = `
            let a = 3
            if a < 0 then a = 0
            else a = 1`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'LET', lexeme: 'let', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '3', line: 2, value: 3 },

            { type: 'IF', lexeme: 'if', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'LESS', lexeme: '<', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },
            { type: 'THEN', lexeme: 'then', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 3, value: 0 },

            { type: 'ELSE', lexeme: 'else', line: 4, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 4, value: 1 },
            { type: 'EOF', lexeme: '', line: 4, value: undefined },
        ]);
    });

    it("Should get correct tokens when using if-then-block:\nlet a = 3\nif a < 0 then begin\na = 0\nend\nelse a = 1", () => {
        const source = `
            let a = 3
            if a < 0 then begin
                a = 0
            end
            else a = 1`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
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
    });

    it("should get correct tokens when using logical and/or in if:\nlet a = 0\if (a < 0 or a > 0) then a=1\nelse a=-1", () => {
        const source = `
            let a = 0
            if (a < 0 or a > 0) then a = 1
            else a = -1`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
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
    });

    it("should get correct tokens when using logical or:\nlet a = 0\nlet b = a or 2", () => {
        const source = `
            let a = 0
            let b = a or 2`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
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
    });

    it("should get correct tokens when using while:\nlet a = 0\nwhile a < 100 begin\na = a + 1\nend", () => {
        const source = `
            let a = 0
            while a < 100 begin
                a = a + 1
            end`;
        const tokens = new Scanner(source).scanTokens();
        expect(tokens).toEqual([
            { type: 'LET', lexeme: 'let', line: 2, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 2, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 2, value: undefined },
            { type: 'NUMBER', lexeme: '0', line: 2, value: 0 },

            { type: 'WHILE', lexeme: 'while', line: 3, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 3, value: undefined },
            { type: 'LESS', lexeme: '<', line: 3, value: undefined },
            { type: 'NUMBER', lexeme: '100', line: 3, value: 100 },
            { type: 'BEGIN', lexeme: 'begin', line: 3, value: undefined },

            { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
            { type: 'EQUAL', lexeme: '=', line: 4, value: undefined },
            { type: 'IDENTIFIER', lexeme: 'a', line: 4, value: undefined },
            { type: 'PLUS', lexeme: '+', line: 4, value: undefined },
            { type: 'NUMBER', lexeme: '1', line: 4, value: 1 },

            { type: 'END', lexeme: 'end', line: 5, value: undefined },
            { type: 'EOF', lexeme: '', line: 5, value: undefined },
        ]);
    });
});

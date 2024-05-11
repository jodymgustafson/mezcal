import { BaseLexicalScanner, BaseTokenType } from "./common/lexical-scanner";

export type MathTokenType = BaseTokenType | 
    "FUNCTION" | "LET" | "IF" | "THEN" | "ELSE" | "ERROR" | "RETURN" | "BEGIN" | "END" |
    "WHILE" | "FOR" | "TO" | "STEP" |
    "INPUT" | "PRINT" | "IMPORT" |
    "AND" | "OR" | "NOT" |
    "LEFT_PAREN" | "RIGHT_PAREN"|
    "COMMA" | "DOT" | "MINUS" | "PLUS" | "SLASH" | "STAR" | "POWER" |
    "EQUAL" | "EQUAL_EQUAL" | "NOT_EQUAL" | "GREATER" | "GREATER_EQUAL" | "LESS" | "LESS_EQUAL" |
    "IDENTIFIER" | "STRING" | "NUMBER" | "ERROR"
;

const KEYWORDS = [
    "function", "let", "if", "then", "else", "error", "return", "begin", "end",
    "while", "for", "to", "step",
    "input", "print", "import", 
    "and", "or", "not"
];

/**
 * A lexical scanner that parses Mezcal source code into an array of tokens
 */
export class Scanner extends BaseLexicalScanner<MathTokenType> {
    protected scanToken(char: string) {
        switch (char) {
            // whitespace
            case "\t":
            case "\r":
            case "\n":
            case " ": break;
            case "#": this.eatLine(); break;
            // operators
            case ",": this.addToken("COMMA", char); break;
            case "+": this.addToken("PLUS", char); break;
            case "-": this.addToken("MINUS", char); break;
            case "/": this.addToken("SLASH", char); break;
            case "*": this.addToken("STAR", char); break;
            case "^": this.addToken("POWER", char); break;
            case "(": this.addToken("LEFT_PAREN", char); break;
            case ")": this.addToken("RIGHT_PAREN", char); break;
            case "=": 
                this.peek("=") ? this.addToken("EQUAL_EQUAL", char + this.next()) :
                this.peek("<") ? this.addToken("LESS_EQUAL", char + this.next()) :
                this.peek(">") ? this.addToken("GREATER_EQUAL", char + this.next()) :
                this.addToken("EQUAL", char); break;
            case "<":
                this.peek("=") ? this.addToken("LESS_EQUAL", char + this.next()) :
                this.peek(">") ? this.addToken("NOT_EQUAL", char + this.next()) :
                this.addToken("LESS", char); break;
            case ">":
                this.peek("=") ? this.addToken("GREATER_EQUAL", char + this.next()) :
                this.peek("<") ? this.addToken("NOT_EQUAL", char + this.next()) :
                this.addToken("GREATER", char); break;
            case ".":
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9": this.addNumber(char); break;
            case "\"": this.addString(); break;
            default: this.addIdentifier(char); break;
        }
    }

    private addString() : void {
        for (let c = this.next(); c !== "\""; c = this.next()) {
            if (!c || c === "\n") {
                this.addError("Unterminated string: " + this.getLexeme());
                if (c === "\n") this.back();
                return;
            }
        }

        const lexeme = this.getLexeme();
        this.addToken("STRING", lexeme, lexeme.slice(1, -1));
    }

    private addIdentifier(char: string): void {
        if (this.isAlpha(char)) {
            while (this.isAlphaNumeric(this.peek())) {
                this.next();
            }

            // Check for type identifier
            const last = this.peek();
            if (last === "$" || last === "%") {
                this.next();
            }

            const lexeme = this.getLexeme();
            const type = this.getIdentifierType(lexeme);
            this.addToken(type, lexeme);
        }
        else {
            this.addError(`Syntax error near '${char}'`);
        }
    }

    /** Used for comments to eat all characters until the end of the line */
    private eatLine() {
        for (let c = this.peek(); c && c !== "\n"; c = this.peek()) {
            this.next();
        }
    }

    private getIdentifierType(lexeme: string): MathTokenType {
        return KEYWORDS.indexOf(lexeme) >= 0 ? lexeme.toUpperCase() as MathTokenType : "IDENTIFIER";
    }

    private addNumber(n: string): void {
        // Keep track of if we already have a decimal point
        let hasDecimal = (n === ".");
        while (this.isNumber(n = this.peek()) || n === ".") {
            if (n === ".") {
                if (hasDecimal) break;
                hasDecimal = true;
            }
            this.next();
        }

        const lexeme = this.getLexeme();
        this.addToken("NUMBER", lexeme, parseFloat(lexeme));
    }
}
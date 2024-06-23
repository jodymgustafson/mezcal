import { Token } from "./token";

export class ScanError extends Error {
    constructor(message: string, readonly line: number) {
        super(message);
    }
};

/** The token types that are common to all scanners */
export type BaseTokenType = "EOF";

/**
 * Defines a lexical scanner for taking a source stream and returning an array of tokens
 */
export interface LexicalScanner<TT> {
    scanTokens(): Token<TT>[];
}

/**
 * A base class for lexical scanners that keeps track of scan position and tokens.
 */
export abstract class BaseLexicalScanner<TT = BaseTokenType> implements LexicalScanner<TT> {
    // Current character index in the source code
    private idx = 0;
    // Start of the current token
    private tokenStartIdx = 0;
    // Current line number
    private line = 1;
    // List of tokens
    readonly tokens: Token<TT>[] = [];
    // List of errors
    readonly errors: ScanError[] = [];
    // The source code
    readonly source: string;

    constructor(source: string) {
        this.source = source;
    }

    scanTokens(): Token<TT>[] {
        while (!this.isAtEnd()) {
            this.tokenStartIdx = this.idx;
            const char = this.next();
            if (char === "\n") {
                ++this.line;
            }
            this.scanToken(char);
        }

        this.addToken("EOF" as TT, "");

        return this.tokens;
    }

    /**
     * Scans the next token
     */
    protected abstract scanToken(char: string): void;

    protected isAtEnd() {
        return this.idx >= this.source.length;
    }

    /** Gets the next char and advances the index */
    protected next(): string {
        return this.isAtEnd() ? "" : this.source.charAt(this.idx++);
    }

    /** Decrements the index and returns the char at that index  */
    protected back(): string {
        return this.idx === 0 ? "" : this.source.charAt(--this.idx);
    }

    /** Gets the next char without advancing the index */
    protected peek(): string;
    /** Checks the next char's value without advancing the index */
    protected peek(test: string): boolean;
    protected peek(test?: string): string | boolean {
        const c = this.isAtEnd() ? "" : this.source.charAt(this.idx);
        return test ? test === c : c;
    }

    /** Gets the current lexeme from the source */
    protected getLexeme() {
        return this.source.slice(this.tokenStartIdx, this.idx);
    }

    /** Helper method to add a token */
    protected addToken(type: TT, lexeme: string, value?: any): void {
        this.tokens.push({
            type,
            lexeme: lexeme,
            line: this.line,
            value
        });
    }

    protected addError(message: string): void {
        this.errors.push(new ScanError(message, this.line));
    }

    protected isAlpha(char: string): boolean {
        return /[a-zA-Z_]/.test(char);
    }

    protected isAlphaNumeric(char: string): boolean {
        return /[a-zA-Z_0-9]/.test(char);
    }

    protected isNumber(char: string): boolean {
        return (char >= "0" && char <= "9");
    }
}
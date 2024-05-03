import { Token } from "./common/token";
import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr, VariableExpr } from "./expr";
import { MathTokenType } from "./scanner";
import { ExpressionStmt, LetStmt, PrintStmt, Stmt } from "./stmt";

/**
 * Parses tokens from the scanner into an abstract syntax tree
 */
export class Parser {
    private current = 0;
    readonly errors: ParseError[] = [];

    /**
     * @param tokens The lexical tokens created by MathScanner
     */
    constructor(readonly tokens: Token<MathTokenType>[]) { }

    /**
     * Parses the lexical tokens into an abstract syntax tree
     * @returns Root element of the AST
     */
    parse(): Stmt[] {
        try {
            const statements: Stmt[] = [];
            while (!this.isAtEnd()) {
                statements.push(this.declaration());
            }
            return statements;
        }
        catch (err) {
            if (err instanceof ParseError)
                this.errors.push(err);
            throw err;
        }
    }

    private synchronize(): void {
        // TODO
    }

    private declaration(): Stmt {
        try {
            if (this.match("LET")) return this.letDeclaration();
            return this.statement();
        }
        catch (err) {
            this.synchronize();
        }
    }

    private letDeclaration(): Stmt {
        const name = this.consume("IDENTIFIER", "Expect variable name.");

        let initializer: Expr;
        if (this.match("EQUAL")) {
            initializer = this.expression();
        }

        return new LetStmt(name, initializer);
    }

    private statement(): Stmt {
        if (this.match("PRINT")) return this.printStatement();
        return this.expressionStatement();
    }

    private printStatement(): Stmt {
        const value = this.expression();
        return new PrintStmt(value);
    }

    private expressionStatement(): Stmt {
        const expr = this.expression();
        return new ExpressionStmt(expr);
    }

    private expression(): Expr {
        return this.equality();
    }

    private equality(): Expr {
        let expr = this.comparison();

        while (this.match("NOT_EQUAL", "EQUAL_EQUAL")) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private comparison(): Expr {
        let expr = this.term();

        while (this.match("LESS", "LESS_EQUAL", "GREATER", "GREATER_EQUAL")) {
            const operator = this.previous();
            const right = this.term();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private term(): Expr {
        let expr = this.factor();

        while (this.match("PLUS", "MINUS")) {
            const operator = this.previous();
            const right = this.factor();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private factor(): Expr {
        let expr = this.base();

        while (this.match("STAR", "SLASH")) {
            const operator = this.previous();
            const right = this.base();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private base(): Expr {
        let expr = this.unary();

        while (this.match("POWER")) {
            const operator = this.previous();
            const right = this.unary();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expr {
        if (this.match("PLUS", "MINUS")) {
            const operator = this.previous();
            const right = this.unary();
            return new UnaryExpr(operator, right);
        }

        return this.primary();
    }

    private primary(): Expr {
        if (this.match("STRING", "NUMBER")) {
            return new LiteralExpr(this.previous().value);
        }

        if (this.match("IDENTIFIER")) {
            return new VariableExpr(this.previous().lexeme);
        }

        if (this.match("LEFT_PAREN")) {
            const expr = this.expression();
            this.consume("RIGHT_PAREN", "Expect ')' after expression.");

            const group = new GroupingExpr(expr);
            return group;
        }
    }

    private consume(type: MathTokenType, message: string): Token {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }

    private error(token: Token, message: string): Error {
        return new ParseError(token, message);
    }

    private match(...types: MathTokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private check(type: MathTokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === "EOF";
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }
}

export class ParseError extends Error {
    constructor(readonly token: Token, message: string) {
        super(message);
    }
}
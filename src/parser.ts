import { Token } from "./common/token";
import { AssignExpr, BinaryExpr, CallExpr, Expr, GroupingExpr, LiteralExpr, LogicalExpr, UnaryExpr, VariableExpr } from "./expr";
import { MathTokenType } from "./scanner";
import { BlockStmt, ExpressionStmt, ForStmt, FunctionStmt, IfStmt, LetStmt, PrintStmt, ReturnStmt, Stmt, WhileStmt } from "./stmt";

const MAX_FN_ARGS_COUNT = 255;
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
            if (this.match("FUNCTION")) return this.functionDeclaration();
            if (this.match("LET")) return this.letDeclaration();
            return this.statement();
        }
        catch (err) {
            this.synchronize();
            throw err;
        }
    }

    private functionDeclaration(): FunctionStmt {
        const name = this.consume("IDENTIFIER", "Expect function name.");
        this.consume("LEFT_PAREN", "Expect '(' after function name.");
        const params: Token[] = [];
        if (!this.check("RIGHT_PAREN")) {
            do {
                if (params.length >= MAX_FN_ARGS_COUNT) {
                    this.error(this.peek(), "Can't have more than 255 parameters.");
                }

                params.push(
                    this.consume("IDENTIFIER", "Expect parameter name."));
            }
            while (this.match("COMMA"));
        }
        this.consume("RIGHT_PAREN", "Expect ')' after parameters.");

        this.consume("BEGIN", "Expect 'begin' before function body.");
        const body: Stmt[] = this.block();
        return new FunctionStmt(name, params, body);
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
        if (this.match("FOR")) return this.forStatement();
        if (this.match("IF")) return this.ifStatement();
        if (this.match("RETURN")) return this.returnStatement();
        if (this.match("WHILE")) return this.whileStatement();
        if (this.match("BEGIN")) return new BlockStmt(this.block());
        return this.expressionStatement();
    }

    private returnStatement(): Stmt {
        const keyword = this.previous();
        const value = this.expression();

        return new ReturnStmt(keyword, value);
    }

    private whileStatement(): Stmt {
        const condition = this.expression();
        const body = this.statement();

        return new WhileStmt(condition, body);
    }

    private forStatement(): Stmt {
        let initializer = this.assignment();
        this.consume("TO", "Expect 'to' in a for loop.");
        const toExpr = this.expression();

        let stepExpr: Expr;
        if (this.match("STEP")) {
            stepExpr = this.expression();
        }

        const body = this.statement();

        return new ForStmt(initializer, toExpr, stepExpr, body);
    }

    private ifStatement(): Stmt {
        const condition = this.expression();
        this.consume("THEN", "Expect 'then' after if condition.");

        const thenBranch = this.statement();
        let elseBranch = null;
        if (this.match("ELSE")) {
            elseBranch = this.statement();
        }

        return new IfStmt(condition, thenBranch, elseBranch);
    }

    private expressionStatement(): Stmt {
        const expr = this.expression();
        return new ExpressionStmt(expr);
    }

    private expression(): Expr {
        return this.assignment();
    }

    private assignment(): Expr {
        const expr = this.or();

        if (this.match("EQUAL")) {
            const equals = this.previous();
            const value = this.assignment();

            if (expr instanceof VariableExpr) {
                const name = (expr as VariableExpr).name;
                return new AssignExpr(name, value);
            }

            this.error(equals, "Invalid assignment target.");
        }

        return expr;
    }

    private or(): Expr {
        let expr = this.and();

        while (this.match("OR")) {
            const operator = this.previous();
            const right = this.and();
            expr = new LogicalExpr(expr, operator, right);
        }

        return expr;
    }

    private and(): Expr {
        let expr = this.equality();

        while (this.match("AND")) {
            const operator = this.previous();
            const right = this.equality();
            expr = new LogicalExpr(expr, operator, right);
        }

        return expr;
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

        return this.call();
    }

    private call(): Expr {
        let expr = this.primary();

        while (this.match("LEFT_PAREN")) {
            expr = this.finishCall(expr);
        }

        return expr;
    }

    private finishCall(callee: Expr): Expr {
        const args: Expr[] = [];
        if (!this.check("RIGHT_PAREN")) {
            do {
                if (args.length >= MAX_FN_ARGS_COUNT) {
                    this.error(this.peek(), "Can't have more than 255 arguments.");
                }
                args.push(this.expression());
            }
            while (this.match("COMMA"));
        }

        const paren = this.consume("RIGHT_PAREN", "Expect ')' after arguments.");

        return new CallExpr(callee, paren, args);
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

    private block(): Stmt[] {
        const statements: Stmt[] = [];

        while (!this.check("END") && !this.isAtEnd()) {
            statements.push(this.declaration());
        }

        this.consume("END", "Expect 'end' after block.");
        return statements;
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
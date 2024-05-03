import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr, ExprVisitor, VariableExpr } from "./expr";
import { Token } from "./common/token";
import { MathTokenType } from "./scanner";
import { BlockStmt, ExpressionStmt, FunctionStmt, IfStmt, LetStmt, PrintStmt, ReturnStmt, Stmt, StmtVisitor, WhileStmt } from "./stmt";

export class RuntimeError extends Error {
    constructor(readonly operator: Token, msg: string) {
        super(msg);
    }
}

export type InterpreterVariables = Record<string, (number | string)>;

/**
 * Class used to interpret Mezcal code
 */
export class Interpreter implements ExprVisitor<any>, StmtVisitor<any> {
    constructor(readonly variables: InterpreterVariables = {}) { }

    /**
     * Interprets the expression defined by the AST 
     * @param ast Top level of an abstract syntax tree
     * @returns Result of the expression
     */
    interpret(statements: Stmt[]): number {
        let value = 0;
        for (const stmt of statements) {
            value = this.execute(stmt);
        }
        // const value = this.evaluate(ast);
        // console.log("Result:", value);
        return value
    }

    private execute(stmt: Stmt): any {
        return stmt.accept(this);
    }

    private evaluate(expr: Expr): any {
        const result = expr.accept(this);
        return result;
    }

    visitExpressionStmt(stmt: ExpressionStmt): any {
        return this.evaluate(stmt.expression);
    }

    visitPrintStmt(stmt: PrintStmt): any {
        const value = this.evaluate(stmt.expression);
        console.log(value);
        return 0;
    }
    
    visitBlockStmt(stmt: BlockStmt): any {
        throw new Error("Method not implemented.");
    }
    visitFunctionStmt(stmt: FunctionStmt): any {
        throw new Error("Method not implemented.");
    }
    visitIfStmt(stmt: IfStmt): any {
        throw new Error("Method not implemented.");
    }
    visitReturnStmt(stmt: ReturnStmt): any {
        throw new Error("Method not implemented.");
    }

    visitLetStmt(stmt: LetStmt): any {
        let value = null;
        if (stmt.initializer) {
            value = this.evaluate(stmt.initializer);
        }

        this.variables[stmt.name.lexeme] = value;
    }

    visitWhileStmt(stmt: WhileStmt): any {
        throw new Error("Method not implemented.");
    }


    visitBinary(expr: BinaryExpr): any {
        const left = this.evaluate(expr.left);
        this.checkNumberOperand(expr.operator, left);

        const right = this.evaluate(expr.right);
        this.checkNumberOperand(expr.operator, right);

        switch (expr.operator.type as MathTokenType) {
            case "PLUS":
                return left + right;
            case "MINUS":
                return left - right;
            case "SLASH":
                return left / right;
            case "STAR":
                return left * right;
            case "POWER":
                return left ** right;
            case "GREATER":
                return left > right;
            case "GREATER_EQUAL":
                return left >= right;
            case "LESS":
                return left < right;
            case "LESS_EQUAL":
                return left <= right;
            case "NOT_EQUAL": return !this.isEqual(left, right);
            case "EQUAL_EQUAL": return this.isEqual(left, right);
        }

        throw new RuntimeError(expr.operator, "Unknown operator: " + expr.operator.type);
    }

    visitGrouping(expr: GroupingExpr): any {
        return this.evaluate(expr.expr);
    }

    visitLiteral(expr: LiteralExpr): any {
        return expr.value;
    }

    visitUnary(expr: UnaryExpr): any {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case "MINUS":
                this.checkNumberOperand(expr.operator, right);
                return -right;
        }

        // Unreachable.
        return null;
    }

    visitVariable(expr: VariableExpr) {
        const v = this.variables[expr.name];
        if (typeof v === "undefined") {
            throw new RuntimeError(null, `Undefined variable "${expr.name}"`);
        }

        return v;
    }

    private isEqual(a: any, b: any): boolean {
        if (a == null && b == null) return true;
        if (a == null) return false;

        return a === b;
    }

    private checkNumberOperand(operator: Token, operand: any): void {
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, "Operand must be a number.");
    }
}

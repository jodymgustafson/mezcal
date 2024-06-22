import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr, ExprVisitor, VariableExpr, AssignExpr, LogicalExpr, CallExpr } from "./expr";
import { Token } from "./common/token";
import { MathTokenType } from "./scanner";
import { BlockStmt, ErrorStmt, ExpressionStmt, ForStmt, FunctionStmt, IfStmt, LetStmt, ReturnStmt, Stmt, StmtVisitor, WhileStmt } from "./stmt";
import { InterpreterContext } from "./interpreter-context";
import { UserFunction } from "./user-function";
import { Return } from "./return";

export class RuntimeError extends Error {
    constructor(readonly operator: Token, msg: string) {
        super(msg);
    }
}

export interface Callable {
    isCallable: true;
    arity: number;
    call(args?: any[], interpreter?: Interpreter): any;
}

/**
 * Class used to interpret Mezcal code
 */
export class Interpreter implements ExprVisitor<any>, StmtVisitor<any> {
    readonly globals: InterpreterContext;

    constructor(private context: InterpreterContext = new InterpreterContext()) {
        this.globals = context;
    }

    /**
     * Interprets the expression defined by the AST 
     * @param ast Top level of an abstract syntax tree
     * @returns Result of the expression
     */
    interpret(statements: Stmt[]): number {
        let value = 0;
        try {
            for (const stmt of statements) {
                value = this.execute(stmt);
            }
        }
        catch (err) {
            // Check for a top level return statement
            if (err instanceof Return) value = err.value;
            else throw err;
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

    visitFunctionStmt(stmt: FunctionStmt): any {
        const fn = new UserFunction(stmt);
        this.context.setVariable(stmt.name.lexeme, fn);
        return 0;
    }

    visitIfStmt(stmt: IfStmt): any {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        }
        else if (stmt.elseBranch != null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }

    private isTruthy(value: any): boolean {
        return Boolean(value);
    }

    visitBlockStmt(stmt: BlockStmt): any {
        return this.executeBlock(stmt.statements, new InterpreterContext(this.context))
    }

    visitReturnStmt(stmt: ReturnStmt): any {
        let value: any;
        if (stmt.value != null) value = this.evaluate(stmt.value);

        // This will unwind the stack and get us out of the current function
        throw new Return(value);
    }

    visitErrorStmt(stmt: ErrorStmt) {
        let value: any;
        if (stmt.value != null) value = this.evaluate(stmt.value);
        throw new RuntimeError(stmt.keyword, value);
    }

    visitLetStmt(stmt: LetStmt): any {
        let value = null;
        if (stmt.initializer) {
            value = this.evaluate(stmt.initializer);
        }

        this.context.setVariable(stmt.name.lexeme, value, true);
        return value;
    }

    visitLogicalExpr(expr: LogicalExpr) {
        const left = this.evaluate(expr.left);

        if (expr.operator.type === "OR") {
            if (this.isTruthy(left)) return left;
        }
        else /* and */ {
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    visitAssign(expr: AssignExpr) {
        const value = this.evaluate(expr.value);
        this.context.setVariable(expr.name, value);
        return value;
    }

    visitWhileStmt(stmt: WhileStmt): any {
        let value: any;
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            value = this.execute(stmt.body);
        }
        return value;
    }

    visitForStmt(stmt: ForStmt) {
        let value: any;

        const varName = (stmt.initializer as VariableExpr).name;
        let i = this.evaluate(stmt.initializer);
        const to = this.evaluate(stmt.to);
        // If not defined then step is set to either 1 or -1
        const step = stmt.step ? this.evaluate(stmt.step) : (i <= to ? 1 : -1);
        if (step === 0) {
            throw new RuntimeError(null, "Step in for loop cannot be 0.");
        }
        if ((i <= to && step < 0) || (i >= to && step > 0)) {
            throw new RuntimeError(null, "Invalid step in for loop.");
        }

        while ((step > 0 && i <= to) || (step < 0 && i >= to)) {
            value = this.execute(stmt.body);
            this.context.setVariable(varName, i += step);
        }

        return value;
    }

    visitBinary(expr: BinaryExpr): any {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        // Some operators are invalid for strings
        // const checkNumber = ["MINUS", "SLASH", "STAR", "POWER"].includes(expr.operator.type);
        // if (checkNumber) this.checkNumberOperand(expr.operator, left);
        // if (checkNumber) this.checkNumberOperand(expr.operator, right);

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

    visitVariable(expr: VariableExpr): any {
        const value = this.context.getVariable(expr.name);
        if (value === undefined) {
            throw new RuntimeError(null, `Undefined variable "${expr.name}"`);
        }

        // If it's a function with not arguments then it is treated as a constant
        const c = value as Callable;
        if (c.isCallable) {
            if (c.arity === 0)
                return c.call();
            throw new RuntimeError(null, `Undefined variable "${expr.name}"`);
        }

        return value;
    }

    visitCallExpr(expr: CallExpr): any {
        const fnName = (expr.callee as VariableExpr).name;
        const fn = this.context.getVariable(fnName) as Callable;
        if (!fn) {
            throw new RuntimeError(null, `Undefined function "${fnName}"`);
        }
        if (!fn.isCallable) {
            throw new RuntimeError(expr.paren, `"${fnName}" is not a function.`);
        }

        if (expr.args.length !== fn.arity) {
            throw new RuntimeError(expr.paren,
                `Expected ${fn.arity} arguments but got ${expr.args.length}.`);
        }

        const args = [];
        for (const argument of expr.args) {
            args.push(this.evaluate(argument));
        }

        return fn.call(args, this) ?? 0;
    }

    private isEqual(a: any, b: any): boolean {
        if (a == null && b == null) return true;
        if (a == null) return false;

        return a == b;
    }

    private checkNumberOperand(operator: Token, operand: any): void {
        if (typeof operand === "number") return;
        throw new RuntimeError(operator, "Operand must be a number.");
    }

    executeBlock(statements: Stmt[], context: InterpreterContext): any {
        const previous = this.context;
        let value = 0;
        try {
            this.context = context;

            for (const statement of statements) {
                value = this.execute(statement);
            }
        }
        finally {
            this.context = previous;
        }

        return value;
    }
}

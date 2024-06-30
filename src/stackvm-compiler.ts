import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr, ExprVisitor, VariableExpr, LogicalExpr, CallExpr, AssignExpr } from "./internal/expr";
import { Token } from "./internal/token";
import { MathTokenType } from "./scanner";
import { BlockStmt, ErrorStmt, ExpressionStmt, ForStmt, FunctionStmt, IfStmt, LetStmt, ReturnStmt, Stmt, StmtVisitor, WhileStmt } from "./internal/stmt";

export class CompilerError extends Error {
    constructor(readonly operator: Token, msg: string) {
        super(msg);
    }
}

/**
 * Class used to compile an AST into StackVM assembly code 
 */
export class StackVMCompiler implements ExprVisitor<string>, StmtVisitor<string> {
    private code: string[];
    debug = true;

    compile(statements: Stmt[]): string[] {
        try {
            this.code = [":start"];
            for (const stmt of statements) {
                this.execute(stmt);
            }
            this.code.push("end");

            if (this.debug) console.log(JSON.stringify(this.code));
            return this.code;
        }
        catch (error) {
            if (error instanceof CompilerError) {
                console.error(error.message, "on line", error.operator.line);
            }
            else throw error;
        }
    }

    private execute(stmt: Stmt): any {
        return stmt.accept(this);
    }

    private evaluate(expr: Expr): any {
        return expr.accept(this);
    }

    visitLogicalExpr(expr: LogicalExpr): string {
        throw new Error("Method not implemented.");
    }

    visitBinary(expr: BinaryExpr): any {
        this.evaluate(expr.left);
        // this.checkNumberOperand(expr.operator, expr.left.value);

        this.evaluate(expr.right);
        // this.checkNumberOperand(expr.operator, right);

        switch (expr.operator.type as MathTokenType) {
            case "PLUS":
                this.code.push("add"); break;
            case "MINUS":
                this.code.push("sub"); break;
            case "SLASH":
                this.code.push("div"); break;
            case "STAR":
                this.code.push("mul"); break;
            case "POWER":
                this.code.push("call pow"); break;
            case "GREATER":
            case "GREATER_EQUAL":
            case "LESS":
            case "LESS_EQUAL":
            case "NOT_EQUAL":
            case "EQUAL_EQUAL":
                this.code.push("cmp"); break;
            default:
                throw new CompilerError(expr.operator, "Invalid operator: " + expr.operator.type);
        }
    }

    visitGrouping(expr: GroupingExpr): any {
        return this.evaluate(expr.expr);
    }

    visitLiteral(expr: LiteralExpr): any {
        const value = typeof expr.value === "string" ?
            `"${expr.value}"` : expr.value.toString();

        this.code.push(`push ${value}`);
    }

    visitUnary(expr: UnaryExpr): any {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case "MINUS":
                this.checkNumberOperand(expr.operator, (expr.right as LiteralExpr).value);
                this.code.push(`push -1`, "mul");
                return;
        }
    }

    visitExpressionStmt(stmt: ExpressionStmt): any {
        return this.evaluate(stmt.expression);
    }

    visitCallExpr(expr: CallExpr): string {
        for (const argument of expr.args) {
            this.evaluate(argument);
        }

        const fnName = (expr.callee as VariableExpr).name;
        this.code.push(`call ${fnName}`);
        return fnName;
    }

    visitAssign(expr: AssignExpr): any {
        const value = this.evaluate(expr.value);
        this.code.push(`put ${expr.name}`);
        return value;
    }
    visitVariable(expr: VariableExpr): any {
        // Check for no param functions which don't need parens
        if (expr.name === "pi") {
            this.code.push(`call pi`);
        }
        else {
            this.code.push(`get ${expr.name}`);
        }
        return expr.name;
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
    visitErrorStmt(stmt: ErrorStmt): string {
        throw new Error("Method not implemented.");
    }
    visitLetStmt(stmt: LetStmt): string {
        let value = null;
        if (stmt.initializer) {
            value = this.evaluate(stmt.initializer);
        }

        this.code.push(`put ${stmt.name.lexeme}`);
        return value;
    }
    visitWhileStmt(stmt: WhileStmt): any {
        throw new Error("Method not implemented.");
    }
    visitForStmt(stmt: ForStmt): string {
        throw new Error("Method not implemented.");
    }

    private isEqual(a: any, b: any): boolean {
        if (a == null && b == null) return true;
        if (a == null) return false;

        return a === b;
    }

    private checkNumberOperand(operator: Token, operand: any): void {
        if (typeof operand === "number") return;
        throw new CompilerError(operator, "Operand must be a number.");
    }
}
import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr, ExprVisitor, VariableExpr, LogicalExpr, CallExpr, AssignExpr } from "./internal/expr";
import { BlockStmt, ErrorStmt, ExpressionStmt, ForStmt, FunctionStmt, IfStmt, LetStmt, ReturnStmt, Stmt, StmtVisitor, WhileStmt } from "./internal/stmt";

/**
 * An implementation of Visitor used to print out an abstract syntax tree
 */
export class AstPrinter implements ExprVisitor<string>, StmtVisitor<string> {
    print(expr: Expr | Stmt): string {
        return expr.accept(this);
    }

    visitBlockStmt(stmt: BlockStmt): string {
        const parts = ["{"];
        for (const expr of stmt.statements) {
            parts.push(" ", expr.accept(this));
        }
        parts.push("}")
        return parts.join("");
    }

    visitExpressionStmt(stmt: ExpressionStmt): string {
        return "expr " + stmt.expression.accept(this);
    }
    visitFunctionStmt(stmt: FunctionStmt): string {
        return "function " + stmt.name;
    }
    visitIfStmt(stmt: IfStmt): string {
        return "if " + stmt.condition;
    }
    visitReturnStmt(stmt: ReturnStmt): string {
        throw new Error("Method not implemented.");
    }
    visitErrorStmt(stmt: ErrorStmt): string {
        throw new Error("Method not implemented.");
    }
    visitLetStmt(stmt: LetStmt): string {
        throw new Error("Method not implemented.");
    }
    visitWhileStmt(stmt: WhileStmt): string {
        throw new Error("Method not implemented.");
    }
    visitForStmt(stmt: ForStmt): string {
        throw new Error("Method not implemented.");
    }

    visitBinary(expr: BinaryExpr): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitGrouping(expr: GroupingExpr): string {
        return this.parenthesize("group", expr.expr);
    }

    visitLiteral(expr: LiteralExpr): string {
        return expr.value?.toString() ?? "undefined";
    }

    visitUnary(expr: UnaryExpr): string {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }

    visitVariable(expr: VariableExpr): string {
        return expr.name;
    }

    visitAssign(expr: AssignExpr): string {
        return expr.name
    }

    visitLogicalExpr(expr: LogicalExpr): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitCallExpr(expr: CallExpr): string {
        return (expr.callee as VariableExpr).name;
    }

    private parenthesize(name: string, ...exprs: Expr[]): string {
        const parts = ["(", name];
        for (const expr of exprs) {
            parts.push(" ", expr.accept(this));
        }
        parts.push(")")
        return parts.join("");
    }
}
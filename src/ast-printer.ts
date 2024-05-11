import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr, ExprVisitor, VariableExpr, LogicalExpr } from "./expr";

/**
 * An implementation of Visitor used to print out an abstract syntax tree
 */
export class AstPrinter implements ExprVisitor<string> {
    print(expr: Expr): string {
        return expr.accept(this);
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

    visitAssign(expr: VariableExpr): string {
        return expr.name
    }

    visitLogicalExpr(expr: LogicalExpr): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
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
import { BinaryExpr, Expr, GroupingExpr, IdentifierExpr, LiteralExpr, UnaryExpr, Visitor } from "./ast";
import { Token } from "./common/token";
import { MathTokenType } from "./mex-scanner";

export class RuntimeError extends Error {
    constructor(readonly operator: Token, msg: string) {
        super(msg);
    }
}

/**
 * Class used to compile Mex code into StackVM assembly code 
 */
export class MexInterpreter implements Visitor<any> {
    interpret(expression: Expr): void {
        try {
            const value = this.evaluate(expression);
            console.log("Result:", value);
        }
        catch (error) {
            if (error instanceof RuntimeError) {
                console.error(error.message, "on line", error.operator.line);
            }
            else throw error;
        }
    }

    private evaluate(expr: Expr): any {
        return expr.accept(this);
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

    visitIdentifier(expr: IdentifierExpr): any {
        throw new Error("Method not implemented.");
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

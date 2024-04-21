import { BinaryExpr, Expr, GroupingExpr, IdentifierExpr, LiteralExpr, UnaryExpr, Visitor } from "./expr";
import { Token } from "./common/token";
import { MathTokenType } from "./scanner";

export class CompilerError extends Error {
    constructor(readonly operator: Token, msg: string) {
        super(msg);
    }
}

/**
 * Class used to compile an AST into StackVM assembly code 
 */
export class StackVMCompiler implements Visitor<string> {
    private code: string[];

    compile(expression: Expr): string[] {
        try {
            this.code = [":start"];
            this.evaluate(expression);
            this.code.push("end");
            return this.code;
        }
        catch (error) {
            if (error instanceof CompilerError) {
                console.error(error.message, "on line", error.operator.line);
            }
            else throw error;
        }
    }

    private evaluate(expr: Expr): any {
        return expr.accept(this);
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
        throw new CompilerError(operator, "Operand must be a number.");
    }
}
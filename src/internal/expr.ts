import { Token } from "./token";
import { Stmt } from "./stmt";

export interface ExprVisitor<R> {
    visitBinary(expr: BinaryExpr): R;
    visitGrouping(expr: GroupingExpr): R;
    visitLiteral(expr: LiteralExpr): R;
    visitUnary(expr: UnaryExpr): R;
    visitVariable(expr: VariableExpr): R;
    visitAssign(expr: VariableExpr): R;
    visitLogicalExpr(expr: LogicalExpr): R;
    visitCallExpr(expr: CallExpr): R;
};

export interface Expr {
    accept<R>(visitor: ExprVisitor<R>): R;
};

export class BinaryExpr implements Expr {
    constructor(readonly left: Expr, readonly operator: Token, readonly right: Expr) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitBinary(this);
    }
};

export class GroupingExpr implements Expr {
    constructor(readonly expr: Expr) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitGrouping(this);
    }
};

export class LiteralExpr implements Expr {
    constructor(readonly value: any) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitLiteral(this);
    }
};

export class UnaryExpr implements Expr {
    constructor(readonly operator: Token, readonly right: Expr) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitUnary(this);
    }
};

export class VariableExpr implements Expr {
    constructor(readonly name: string) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitVariable(this);
    }
};

export class AssignExpr implements Expr {
    constructor(readonly name: string, readonly value: Expr) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitAssign(this);
    }
};

export class LogicalExpr implements Expr {
    constructor(readonly left: Expr, readonly operator: Token, readonly right: Expr) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitLogicalExpr(this);
    }
};

export class CallExpr implements Expr {
    constructor(readonly callee: Expr, readonly paren: Token, readonly args: Expr[]) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitCallExpr(this);
    }
};

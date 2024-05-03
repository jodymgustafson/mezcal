import { Token } from "./common/token";

export interface ExprVisitor<R> {
    visitBinary(expr: BinaryExpr): R;
    visitGrouping(expr: GroupingExpr): R;
    visitLiteral(expr: LiteralExpr): R;
    visitUnary(expr: UnaryExpr): R;
    visitIdentifier(expr: IdentifierExpr): R;
    visitVariableExpr(expr: VariableExpr): R;
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

export class IdentifierExpr implements Expr {
    constructor(readonly name: any) { }
    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitIdentifier(this);
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
        return visitor.visitVariableExpr(this);
    }
};

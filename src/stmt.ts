import { Token } from "./common/token";
import { Expr } from "./expr";

export interface StmtVisitor<R> {
    visitBlockStmt(stmt: Block): R;
    visitExpressionStmt(stmt: Expression): R;
    visitFunctionStmt(stmt: MezFunction): R;
    visitIfStmt(stmt: If): R;
    visitPrintStmt(stmt: Print): R;
    visitReturnStmt(stmt: Return): R;
    visitLetStmt(stmt: Let): R;
    visitWhileStmt(stmt: While): R;
}

export abstract class Stmt {
    abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class Block extends Stmt {
    constructor(readonly statements: Stmt[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitBlockStmt(this);
    }
}

export class Expression extends Stmt {
    constructor(readonly expression: Expr) {
      super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitExpressionStmt(this);
    }
}

export class MezFunction extends Stmt {
    constructor(readonly name: Token, readonly params: Token[], readonly body: Stmt[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitFunctionStmt(this);
    }
}

export class If extends Stmt {
    constructor(readonly condition: Expr, readonly thenBranch: Stmt, readonly elseBranch: Stmt) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitIfStmt(this);
    }
}

export class Print extends Stmt {
    constructor(readonly expression: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitPrintStmt(this);
    }
}

export class Return extends Stmt {
    constructor(readonly keyword: Token, readonly value: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitReturnStmt(this);
    }
}

export class Let extends Stmt {
    constructor(readonly name: Token, readonly initializer: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitLetStmt(this);
    }
}

export class While extends Stmt {
    constructor(readonly condition: Expr, body: Stmt) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitWhileStmt(this);
    }
}

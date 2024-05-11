import { Token } from "./common/token";
import { Expr } from "./expr";

export interface StmtVisitor<R> {
    visitBlockStmt(stmt: BlockStmt): R;
    visitExpressionStmt(stmt: ExpressionStmt): R;
    visitFunctionStmt(stmt: FunctionStmt): R;
    visitIfStmt(stmt: IfStmt): R;
    visitPrintStmt(stmt: PrintStmt): R;
    visitReturnStmt(stmt: ReturnStmt): R;
    visitLetStmt(stmt: LetStmt): R;
    visitWhileStmt(stmt: WhileStmt): R;
    visitForStmt(stmt: ForStmt): R;
}

export abstract class Stmt {
    abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class BlockStmt extends Stmt {
    constructor(readonly statements: Stmt[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitBlockStmt(this);
    }
}

export class ExpressionStmt extends Stmt {
    constructor(readonly expression: Expr) {
      super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitExpressionStmt(this);
    }
}

export class FunctionStmt extends Stmt {
    constructor(readonly name: Token, readonly params: Token[], readonly body: Stmt[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitFunctionStmt(this);
    }
}

export class IfStmt extends Stmt {
    constructor(readonly condition: Expr, readonly thenBranch: Stmt, readonly elseBranch: Stmt) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitIfStmt(this);
    }
}

export class PrintStmt extends Stmt {
    constructor(readonly expression: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitPrintStmt(this);
    }
}

export class ReturnStmt extends Stmt {
    constructor(readonly keyword: Token, readonly value: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitReturnStmt(this);
    }
}

export class LetStmt extends Stmt {
    constructor(readonly name: Token, readonly initializer: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitLetStmt(this);
    }
}

export class WhileStmt extends Stmt {
    constructor(readonly condition: Expr, readonly body: Stmt) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitWhileStmt(this);
    }
}

export class ForStmt extends Stmt {
    constructor(readonly initializer: Expr, readonly to: Expr, readonly step: Expr, readonly body: Stmt) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitForStmt(this);
    }
}

import { MezcalTokenType } from "../scanner";
import { isFunctionName } from "./is-function-name";
import { StackVmCompiler } from "./stackvm-compiler";
export abstract class Expression {

}

export class NameExpression extends Expression {
    constructor(readonly name: string) {
        super();
    }
}

export class NumberExpression extends Expression {
    constructor(readonly value: string) {
        super();
    }
}

export class StringExpression extends Expression {
    constructor(readonly value: string) {
        super();
    }
}

export class FunctionCallExpression extends Expression {
    constructor(readonly method: Expression, readonly args: Expression[]) {
        super();
    }
}

export class PrefixExpression extends Expression {
    constructor(readonly operator: MezcalTokenType, readonly expression: Expression) {
        super();
    }
}

export class OperatorExpression extends Expression {
    constructor(readonly left: Expression, readonly operator: MezcalTokenType, readonly right: Expression) {
        super();
    }
}

export class PostfixExpression extends Expression {
    constructor(readonly left: Expression, readonly operator: MezcalTokenType) {
        super();
    }
}

export class IfExpression extends Expression {
    constructor(
        readonly conditional: Expression,
        readonly thenExpr: Expression,
        readonly elseExpr: Expression,
    ) {
        super();
    }
}

export class WhileExpression extends Expression {
    constructor(readonly conditional: Expression, readonly body: Expression) {
        super();
    }
}

export class ForExpression extends Expression {
    constructor(
        readonly fromExpr: Expression,
        readonly toExpr: Expression,
        readonly stepExpr: Expression,
        readonly body: Expression) {
        super();
    }
}

export class FunctionExpression extends Expression {
    constructor(
        readonly fnName: string,
        readonly params: string[],
        readonly body: Expression[]
    ) {
        super();
    }
}

export class ReturnExpression extends Expression {
    readonly name = "RETURN";
    constructor(readonly expression) {
        super();
    }
}

export class AssignmentExpression extends Expression {
    readonly name = "ASSIGN";
    constructor(readonly left: NameExpression, readonly right: Expression) {
        super();
    }

    toStackVm(): string[] {
        return [`put ${(this.left as NameExpression).name}`, "pop"];
    }
}
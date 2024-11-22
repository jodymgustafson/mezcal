import { MezcalTokenType } from "../scanner";
import { isFunctionName } from "./is-function-name";

export abstract class Expression {
    toStackVm(): string {
        return "";
    }
}

export class NameExpression extends Expression {
    constructor(readonly name: string) {
        super();
    }

    toStackVm(): string {
        // if (isFunctionName(this.name)) {
        //     return `call ${this.name}`;
        // }
        return `get ${this.name}`
    }
}

export class NumberExpression extends Expression {
    constructor(readonly value: string) {
        super();
    }

    toStackVm(): string {
        return "push " + this.value;
    }
}

export class MethodCallExpression extends Expression {
    constructor(readonly method: Expression, readonly args: Expression[]) {
        super();
    }

    toStackVm(): string {
        // return `${this.args.map(a => a.toStackVm())}`
        return `${this.method.toStackVm()}`;
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

    toStackVm(): string {
        switch (this.operator) {
            case "PLUS": return "add";
            case "MINUS": return "sub";
            case "STAR": return "mul";
            case "SLASH": return "div";
            case "POWER": return "call pow";
        }
        return "nop";
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
    constructor(readonly left: Expression, readonly right: Expression) {
        super();
    }
}
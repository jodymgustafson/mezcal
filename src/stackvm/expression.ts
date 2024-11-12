import { MezcalTokenType } from "../scanner";

export abstract class Expression {
    toStackVm(): string {
        return "";
    }
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

export class MethodCallExpression extends Expression {
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

export class ConditionalExpression extends Expression {
    constructor(
        readonly conditional: Expression,
        readonly leftArm: Expression,
        readonly rightArm: Expression,
    ) {
        super();
    }
}

export class AssignmentExpression extends Expression {
    readonly name = "ASSIGN";
    constructor(readonly left: Expression, readonly right: Expression) {
        super();
    }
}
import { Token } from "../internal/token";
import { MezcalTokenType } from "../scanner";
import { AssignmentExpression, Expression, MethodCallExpression, NameExpression, NumberExpression, OperatorExpression, PostfixExpression, PrefixExpression } from "./expression";
import { Parser } from "./parser";

export enum Precedence {
    NOTHINGBURGER,
    ASSIGNMENT,
    CONDITIONAL,
    SUM,
    PRODUCT,
    EXPONENT,
    PREFIX,
    POSTFIX,
    CALL,
}

/** -- Prefix -- **/

export interface PrefixParselet {
    parse(parser: Parser, token: Token): Expression;
}

export class NameParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        return new NameExpression(token.lexeme);
    }
}

export class NumberParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        return new NumberExpression(token.lexeme);
    }
}

export class PrefixOperatorParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        return new PrefixExpression(
            token.type as MezcalTokenType,
            parser.parseExpression(this.precedence),
        );
    }

    getPrecedence(): number {
        return this.precedence;
    }

    precedence: number;

    constructor(precedence: number) {
        this.precedence = precedence;
    }
}

export class GroupParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        const expression = parser.parseExpression(parser.getPrecedence());
        parser.consume("RIGHT_PAREN");

        return expression;
    }
}

/** -- Infix -- **/

export interface InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression;
    getPrecedence(): number;
}

export class BinaryOperatorParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression {
        return new OperatorExpression(
            left,
            token.type as MezcalTokenType,
            parser.parseExpression(
                this.precedence - (this.isRightAssociative ? 1 : 0),
            ),
        );
    }

    getPrecedence(): number {
        return this.precedence;
    }

    precedence: number;
    isRightAssociative: boolean;

    constructor(precedence: number, isRightAssociative: boolean) {
        this.precedence = precedence;
        this.isRightAssociative = isRightAssociative;
    }
}

export class MethodCallParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression {
        const args: Expression[] = [];

        while (!parser.match("RIGHT_PAREN")) {
            do {
                args.push(parser.parseExpression());
            }
            while (parser.match("COMMA"));
        }

        return new MethodCallExpression(left, args);
    }

    getPrecedence(): number {
        return Precedence.CALL;
    }
}

export class AssignmentParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression {
        return new AssignmentExpression(
            left,
            parser.parseExpression(Precedence.ASSIGNMENT - 1),
        );
    }

    getPrecedence(): number {
        return Precedence.ASSIGNMENT;
    }
}

/** -- Postfix -- **/

export class PostfixOperatorParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: Token): Expression {
        return new PostfixExpression(left, token.type as MezcalTokenType);
    }

    getPrecedence(): number {
        return this.precedence;
    }

    precedence: number;

    constructor(precedence: number) {
        this.precedence = precedence;
    }
}

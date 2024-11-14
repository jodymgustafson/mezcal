import { Token } from "../internal/token";
import { MezcalTokenType } from "../scanner";
import { AssignmentExpression, Expression, ForExpression, FunctionExpression, IfExpression, MethodCallExpression, NameExpression, NumberExpression, OperatorExpression, PostfixExpression, PrefixExpression, ReturnExpression, WhileExpression } from "./expression";
import { Parser } from "./parser";

const MAX_FN_ARGS_COUNT = 255;

export enum Precedence {
    NOTHING,
    ASSIGNMENT,
    BOOLEAN,
    CONDITIONAL,
    WHILE,
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

export class BeginParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        const expression = parser.parseExpression(parser.getPrecedence());
        parser.consume("END");
        return expression;
    }
}

export class IfParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        const condition = parser.parseExpression(parser.getPrecedence());
        parser.consume("THEN");
        const thenExpr = parser.parseExpression(parser.getPrecedence());
        let elseExpr: Expression;
        if (parser.match("ELSE")) {
            elseExpr = parser.parseExpression(parser.getPrecedence());
        }

        return new IfExpression(condition, thenExpr, elseExpr)
    }
}

export class WhileParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        const condition = parser.parseExpression(parser.getPrecedence());
        return new WhileExpression(condition, parser.parseExpression(parser.getPrecedence()));
    }
}

export class ForParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        const fromExpr = parser.parseExpression(parser.getPrecedence());
        parser.consume("TO");
        const toExpr = parser.parseExpression(parser.getPrecedence());
        let stepExpr: Expression;
        if (parser.match("STEP")) {
            stepExpr = parser.parseExpression(parser.getPrecedence());
        }
        return new ForExpression(fromExpr, toExpr, stepExpr, parser.parseExpression(parser.getPrecedence()));
    }
}

export class FunctionParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        const name = parser.consume("IDENTIFIER", "Expect function name.").lexeme;
        parser.consume("LEFT_PAREN", "Expected '(' after function name.");
        
        const params: string[] = [];
        if (!parser.match("RIGHT_PAREN")) {
            do {
                if (params.length >= MAX_FN_ARGS_COUNT) {
                    throw new Error("Can't have more than 255 parameters.");
                }

                params.push(parser.consume("IDENTIFIER", "Expected parameter name.").lexeme);
            }
            while (parser.match("COMMA"));
        }

        parser.consume("RIGHT_PAREN", "Expect ')' after parameters.");

        if (parser.match("RETURN")) {
            const body = parser.parseExpression(parser.getPrecedence());
            return new FunctionExpression(name, params, [body]);
        }
        else {
            parser.consume("BEGIN", "Expect 'begin' or 'return' before function body.");
            const body = [];
            while (parser.peek().type !== "END") {
                body.push(parser.parseExpression(parser.getPrecedence()));
            }
            parser.consume("END");
            return new FunctionExpression(name, params, body);
        }
    }
}

export class ReturnParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expression {
        return new ReturnExpression(parser.parseExpression(parser.getPrecedence()));
    }
}

export class PrefixOperatorParselet implements PrefixParselet {
    constructor(readonly precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: Parser, token: Token): Expression {
        return new PrefixExpression(
            token.type as MezcalTokenType,
            parser.parseExpression(this.precedence),
        );
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
    constructor(readonly precedence: number, readonly isRightAssociative: boolean) {
        this.precedence = precedence;
        this.isRightAssociative = isRightAssociative;
    }

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

import { Token } from "../internal/token";
import { MezcalToken, MezcalTokenType } from "../scanner";
import { AssignmentExpression, Expression, ForExpression, FunctionExpression, IfExpression, MethodCallExpression, NameExpression, NumberExpression, OperatorExpression, PostfixExpression, PrefixExpression, ReturnExpression, WhileExpression } from "./expression";
import { isFunctionName } from "./is-function-name";
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
    parse(parser: Parser, token: MezcalToken): Expression;
}

export class NameParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
        if (isFunctionName(token.lexeme)) {
            if (parser.peek().type !== "LEFT_PAREN") {
                const fnName = token.lexeme;
                parser.addInstructions(`call ${fnName}`);
            }
        }
        else if (parser.peek().type !== "EQUAL") {
            parser.addInstructions(`get ${token.lexeme}`);
        }

        return new NameExpression(token.lexeme);
    }
}

export class NumberParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
        parser.addInstructions(`push ${token.lexeme}`);
        return new NumberExpression(token.lexeme);
    }
}

export class BeginParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
        const expression = parser.parseExpression(parser.getPrecedence());
        parser.consume("END");
        return expression;
    }
}

export class IfParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
        const label1 = parser.peekLabel();
        const label2 = parser.peekLabel(1);

        const condition = parser.parseExpression(parser.getPrecedence());

        parser.consume("THEN");
        const thenExpr = parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(`bra ${label2}`, `:${label1}`, "pop");

        let elseExpr: Expression;
        if (parser.match("ELSE")) {
            elseExpr = parser.parseExpression(parser.getPrecedence());
        }

        parser.addInstructions(`:${label2}`);

        return new IfExpression(condition, thenExpr, elseExpr)
    }
}

export class WhileParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
        const label1 = parser.peekLabel();
        const label2 = parser.peekLabel(1);

        parser.addInstructions(`${label2}:`);

        const condition = parser.parseExpression(parser.getPrecedence());
        const body = parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(`bra ${label2}`, `${label1}:`, "pop");

        return new WhileExpression(condition, body);
    }
}

export class ForParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
        const label1 = parser.getLabel();
        const label2 = parser.getLabel();

        const fromExpr = parser.parseExpression(parser.getPrecedence()) as AssignmentExpression;
        const varName = fromExpr.left.name;

        parser.addInstructions(`${label1}: # for ${varName}`, `get ${varName}`);

        parser.consume("TO");
        const toExpr = parser.parseExpression(parser.getPrecedence());

        parser.addInstructions("cmp", `bgt ${label2}`, "pop");

        let stepInstr = "push 1";
        let stepExpr: Expression;
        if (parser.match("STEP")) {
            stepExpr = parser.parseExpression(parser.getPrecedence());
            stepInstr = parser.instructions.pop();
        }

        const body = parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(
            `get ${varName}`,
            stepInstr,
            "add",
            `put ${varName}`,
            "pop",
            `bra ${label1}`,
            `${label2}: # end for ${varName}`,
            "pop");

        return new ForExpression(fromExpr, toExpr, stepExpr, body);
    }
}

export class FunctionParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
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
    parse(parser: Parser, token: MezcalToken): Expression {
        return new ReturnExpression(parser.parseExpression(parser.getPrecedence()));
    }
}

export class PrefixOperatorParselet implements PrefixParselet {
    constructor(readonly precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: Parser, token: MezcalToken): Expression {
        return new PrefixExpression(
            token.type as MezcalTokenType,
            parser.parseExpression(this.precedence),
        );
    }
}

export class GroupParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): Expression {
        const expression = parser.parseExpression(parser.getPrecedence());
        parser.consume("RIGHT_PAREN");

        return expression;
    }
}

/** -- Infix -- **/

export interface InfixParselet {
    parse(parser: Parser, left: Expression, token: MezcalToken): Expression;
    getPrecedence(): number;
}

export class BinaryOperatorParselet implements InfixParselet {
    constructor(readonly precedence: number, readonly isRightAssociative: boolean) {
        this.precedence = precedence;
        this.isRightAssociative = isRightAssociative;
    }

    parse(parser: Parser, left: Expression, token: MezcalToken): Expression {
        const right = parser.parseExpression(this.precedence - (this.isRightAssociative ? 1 : 0));

        switch (token.type) {
            case "PLUS": parser.addInstructions("add"); break;
            case "MINUS": parser.addInstructions("sub"); break;
            case "STAR": parser.addInstructions("mul"); break;
            case "SLASH": parser.addInstructions("div"); break;
            case "POWER": parser.addInstructions("call pow"); break;
            case "OR": parser.addInstructions("or"); break;
            case "AND": parser.addInstructions("and"); break;
            case "NOT": parser.addInstructions("not"); break;
            case "LESS": parser.addInstructions("cmp", `bge ${parser.getLabel()}`, "pop"); break;
            case "GREATER": parser.addInstructions("cmp", `ble ${parser.getLabel()}`, "pop"); break;
            case "LESS_EQUAL": parser.addInstructions("cmp", `bgt ${parser.getLabel()}`, "pop"); break;
            case "GREATER_EQUAL": parser.addInstructions("cmp", `blt ${parser.getLabel()}`, "pop"); break;
            default: parser.addInstructions("nop"); break;
        }

        return new OperatorExpression(
            left,
            token.type as MezcalTokenType,
            right,
        );
    }

    getPrecedence(): number {
        return this.precedence;
    }
}

export class MethodCallParselet implements InfixParselet {
    parse(parser: Parser, left: NameExpression, token: MezcalToken): Expression {
        const args: Expression[] = [];

        while (!parser.match("RIGHT_PAREN")) {
            do {
                args.push(parser.parseExpression());
            }
            while (parser.match("COMMA"));
        }

        const fnName = left.name;
        parser.addInstructions(`call ${fnName}`);

        return new MethodCallExpression(left, args);
    }

    getPrecedence(): number {
        return Precedence.CALL;
    }
}

export class AssignmentParselet implements InfixParselet {
    parse(parser: Parser, left: NameExpression, token: MezcalToken): Expression {
        const fnName = (left as NameExpression).name;
        const right = parser.parseExpression(Precedence.ASSIGNMENT - 1);

        parser.addInstructions(`put ${fnName}`, "pop");

        return new AssignmentExpression(
            left,
            right,
        );
    }

    getPrecedence(): number {
        return Precedence.ASSIGNMENT;
    }
}

/** -- Postfix -- **/

export class PostfixOperatorParselet implements InfixParselet {
    parse(parser: Parser, left: Expression, token: MezcalToken): Expression {
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

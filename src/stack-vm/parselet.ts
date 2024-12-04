import { MezcalToken } from "../scanner";
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
    parse(parser: Parser, token: MezcalToken): void;
}

export class NameParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        if (isFunctionName(token.lexeme)) {
            if (parser.peek().type !== "LEFT_PAREN") {
                const fnName = token.lexeme;
                parser.addInstructions(`call ${fnName}`);
            }
        }
        else if (parser.peek().type !== "EQUAL") {
            parser.addInstructions(`get ${token.lexeme}`);
        }
    }
}

export class NumberParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        parser.addInstructions(`push ${token.lexeme}`);
    }
}

export class BeginParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        parser.parseExpression(parser.getPrecedence());
        parser.consume("END");
    }
}

export class IfParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        const label1 = parser.peekLabel();
        const label2 = parser.peekLabel(1);

        // condition
        parser.parseExpression(parser.getPrecedence());

        parser.consume("THEN");
        parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(`bra ${label2}`, `:${label1}`, "pop");

        if (parser.match("ELSE")) {
            parser.parseExpression(parser.getPrecedence());
        }

        parser.addInstructions(`:${label2}`);
    }
}

export class WhileParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        const label1 = parser.peekLabel();
        const label2 = parser.peekLabel(1);

        parser.addInstructions(`${label2}:`);

        // condition
        parser.parseExpression(parser.getPrecedence());
        // body
        parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(`bra ${label2}`, `${label1}:`, "pop");
    }
}

export class ForParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        const label1 = parser.getLabel();
        const label2 = parser.getLabel();
        const varName = parser.peek().lexeme;

        // from
        parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(`${label1}: # for ${varName}`, `get ${varName}`);

        parser.consume("TO");
        parser.parseExpression(parser.getPrecedence());

        parser.addInstructions("cmp", `bgt ${label2}`, "pop");

        let stepInstr = "push 1";
        if (parser.match("STEP")) {
            parser.parseExpression(parser.getPrecedence());
            stepInstr = parser.instructions.pop();
        }

        // body
        parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(
            `get ${varName}`,
            stepInstr,
            "add",
            `put ${varName}`,
            "pop",
            `bra ${label1}`,
            `${label2}: # end for ${varName}`,
            "pop");
    }
}

export class FunctionParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
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
            // body
            parser.parseExpression(parser.getPrecedence());
        }
        else {
            parser.consume("BEGIN", "Expect 'begin' or 'return' before function body.");
            while (parser.peek().type !== "END") {
                parser.parseExpression(parser.getPrecedence());
            }
            parser.consume("END");
        }
    }
}

export class ReturnParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        parser.parseExpression(parser.getPrecedence());
    }
}

export class PrefixOperatorParselet implements PrefixParselet {
    constructor(readonly precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: Parser, token: MezcalToken): void {
        parser.parseExpression(this.precedence);
    }
}

export class GroupParselet implements PrefixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        parser.parseExpression(parser.getPrecedence());
        parser.consume("RIGHT_PAREN");
    }
}

/** -- Infix -- **/

export interface InfixParselet {
    parse(parser: Parser, token: MezcalToken): void;
    getPrecedence(): number;
}

export class BinaryOperatorParselet implements InfixParselet {
    constructor(readonly precedence: number, readonly isRightAssociative: boolean) {
        this.precedence = precedence;
        this.isRightAssociative = isRightAssociative;
    }

    parse(parser: Parser, token: MezcalToken): void {
        parser.parseExpression(this.precedence - (this.isRightAssociative ? 1 : 0));

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
    }

    getPrecedence(): number {
        return this.precedence;
    }
}

export class MethodCallParselet implements InfixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        const fnName = parser.previous("IDENTIFIER").lexeme;
        while (!parser.match("RIGHT_PAREN")) {
            do {
                parser.parseExpression();
            }
            while (parser.match("COMMA"));
        }

        parser.addInstructions(`call ${fnName}`);
    }

    getPrecedence(): number {
        return Precedence.CALL;
    }
}

export class AssignmentParselet implements InfixParselet {
    parse(parser: Parser, token: MezcalToken): void {
        const fnName = parser.previous("IDENTIFIER").lexeme;
        parser.parseExpression(Precedence.ASSIGNMENT - 1);
        parser.addInstructions(`put ${fnName}`, "pop");
    }

    getPrecedence(): number {
        return Precedence.ASSIGNMENT;
    }
}

/** -- Postfix -- **/

export class PostfixOperatorParselet implements InfixParselet {
    parse(parser: Parser, token: MezcalToken): void {
    }

    getPrecedence(): number {
        return this.precedence;
    }

    precedence: number;

    constructor(precedence: number) {
        this.precedence = precedence;
    }
}

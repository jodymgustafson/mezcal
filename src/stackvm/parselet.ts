import { Token } from "../internal/token";
import { MezcalToken, MezcalTokenType } from "../scanner";
import { AssignmentExpression, Expression, ForExpression, FunctionExpression, IfExpression, FunctionCallExpression, NameExpression, NumberExpression, OperatorExpression, PostfixExpression, PrefixExpression, ReturnExpression, StringExpression, WhileExpression } from "./expression";
import { isFunctionName } from "./is-function-name";
import { StackVmCompiler } from "./parser";

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
    parse(parser: StackVmCompiler, token: MezcalToken): Expression;
}

export class NameParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        if (isFunctionName(token.lexeme)) {
            // Check for parameterless function call
            if (parser.peek().type !== "LEFT_PAREN") {
                const fnName = token.lexeme;
                parser.addInstructions(`call ${fnName}`);
            }
        }
        else if (parser.peek().type === "LEFT_PAREN") {
            // do nothing            
        }
        else if (parser.peek().type !== "EQUAL") {
            parser.addInstructions(`get ${token.lexeme}`);
        }

        return new NameExpression(token.lexeme);
    }
}

export class NumberParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        parser.addInstructions(`push ${token.lexeme}`);
        return new NumberExpression(token.lexeme);
    }
}

export class StringParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        parser.addInstructions(`push ${token.lexeme}`);
        return new StringExpression(token.lexeme);
    }
}

export class BeginParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        let expression: Expression;
        while (!parser.match("END")) {
            expression = parser.parseExpression(parser.getPrecedence());
        }
        // parser.consume("END");
        return expression;
    }
}

export class IfParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        // The first label will be created by the condition expression
        const label1 = parser.peekLabel();

        parser.addInstructions("# begin if")
        const condition = parser.parseExpression(parser.getPrecedence());

        parser.consume("THEN");
        const thenExpr = parser.parseExpression(parser.getPrecedence());

        let label2: string;
        let elseExpr: Expression;
        if (parser.match("ELSE")) {
            label2 = parser.getLabel();
            parser.addInstructions(`bra ${label2}`, `${label1}: # else`, "pop");
            elseExpr = parser.parseExpression(parser.getPrecedence());
        }
        else {
            parser.addInstructions(`${label1}: # end if`, "pop");
        }

        if (label2) {
            parser.addInstructions(`${label2}: # end if`);
        }

        return new IfExpression(condition, thenExpr, elseExpr)
    }
}

export class WhileParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        const label1 = parser.getLabel();
        // The second label will be created by the condition expression
        const label2 = parser.peekLabel();

        parser.addInstructions(`${label1}: # begin while`);

        const condition = parser.parseExpression(parser.getPrecedence());
        const body = parser.parseExpression(parser.getPrecedence());

        parser.addInstructions(`bra ${label1}`, `${label2}: # end while`, "pop");

        return new WhileExpression(condition, body);
    }
}

export class ForParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        const label1 = parser.getLabel();
        const label2 = parser.getLabel();

        const fromExpr = parser.parseExpression(parser.getPrecedence()) as AssignmentExpression;
        const varName = fromExpr.left.name;

        parser.addInstructions(`${label1}: # begin for ${varName}`, `get ${varName}`);

        parser.consume("TO");
        const toExpr = parser.parseExpression(parser.getPrecedence());

        parser.addInstructions("cmp", `bgt ${label2}`, "pop");

        let stepInstr = "push 1";
        let stepExpr: Expression;
        if (parser.match("STEP")) {
            stepExpr = parser.parseExpression(parser.getPrecedence());
            // The step amount instruction needs to go later
            stepInstr = parser.popInstruction();
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
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        const fnName = parser.consume("IDENTIFIER", "Expect function name.").lexeme;
        parser.addFunction(fnName);

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

        // Pop the params off the stack into vars
        params.toReversed().forEach(p => parser.addInstructions(`put ${p}`, "pop"));

        let bodyExpr: Expression[];
        if (parser.peek().type === "RETURN") {
            bodyExpr = [parser.parseExpression(parser.getPrecedence())];
        }
        else {
            parser.consume("BEGIN", "Expect 'begin' or 'return' before function body.");
            bodyExpr = [];
            while (parser.peek().type !== "END") {
                bodyExpr.push(parser.parseExpression(parser.getPrecedence()));
            }
            parser.consume("END");
        }

        parser.mainFunction();
        return new FunctionExpression(fnName, params, bodyExpr);
    }
}

export class ReturnParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        const expr = parser.parseExpression(parser.getPrecedence());
        parser.addInstructions("end");
        return new ReturnExpression(expr);
    }
}

export class PrefixOperatorParselet implements PrefixParselet {
    constructor(readonly precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        if (token.type === "MINUS") {
            const next = parser.peek();
            next.lexeme = `-${next.lexeme}`;
        }

        return new PrefixExpression(
            token.type as MezcalTokenType,
            parser.parseExpression(parser.getPrecedence()),
        );
    }
}

export class GroupParselet implements PrefixParselet {
    parse(parser: StackVmCompiler, token: MezcalToken): Expression {
        const expression = parser.parseExpression(parser.getPrecedence());
        parser.consume("RIGHT_PAREN");

        return expression;
    }
}

/** -- Infix -- **/

export interface InfixParselet {
    parse(parser: StackVmCompiler, left: Expression, token: MezcalToken): Expression;
    getPrecedence(): number;
}

export class BinaryOperatorParselet implements InfixParselet {
    constructor(readonly precedence: number, readonly isRightAssociative: boolean) {
        this.precedence = precedence;
        this.isRightAssociative = isRightAssociative;
    }

    private isString(expr: Expression): boolean {
        return expr instanceof StringExpression ||
            (expr instanceof NameExpression && expr.name.endsWith("$"));
    }

    parse(parser: StackVmCompiler, left: Expression, token: MezcalToken): Expression {
        const right = parser.parseExpression(this.precedence - (this.isRightAssociative ? 1 : 0));

        const isString = this.isString(left) || this.isString(right);
        const compare = isString ? ["call str.compare", "push 0", "cmp"] : ["cmp"];

        switch (token.type) {
            case "PLUS": isString ? parser.addInstructions("call str.concat") : parser.addInstructions("add"); break;
            case "MINUS": parser.addInstructions("sub"); break;
            case "STAR": parser.addInstructions("mul"); break;
            case "SLASH": parser.addInstructions("div"); break;
            case "POWER": parser.addInstructions("call pow"); break;
            case "OR": parser.addInstructions("or"); break;
            case "AND": parser.addInstructions("and"); break;
            case "NOT": parser.addInstructions("not"); break;
            case "LESS": parser.addInstructions(...compare, `bge ${parser.getLabel()}`, "pop"); break;
            case "GREATER": parser.addInstructions(...compare, `ble ${parser.getLabel()}`, "pop"); break;
            case "LESS_EQUAL": parser.addInstructions(...compare, `bgt ${parser.getLabel()}`, "pop"); break;
            case "GREATER_EQUAL": parser.addInstructions(...compare, `blt ${parser.getLabel()}`, "pop"); break;
            case "NOT_EQUAL": parser.addInstructions(...compare, `beq ${parser.getLabel()}`, "pop"); break;
            case "EQUAL_EQUAL": parser.addInstructions(...compare, `bne ${parser.getLabel()}`, "pop"); break;
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

export class FunctionCallParselet implements InfixParselet {
    parse(parser: StackVmCompiler, left: NameExpression, token: MezcalToken): Expression {
        const args: Expression[] = [];

        while (!parser.match("RIGHT_PAREN")) {
            do {
                args.push(parser.parseExpression());
            }
            while (parser.match("COMMA"));
        }

        const fnName = left.name;
        if (fnName === "input") {
            parser.addInstructions("call writeln", "pop", "call readln");
        }
        else if (fnName === "print") {
            parser.addInstructions("call writeln", "pop");
        }
        else {
            parser.addInstructions(`call ${fnName}`);
        }

        return new FunctionCallExpression(left, args);
    }

    getPrecedence(): number {
        return Precedence.CALL;
    }
}

export class AssignmentParselet implements InfixParselet {
    parse(parser: StackVmCompiler, left: NameExpression, token: MezcalToken): Expression {
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
    parse(parser: StackVmCompiler, left: Expression, token: MezcalToken): Expression {
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

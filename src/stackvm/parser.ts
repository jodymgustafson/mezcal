import { Token } from "../internal/token";
import { MezcalTokenType } from "../scanner";
import { Expression, OperatorExpression } from "./expression";
import {
    AssignmentParselet,
    BeginParselet,
    BinaryOperatorParselet,
    ForParselet,
    FunctionParselet,
    GroupParselet,
    IfParselet,
    InfixParselet,
    MethodCallParselet,
    NameParselet,
    NumberParselet,
    Precedence,
    PrefixOperatorParselet,
    PrefixParselet,
    ReturnParselet,
    WhileParselet,
} from "./parselet";


const prefixParselets: Partial<Record<MezcalTokenType, PrefixParselet>> = {
    "IDENTIFIER": new NameParselet(),
    "NUMBER": new NumberParselet(),
    "LEFT_PAREN": new GroupParselet(),
    "BEGIN": new BeginParselet(),
    "IF": new IfParselet(),
    "WHILE": new WhileParselet(),
    "FOR": new ForParselet(),
    "FUNCTION": new FunctionParselet(),
    "RETURN": new ReturnParselet(),

    "PLUS": new PrefixOperatorParselet(Precedence.PREFIX),
    "MINUS": new PrefixOperatorParselet(Precedence.PREFIX),
    "NOT": new PrefixOperatorParselet(Precedence.PREFIX),
};

const infixParselets: Partial<Record<MezcalTokenType, InfixParselet>> = {
    "LEFT_PAREN": new MethodCallParselet(),
    "EQUAL": new AssignmentParselet(),

    "PLUS": new BinaryOperatorParselet(Precedence.SUM, false),
    "MINUS": new BinaryOperatorParselet(Precedence.SUM, false),
    "STAR": new BinaryOperatorParselet(Precedence.PRODUCT, false),
    "SLASH": new BinaryOperatorParselet(Precedence.PRODUCT, false),
    "POWER": new BinaryOperatorParselet(Precedence.EXPONENT, true),

    "LESS": new BinaryOperatorParselet(Precedence.CONDITIONAL, false),
    "LESS_EQUAL": new BinaryOperatorParselet(Precedence.CONDITIONAL, false),
    "GREATER": new BinaryOperatorParselet(Precedence.CONDITIONAL, false),
    "GREATER_EQUAL": new BinaryOperatorParselet(Precedence.CONDITIONAL, false),
    "EQUAL_EQUAL": new BinaryOperatorParselet(Precedence.CONDITIONAL, false),
    "NOT_EQUAL": new BinaryOperatorParselet(Precedence.CONDITIONAL, false),

    "AND": new BinaryOperatorParselet(Precedence.BOOLEAN, false),
    "OR": new BinaryOperatorParselet(Precedence.BOOLEAN, false),
};

export class Parser {
    readonly instructions: string[] = [":start"];
    private idx: number = 0;

    constructor(readonly tokens: Token[]) {
    }

    parse(): Expression[] {
        const expressions: Expression[] = [];

        while (!this.isAtEnd()) {
            const ast = this.parseExpression();
            expressions.push(ast);
        }

        this.instructions.push("end");
        return expressions;
    }

    parseExpression(precedence = 0): Expression {
        let token = this.consume();

        if (token.type === "LET") {
            // ignore let
            return this.parseExpression();
        }

        const prefix = prefixParselets[token.type] as PrefixParselet;
        if (!prefix) throw new Error(`Could not parse ${JSON.stringify(token)}`);

        let left = prefix.parse(this, token);

        // This stops operators from being added multiple times
        // And the last expression of a block from being added
        if (!(left instanceof OperatorExpression || token.type === "BEGIN"))
            this.instructions.push(left.toStackVm());

        while (precedence < this.getPrecedence()) {
            token = this.consume();
            const infix = infixParselets[token.type]!;
            if (infix instanceof MethodCallParselet || infix instanceof AssignmentParselet) {
                // remove the NameExpression that was the name of the function
                this.instructions.pop();
            }
            left = infix.parse(this, left, token);
            this.instructions.push(left.toStackVm());
        }

        return left;
    }

    private isAtEnd(): boolean {
        return this.peek().type === "EOF";
    }

    consume(expectedType?: MezcalTokenType, errorMsg?: string): Token {
        const token = this.tokens[this.idx++];

        if (expectedType === undefined || token.type === expectedType) return token;

        throw new Error(
            errorMsg ?? `Expected ${expectedType} but instead found ${token.lexeme}.`,
        );
    }

    peek(offset: number = 0): Token {
        return this.tokens[this.idx + offset];
    }

    /**
     * Checks if the next token matches the type and if so consumes it 
     */
    match(tokenType: MezcalTokenType): boolean {
        const isMatch = this.peek().type === tokenType;
        if (isMatch) {
            this.consume();
        }
        return isMatch;
    }

    getPrecedence(): number {
        const token = this.peek();
        const parselet = infixParselets[token.type];
        return parselet?.getPrecedence() ?? 0;
    }
}
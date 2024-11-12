import { Token } from "../internal/token";
import { MezcalTokenType } from "../scanner";
import { Expression } from "./expression";
import {
    AssignmentParselet,
    BinaryOperatorParselet,
    GroupParselet,
    InfixParselet,
    MethodCallParselet,
    NameParselet,
    NumberParselet,
    PostfixOperatorParselet,
    Precedence,
    PrefixOperatorParselet,
    PrefixParselet,
} from "./parselet";

export class Parser {
    tokens: Token[];
    idx: number = 0;

    prefixParselets: Partial<Record<MezcalTokenType, PrefixParselet>> = {};
    infixParselets: Partial<Record<MezcalTokenType, InfixParselet>> = {};

    constructor(tokens: Token[]) {
        this.registerPrefix("FUNCTION", new NameParselet());
        this.registerPrefix("IDENTIFIER", new NameParselet());
        this.registerPrefix("NUMBER", new NumberParselet());
        this.registerPrefix("LEFT_PAREN", new GroupParselet());

        this.registerInfix("LEFT_PAREN", new MethodCallParselet());
        this.registerInfix("EQUAL", new AssignmentParselet());

        this.prefix("PLUS", Precedence.PREFIX);
        this.prefix("MINUS", Precedence.PREFIX);
        this.prefix("NOT", Precedence.PREFIX);

        this.binary("PLUS", Precedence.SUM);
        this.binary("MINUS", Precedence.SUM);
        this.binary("STAR", Precedence.PRODUCT);
        this.binary("SLASH", Precedence.PRODUCT);
        this.binary("POWER", Precedence.EXPONENT, true);

        this.tokens = tokens;
    }

    parse(): Expression {
        const ast = this.parseExpression();
        const maybeEof = this.peek();

        if (maybeEof.type === "EOF") return ast;

        throw new Error(`Expected EOF but instead found ${maybeEof.lexeme}.`);
    }

    parseExpression(precedence: number = 0): Expression {
        let token = this.consume();

        if (token.type === "LET") {
            // ignore it
            return this.parseExpression();
        }

        const prefix = this.prefixParselets[token.type];

        if (prefix === undefined) throw new Error(`Could not parse '${token.lexeme}' of type '${token.type}'.`);

        let left = prefix.parse(this, token);

        while (precedence < this.getPrecedence()) {
            token = this.consume();

            const infix = this.infixParselets[token.type]!;
            left = infix.parse(this, left, token);
        }

        return left;
    }

    private binary(
        tokenType: MezcalTokenType,
        precedence: Precedence,
        isRightAssociative: boolean = false,
    ) {
        this.registerInfix(
            tokenType,
            new BinaryOperatorParselet(precedence, isRightAssociative),
        );
    }

    consume(expectedType?: MezcalTokenType): Token {
        const token = this.tokens[this.idx++];

        if (expectedType === undefined || token.type === expectedType) return token;

        throw new Error(
            `Expected ${expectedType} but instead found ${token.lexeme}.`,
        );
    }

    private peek(offset: number = 0): Token {
        return this.tokens[this.idx + offset];
    }

    private registerPrefix(tokenType: MezcalTokenType, prefixParselet: PrefixParselet): void {
        this.prefixParselets[tokenType] = prefixParselet;
    }

    private registerInfix(tokenType: MezcalTokenType, infixParselet: InfixParselet): void {
        this.infixParselets[tokenType] = infixParselet;
    }

    private prefix(prefix: MezcalTokenType, precedence: number): void {
        this.registerPrefix(prefix, new PrefixOperatorParselet(precedence));
    }

    private postfix(tokenType: MezcalTokenType, precedence: Precedence): void {
        this.registerInfix(tokenType, new PostfixOperatorParselet(precedence));
    }

    getPrecedence(): number {
        const token = this.peek();
        const parselet = this.infixParselets[token.type];

        if (parselet !== undefined) {
            return parselet.getPrecedence();
        }

        return 0;
    }

    match(tokenType: MezcalTokenType) {
        // return this.peek().type === tokenType ? !!this.consume() : false

        const isMatch = this.peek().type === tokenType;

        if (!isMatch) {
            return isMatch;
        }

        this.consume();

        return isMatch;
    }
}
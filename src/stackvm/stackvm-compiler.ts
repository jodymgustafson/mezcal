import { MezcalToken, MezcalTokenType } from "../scanner";
import { Expression } from "./expression";
import {
    AssignmentParselet,
    BeginParselet,
    BinaryOperatorParselet,
    ForParselet,
    FunctionParselet,
    GroupParselet,
    IfParselet,
    InfixParselet,
    FunctionCallParselet,
    NameParselet,
    NumberParselet,
    Precedence,
    PrefixOperatorParselet,
    PrefixParselet,
    ReturnParselet,
    StringParselet,
    WhileParselet,
} from "./parselet";


const prefixParselets: Partial<Record<MezcalTokenType, PrefixParselet>> = {
    "IDENTIFIER": new NameParselet(),
    "NUMBER": new NumberParselet(),
    "STRING": new StringParselet(),
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
    "LEFT_PAREN": new FunctionCallParselet(),
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

/** Maps function names to stackvm assembly codes */
export type StackVmCompilerOutput = Record<string, string[]>;

/**
 * Compiles Mezcal code into StackVM assembly codes.
 * The output will at least have a main function.
 */
export class StackVmCompiler {
    private idx: number = 0;
    private labelCnt = 0;

    // We start with pushing 0 so main at least returns 0 if nothing else
    private instructions: string[] = ["push 0", "start:"];
    readonly functions: StackVmCompilerOutput = {
        main: this.instructions
    };

    /**
     * @param tokens Output of the lexical scanner
     */
    constructor(readonly tokens: MezcalToken[]) {
    }

    /**
     * Entry point to start compiling
     * @returns StackVM assembly codes grouped by function name
     */
    parse(): StackVmCompilerOutput {
        // const expressions: Expression[] = [];

        while (!this.isAtEnd()) {
            this.parseExpression();
            // expressions.push(expr);
        }

        // Make sure we end the main function
        this.mainFunction();
        this.addInstructions("end");

        return this.functions;
    }

    private isAtEnd(): boolean {
        return this.peek().type === "EOF";
    }

    /** internal use */
    parseExpression<T extends Expression>(precedence = 0): T {
        let token = this.consume();

        if (token.type === "LET") {
            // ignore let
            return this.parseExpression();
        }

        const prefix = prefixParselets[token.type] as PrefixParselet;
        if (!prefix) throw new Error(`Could not parse ${JSON.stringify(token)}`);

        let left = prefix.parse(this, token);

        while (precedence < this.getPrecedence()) {
            token = this.consume();
            const infix = infixParselets[token.type]!;
            left = infix.parse(this, left, token);
        }

        return left as T;
    }

    /** internal use */
    consume(expectedType?: MezcalTokenType, errorMsg?: string): MezcalToken {
        const token = this.tokens[this.idx++];

        if (expectedType === undefined || token.type === expectedType) return token;

        throw new Error(
            errorMsg ?? `Line ${token.line}: Expected ${expectedType} but instead found ${token.lexeme}.`,
        );
    }

    /** internal use */
    peek(offset: number = 0): MezcalToken {
        return this.tokens[this.idx + offset];
    }

    /**
     * Checks if the next token matches the type and if so consumes it 
     * internal use
     */
    match(tokenType: MezcalTokenType): boolean {
        const isMatch = this.peek().type === tokenType;
        if (isMatch) {
            this.consume();
        }
        return isMatch;
    }

    /** internal use */
    getPrecedence(): number {
        const token = this.peek();
        const parselet = infixParselets[token.type];
        return parselet?.getPrecedence() ?? 0;
    }

    /**
     * Resets instructions to the main function
     * internal use
     */
    mainFunction(): void {
        this.instructions = this.functions.main;
    }

    /** internal use */
    addFunction(fnName: string): void {
        this.functions[fnName] = this.instructions = ["start:"];
    }

    /** internal use */
    addInstructions(...instrs: string[]): void {
        this.instructions.push(...instrs);
    }

    /** internal use */
    popInstruction(): string {
        return this.instructions.pop();
    }

    /** 
     * Gets the next label
     * internal use
     */
    getLabel(): string {
        return `__${this.labelCnt++}`;
    }

    /**
     * Gets the next label without incrementing
     * internal use
     */
    peekLabel(offset = 0): string {
        return `__${this.labelCnt + offset}`;
    }
}
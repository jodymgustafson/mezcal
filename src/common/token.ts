/**
 * Defines the shape of a token that contains info about a lexeme 
 */
export type Token<TT=string, T=any> = {
    type: TT;
    lexeme: string;
    value?: T
    line: number;
};

/**
 * Factory function to create a token
 * @param type Type of token
 * @param lexeme The lexeme the token represents
 * @param value Parsed value of the token, if any (e.g. a number)
 * @param line The line number in the source code
 * @returns A token
 */
export function getToken<TT=string, T=any>(type: TT, lexeme: string, value?: T, line?: number): Token<TT, T> {
    return { type, lexeme, value, line: line ?? 0 };
}
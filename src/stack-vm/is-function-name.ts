const fnNames = new Set([
    "clock",
    "pi",
    "e",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "abs",
    "floor",
    "ceil",
    "log",
    "ln",
    "round",
    "random",
    "sqrt",
    "cbrt",
    "print",
    "input",
]);

export function isFunctionName(n: string): boolean {
    return fnNames.has(n);
}
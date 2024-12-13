import { Callable } from "../interpreter";
import { InterpreterFunctions } from "./interpreter-context";

// Format: [name, arity, function]
const fns: [string, number, Function][] = [
    ["clock", 0, Date.now],
    ["pi", 0, () => Math.PI],
    ["e", 0, () => Math.E],
    ["sin", 1, Math.sin],
    ["cos", 1, Math.cos],
    ["tan", 1, Math.tan],
    ["asin", 1, Math.asin],
    ["acos", 1, Math.acos],
    ["atan", 1, Math.atan],
    ["abs", 1, Math.abs],
    ["floor", 1, Math.floor],
    ["ceil", 1, Math.ceil],
    ["log", 1, Math.log10],
    ["ln", 1, Math.log],
    ["round", 1, Math.round],
    ["random", 0, Math.random],
    ["sqrt", 1, Math.sqrt],
    ["cbrt", 1, Math.cbrt],
];

export const nativeFunctions: InterpreterFunctions = fns.reduce((acc, cur) => {
    acc[cur[0]] = {
        arity: cur[1],
        call: cur[2],
        isCallable: true,
    } as Callable;
    return acc;
}, {} as InterpreterFunctions);


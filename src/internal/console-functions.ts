import { Callable } from "../interpreter";
import { InterpreterFunctions } from "./interpreter-context";
import { readLineSync } from "./read-line";

// Format: [name, arity, function]
const fns: [string, number, Function][] = [
    ["print", 1, args => console.log(args[0])],
    ["input", 1, args => readLineSync(args[0])]
];

export const consoleFunctions: InterpreterFunctions = fns.reduce((acc, cur) => {
    acc[cur[0]] = {
        arity: cur[1],
        call: cur[2],
        isCallable: true,
    } as Callable;
    return acc;
}, {} as InterpreterFunctions);


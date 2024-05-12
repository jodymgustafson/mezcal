import { InterpreterFunctions } from "../interpreter-context";

export const nativeFunctions: InterpreterFunctions = {
    clock: {
        arity: 0,
        isCallable: true,
        call: () => Date.now(),
    },
    pi: {
        arity: 0,
        isCallable: true,
        call: () => Math.PI
    }
}
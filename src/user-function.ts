import { Callable, Interpreter } from "./interpreter";
import { InterpreterContext } from "./interpreter-context";
import { FunctionStmt } from "./stmt";

export class UserFunction implements Callable {
    readonly isCallable = true;
    readonly arity: number;

    constructor(readonly declaration: FunctionStmt) {
        this.arity = declaration.params.length;
    }

    call(args?: any[], interpreter?: Interpreter): any {
        const context = new InterpreterContext(interpreter.globals);
        for (let i = 0; i < this.declaration.params.length; i++) {
            context.setVariable(this.declaration.params[i].lexeme, args[i]);
        }

        return interpreter.executeBlock(this.declaration.body, context);
    }

    toString(): string {
        return `<fn ${this.declaration.name.lexeme}>`
    }
}
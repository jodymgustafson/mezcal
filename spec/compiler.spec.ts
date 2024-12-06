import { compile } from "../compile"

describe("When compile mezcal code to StackVM", () => {
    it("should compile 2 * (-3 + 1)^2", () => {
        expect(compile("2 * (-3 + 1)^2").main).toEqual(
            ["push 0", "start:", "push 2", "push -3", "push 1", "add", "push 2", "call pow", "mul", "end"]
        );
    });

    it("should compile let a = 23", () => {
        expect(compile("let a = 23").main).toEqual(
            ["push 0", "start:", "push 23", "put a", "pop", "end"]
        );
    });

    it("should compile a = 23", () => {
        expect(compile("a = 23").main).toEqual(
            ["push 0", "start:", "push 23", "put a", "pop", "end"]
        );
    });

    it("should compile a = 23\na * 2", () => {
        expect(compile("a = 23\na * 2").main).toEqual(
            ["push 0", "start:", "push 23", "put a", "pop", "get a", "push 2", "mul", "end"]
        );
    });

    it("should compile sin(pi)", () => {
        expect(compile("sin(pi)").main).toEqual(
            ["push 0", "start:", "call pi", "call sin", "end"]
        );
    });

    it("should compile log(e)", () => {
        expect(compile("log(e)").main).toEqual(
            ["push 0", "start:", "call e", "call log", "end"]
        );
    });

    it("should compile sin(piOver2)", () => {
        expect(compile("sin(piOver2)").main).toEqual(
            ["push 0", "start:", "get piOver2", "call sin", "end"]
        );
    });

    it("should compile if x == 1 then 1 else 2", () => {
        expect(compile("if x == 1 then 1 else 2").main).toEqual(
            ["push 0", "start:", "# begin if", "get x", "push 1", "cmp", "bne __0", "pop", "push 1", "bra __1", "__0: # else", "pop", "push 2", "__1: # end if", "end"]
        );
    });

    it("should compile if x < 1 then pi else 2", () => {
        // console.log(JSON.stringify(compile("if x < 1 then 1 else 2")));
        expect(compile("if x < 1 then pi else 2").main).toEqual(
            ["push 0", "start:", "# begin if", "get x", "push 1", "cmp", "bge __0", "pop", "call pi", "bra __1", "__0: # else", "pop", "push 2", "__1: # end if", "end"]
        );
    });
});

import { compile } from "../compile"

describe("When compile mezcal code to StackVM", () => {
    it("should compile 2 * (-3 + 1)^2", () => {
        expect(compile("2 * (-3 + 1)^2")).toEqual(
            [":start", "push 2", "push 3", "push -1", "mul", "push 1", "add", "push 2", "call pow", "mul", "end"]
        );
    });

    it("should compile let a = 23", () => {
        expect(compile("let a = 23")).toEqual(
            [":start", "push 23", "put a", "end"]
        );
    });

    it("should compile a = 23", () => {
        expect(compile("a = 23")).toEqual(
            [":start", "push 23", "put a", "end"]
        );
    });

    it("should compile a = 23\na * 2", () => {
        expect(compile("a = 23\na * 2")).toEqual(
            [":start", "push 23", "put a", "get a", "push 2", "mul", "end"]
        );
    });

    it("should compile sin(pi)", () => {
        expect(compile("sin(pi)")).toEqual(
            [":start", "call pi", "call sin", "end"]
        );
    });

    it("should compile log(e)", () => {
        expect(compile("log(e)")).toEqual(
            [":start", "call e", "call log", "end"]
        );
    });

    it("should compile sin(piOver2)", () => {
        expect(compile("sin(piOver2)")).toEqual(
            [":start", "get piOver2", "call sin", "end"]
        );
    });

    it("should compile if x == 1 then 1 else 2", () => {
        expect(compile("if x == 1 then 1 else 2")).toEqual(
            [":start", "get x", "push 1", "cmp", "beq __1", "push 2", "bra __1end", "__1:", "push 1", "__1end:", "end"]
        );
    });

    it("should compile if x < 1 then pi else pi/2", () => {
        // console.log(JSON.stringify(compile("if x < 1 then 1 else 2")));
        expect(compile("if x < 1 then pi else 2")).toEqual(
            [":start", "get x", "push 1", "cmp", "blt __1", "push 2", "bra __1end", "__1:", "push 1", "__1end:", "end"]
        );
    });
});

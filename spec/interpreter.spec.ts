import { execute } from "../execute"

describe("When use interpreter", () => {
    it("should interpret 2 * (-3 + 1)^2", () => {
        expect(execute("2 * (-3 + 1)^2")).toBe(8);
    });

    it("should interpret 2 * x", () => {
        expect(execute("2 * x", { x: 3 })).toBe(6);
    });

    it("should interpret 2 * (x + 1)^2", () => {
        expect(execute("2 * (x + 1)^2", { x: -3 })).toBe(8);
    });

    it("should get an error when variable not defined", () => {
        expect(() => execute("2 * x")).toThrowError(`Undefined variable "x"`);
    });

    // it("should set a variable", () => {
    //     expect(execute("let x = 2")).toBe(2);
    // });
});

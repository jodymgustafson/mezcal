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

    it("should set a variable", () => {
        expect(execute("let x = 2")).toBe(2);
    });

    it("should get a variable", () => {
        expect(execute(`
            let x = 2
            3*x`
        )).toBe(6);
    });

    it("should reassign a variable", () => {
        expect(execute(`
            let a = 3
            a = a^2`
        )).toBe(9);
    });

    it("should use block scope with let", () => {
        // The value in the parent block should not change because let was used in the block
        expect(execute(`
            let a = 3
            begin
              let a = 2
            end
            a`)).toBe(3);
    });

    it("should use block scope without let", () => {
        // The value in the parent block should change because let wasn't used in the block
        expect(execute(`
            let a = 3
            begin
              a = 2
            end
            a`
        )).toBe(2);
    });

    it("should interpret if-then-else", () => {
        expect(execute(`
            let a = 3
            if a < 0 then a = -1
            else a = 1
            a`
        )).toBe(1);
    });

    it("should interpret if-then-else block", () => {
        expect(execute(`
            let a = -3
            if a < 0 then begin
                a = -1
            end
            else begin
                a = 1
            end
            a`
        )).toBe(-1);
    });

    it("should get an error if missing then", () => {
        expect(() => execute(`
            let a = 3
            if a < 0 begin a = -1 end
            else a = 1
            a`
        )).toThrowError("Expect 'then' after if condition.");
    });
});

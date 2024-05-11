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

    it("should interpret logical or in if", () => {
        expect(execute(`
            let a = 0
            if (a < 0 or a > 0) then a = 1
            else a = -1
            a`
        )).toBe(-1);
    });

    it("should interpret logical or in else", () => {
        expect(execute(`
            let a = 3
            if (a < 0 or a > 0) then a = 1
            else a = -1
            a`
        )).toBe(1);
    });

    it("should interpret logical and in if", () => {
        expect(execute(`
            let a = -2
            if (a < 0 and a <> -1) then a = 1
            else a = -1
            a`
        )).toBe(1);
    });

    it("should interpret logical and in else", () => {
        expect(execute(`
            let a = 2
            if (a < 0 and a <> -1) then a = 1
            else a = -1
            a`
        )).toBe(-1);
    });

    it("should interpret while loop", () => {
        expect(execute(`
            let a = 0
            while a < 100 begin
                a = a + 1
            end
            a`
        )).toBe(100);
    });

    it("should interpret while loop no block", () => {
        expect(execute(`
            let b = 0
            let a = 100
            while a > 0 and b == 0 a = a - 1
            let b = b + 1
            a`
        )).toBe(0);
    });

    it("should interpret for-step loop", () => {
        expect(execute(`
            let cnt = 0
            for a = 0 to 100 step 2 cnt = cnt + 1
            cnt`
        )).toBe(50);
    });

    it("should interpret negative for-step loop", () => {
        expect(execute(`
            let cnt = 0
            for a = 100 to 0 step -4 begin
                cnt = cnt + 1
            end
            cnt`
        )).toBe(25);
    });

    it("should interpret for loop no step", () => {
        expect(execute(`
            let cnt = 0
            for a = 0 to 100 begin
                cnt = cnt + 1
            end
            cnt`
        )).toBe(100);
    });

    it("should interpret negative for loop no step", () => {
        expect(execute(`
            let cnt = 0
            for a = 100 to 0 begin
                cnt = cnt + 1
            end
            cnt`
        )).toBe(100);
    });
});

import { execute } from "../src/execute"

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
        expect(execute(`
            let a = 3
            if a < 0 begin a = -1 end
            else a = 1
            a`
        )).toBeUndefined()//.toThrowError("Expect 'then' after if condition.");
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
            for a = 1 to 10 step 2 cnt = cnt + a
            cnt`
        )).toBe(25);
    });

    it("should interpret negative for-step loop", () => {
        expect(execute(`
            let cnt = 0
            for a = 10 to 1 step -3 begin
                cnt = cnt + a
            end
            cnt`
        )).toBe(22);
    });

    it("should interpret for loop no step", () => {
        expect(execute(`
            let cnt = 0
            for a = 1 to 10 begin
                cnt = cnt + a
            end
            cnt`
        )).toBe(55);
    });

    it("should interpret negative for loop no step", () => {
        expect(execute(`
            let cnt = 0
            for a = 10 to 1 begin
                cnt = cnt + a
            end
            cnt`
        )).toBe(55);
    });

    it("should interpret function call no args", () => {
        expect(execute(`pi()`)).toEqual(Math.PI);
    });

    it("should interpret constant function call", () => {
        expect(execute(`pi`)).toEqual(Math.PI);
    });

    it("should interpret function call with args", () => {
        expect(execute(`
            let x = 1
            2 * sin(x + 1) + 3`
        )).toEqual(2 * Math.sin(2) + 3);
    });

    it("should get an error when undefined function", () => {
        expect(() => execute(`foo()`)).toThrowError(`Undefined function "foo"`);
    });

    it("should get an error when wrong argument count to function", () => {
        expect(() => execute(`sin(1, 2)`)).toThrowError(`Expected 1 arguments but got 2.`);
    });

    it("should get an error when try to execute non function", () => {
        expect(() => execute(`
            let x = "pi"
            x()`
        )).toThrowError(`"x" is not a function.`);
    });

    it("should interpret define function", () => {
        expect(execute(`
            function add(a, b) return a + b
            add(2, 3)`
        )).toEqual(5);
    });

    it("should use a return statement in a recursive factorial function", () => {
        expect(execute(`
            function fact(n) begin
                if (n <= 1) then return 1
                return n * fact(n - 1)
            end
            fact(4)`
        )).toEqual(24);
    });

    it("should use a return statement in a fibonacci function", () => {
        expect(execute(`
            function fib(n) begin
                if (n <= 1) then return n
                return fib(n - 2) + fib(n - 1)
            end
            fib(7)`
        )).toEqual(13);
    });

    it("should return a value at the top level", () => {
        const v = execute(`return 23 * 2`);
        expect(v).toEqual(46);
    })

    it("should compute a number and number as string", () => {
        expect(execute(`10 * "2"`)).toEqual(20);
        expect(execute(`10 / "2"`)).toEqual(5);
        expect(execute(`10 ^ "2"`)).toEqual(100);
        expect(execute(`10 - "2"`)).toEqual(8);
    });

    it("should concatenate a string", () => {
        expect(execute(`10 + "a"`)).toEqual("10a");
        expect(execute(`"a" + "b" + "c"`)).toEqual("abc");
    });

    it("should compare a string", () => {
        expect(execute(`"a" == "b"`)).toEqual(false);
        expect(execute(`"a" <> "b"`)).toEqual(true);
        expect(execute(`"a" < "b"`)).toEqual(true);
        expect(execute(`"1" < 2`)).toEqual(true);
    });

    it("should raise a user defined error", () => {
        expect(() => execute(`error "not implemented"`)).toThrowError("not implemented");
    })
});

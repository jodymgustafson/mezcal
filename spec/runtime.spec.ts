import { ParseError } from "../src/parser";
import { MezcalRuntimeError, Runtime } from "../src/runtime"

describe("When use the mezcal runtime", () => {
    describe("and call evaluate", () => {
        it("should resolve imports", () => {
            const rt = new Runtime();
            const r = rt.evaluate(`
                import "spec/files/import.test.mez"
                test("test value")
            `);
            expect(r).toEqual("test value-a-b");
        });

        it("should throw when import not found", () => {
            const rt = new Runtime();
            try {
                rt.evaluate(`
                    import "spec/files/foo.mez"
                    test("test value")
                `);
                expect("").toBe("Should have thrown an error");
            }
            catch (err) {
                expect(err).toBeInstanceOf(MezcalRuntimeError);
                expect((err as MezcalRuntimeError).message).toBe("There were parser errors");
                expect((err as MezcalRuntimeError).errors.length).toEqual(1);
                expect((err as MezcalRuntimeError).errors[0]).toBeInstanceOf(ParseError);
                expect((err as MezcalRuntimeError).errors[0].message).toContain(`ENOENT: no such file or directory, open`);
                expect((err as MezcalRuntimeError).errors[0].message).toContain(`\\Projects\\mezcal\\spec\\files\\foo.mez'`);
            }
        });
    });

    describe("and call load", () => {
        it("should resolve imports", () => {
            const rt = new Runtime();
            const r = rt.load("spec/files/import.test.mez");
            expect(r).toEqual(0);

            const r1 = rt.evaluate(`test("test value")`);
            expect(r1).toEqual("test value-a-b");
        });

        it("should error", () => {
            const rt = new Runtime();
            try {
                const r = rt.load("spec/files/foo.mez");
                expect("").toBe("Should have thrown an error");
            }
            catch (err) {
                expect(err).toBeInstanceOf(MezcalRuntimeError);
                expect((err as MezcalRuntimeError).message).toBe("Error loading file");
                expect((err as MezcalRuntimeError).errors.length).toEqual(1);
                expect((err as MezcalRuntimeError).errors[0]).toBeInstanceOf(Error);
                expect((err as MezcalRuntimeError).errors[0].message).toContain(`ENOENT: no such file or directory, open`);
                expect((err as MezcalRuntimeError).errors[0].message).toContain(`\\Projects\\mezcal\\spec\\files\\foo.mez'`);
            }
        });
    });
});

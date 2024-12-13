import { loadFile } from "../src/load-file";
import { ParseError } from "../src/parser";
import { MezcalRuntimeError, Runtime } from "../src/runtime"

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe("When use the mezcal runtime", () => {
    it("should resolve imports", async () => {
        const rt = new Runtime();
        const src = await loadFile("spec/files/import.test.mez");
        const r = rt.evaluate(src);
        expect(r).toEqual(0);

        const r1 = rt.evaluate(`test("test value")`);
        expect(r1).toEqual("test value-a-b");
    });

    it("should error", async () => {
        const rt = new Runtime();
        try {
            await loadFile("spec/files/foo.mez");
            expect("").toBe("Should have thrown an error");
        }
        catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect((err as MezcalRuntimeError).message).toBe("Error loading file: Path doesn't exist spec\\files\\foo.mez");
        }
    });
});

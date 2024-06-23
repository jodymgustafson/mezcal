import { compile } from "../compile"

describe("When compile mezcal code to StackVM", () => {
    it("should compile 2 * (-3 + 1)^2", () => {
        expect(compile("2 * (-3 + 1)^2")).toEqual(
            [":start","push 2","push 3","push -1","mul","push 1","add","push 2","call pow","mul","end"]
        );
    });
});

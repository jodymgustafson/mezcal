/** Used by the interpreter to bust out of a function when return is used */
export class Return extends Error {
    constructor(readonly value: any) {
        super();
        this.value = value;
    }
}
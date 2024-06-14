import { Interpreter } from "./interpreter";
import fs from 'fs';

export class MezcalLoader {
    constructor(readonly interpreter: Interpreter = new Interpreter()) { }

    loadSync(path: string): void {
        const data = fs.readFileSync(path, 'utf8');

    }
}
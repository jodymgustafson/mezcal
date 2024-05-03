// NOTE: This is a WIP and doesn't yet work!

import { TextFileWriter } from './text-file-writer';

/**
 * 
 * @param outputDir 
 * @param baseName 
 * @param types Type of the form: "Binary: Expr left, Token operator, Expr right",
 */
function generateAst(outputDir: string, baseName: string, types: string[]): void {
    const path = `${outputDir}/${baseName}.ts`;
    const writer = new TextFileWriter(path);
    writer.writeLine("export type Visitor<R> = {")
    writer.writeLine(`export type ${baseName} = {`);
    writer.writeLine("}");

    for (const type of types) {
        const typeName = type.split(":")[0].trim();
        const fields = type.split(":")[1].trim(); 
        defineType(writer, baseName, typeName, fields);
    }

    writer.close();
}

/**
 * 
 * @param writer 
 * @param typeName 
 * @param fields Fields of the form: "left: Expr, operator: Token, right: Expr",
 */
function defineType(writer: TextFileWriter, baseName: string, typeName: string, fieldList: string): void {
    writer.writeLine(`export type ${typeName} = ${baseName} & {`);
    const fields = fieldList.split(",");
    for (const field of fields) {
        const name = field.split(" ")[0];
    }
    writer.writeLine("}");
    
}

function defineVisitor(writer: TextFileWriter, baseName: string, typeName: string): void {
    writer.writeLine(`export interface Visitor<R> {`);
    writer.writeLine(`    visit${typeName}(expr: ${typeName}${baseName})" R;`);
    writer.writeLine("};")
}
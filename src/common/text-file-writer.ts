import fs from 'fs';

export type EncodingOrStreamOptions = BufferEncoding | {
    flags?: string;
    encoding?: BufferEncoding;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    emitClose?: boolean;
    start?: number;
    end?: number;
    highWaterMark?: number;
};

/**
 * Opens a stream for writing
 */
export function getFileWriteStream(path: string, options?: EncodingOrStreamOptions): fs.WriteStream {
    return fs.createWriteStream(path, options);
}
/**
 * A class to make it easier to write text files
 */
export class TextFileWriter {
    readonly stream: fs.WriteStream;

    constructor(path: string, options?: EncodingOrStreamOptions) {
        this.stream = getFileWriteStream(path, options);
    }

    write(chunk: string): void {
        this.stream.write(chunk);
    }
    writeLine(chunk: string): void {
        this.stream.write(chunk + "\r\n");
    }

    async close(): Promise<void> {
        return new Promise((res => {
            this.stream.close(() => res());
        }));
    }
}
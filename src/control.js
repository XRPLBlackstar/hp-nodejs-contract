const fs = require('fs');
import { constants, writeAsync } from './common';

export class ControlChannel {

    #fd = null;
    #readStream = null;

    constructor(fd) {
        this.#fd = fd;
    }

    consume(onMessage) {

        if (this.#readStream)
            throw "Control channel already consumed.";

        this.#readStream = fs.createReadStream(null, { fd: this.#fd, highWaterMark: constants.MAX_SEQ_PACKET_SIZE });
        this.#readStream.on("data", onMessage);
        this.#readStream.on("error", (err) => { });
    }

    send(obj) {
        const buf = Buffer.from(JSON.stringify(obj));
        if (buf.length > constants.MAX_SEQ_PACKET_SIZE)
            throw ("Control message exceeds max size " + constants.MAX_SEQ_PACKET_SIZE);
        return writeAsync(this.#fd, buf);
    }

    close() {
        this.#readStream && this.#readStream.close();
    }
}
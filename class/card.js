/**************************************************************
 * Copyright (c) 2017 IEI Integration Corp. http://www.ieiworld.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var CPU = require('./cpu');

class MVT {
    constructor(cardid, cpu1id, cpu2id) {
        this.cardid = cardid;
        this.CPU1 = new CPU(cpu1id);
        this.CPU2 = new CPU(cpu2id);

        this.info = {
            serialno: "",
            cardname: "Your Own Cardname",
            model: "Mustang-200",
            firmware: "",
            manufacturer: "IEI"
        }
    }

    cardID() {
        return this.cardid;
    }

    cpu(id) {
        if (id == this.CPU1.cpuID()) {
            return this.CPU1;
        } else if (id == this.CPU2.cpuID()) {
            return this.CPU2;
        }
        return undefined;
    }

    cpuIdx(idx) {
        if (idx == 1) {
            return this.CPU1;
        } else if (idx == 2) {
            return this.CPU2;
        }
        return undefined;
    }

    cpu1() {
        return this.CPU1;
    }

    cpu2() {
        return this.CPU2;
    }

    setInfo(data) {
        if (data == undefined) {
            return;
        }
        this.info.serialno = data.serialno === undefined ? this.info.serialno : data.serialno,
            this.info.cardname = data.cardname === undefined ? this.info.cardname : data.cardname,
            this.info.model = data.model === undefined ? this.info.model : data.model,
            this.info.firmware = data.firmware === undefined ? this.info.firmware : data.firmware,
            this.info.manufacturer = data.manufacturer === undefined ? this.info.manufacturer : data.manufacturer
    }

    getinfo() {
        return this.info;
    }

    getAllIPAddr() {
        var array = [
            this.CPU1.getIPAddr(),
            this.CPU2.getIPAddr()
        ];
        return array;
    }

    getAllIPAndPort() {
        var array = [
            this.CPU1.getIPAddr() + ":" + this.CPU1.getPort(),
            this.CPU2.getIPAddr() + ":" + this.CPU2.getPort()
        ];
        return array;
    }

    getAllPort() {
        var array = [
            this.CPU1.getPort(),
            this.CPU2.getPort()
        ];
        return array;
    }

    getAllGstreamerPort() {
        var array = [
            this.CPU1.getGstreamerPort(),
            this.CPU2.getGstreamerPort()
        ];
        return array;
    }

    getAllCPUID() {
        var array = [
            this.CPU1.cpuID(),
            this.CPU2.cpuID()
        ];
        return array;
    }
}

module.exports = MVT;
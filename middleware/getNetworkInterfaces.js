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
const exec = require('child_process').exec;

function getNetworkInterfaces() {
    return new Promise(function(resolve, reject) {
        var cmd = "ifconfig";
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            var newStart = true;
            var array = stdout.split('\n');
            var interfacesInfo = [];
            var interfaceName = "";

            for (var i = 0; i < array.length; i++) {
                var row = array[i].split(" ");
                while (row[0][row[0].length - 1] == ":") {
                    row[0] = row[0].replace(":", "");
                }
                if (row[0] != "" && row[0] != "lo") {
                    interfaceName = row[0];
                    newStart = false;
                }
                if (newStart == false) {
                    for (var j = 0; j < row.length; j++) {
                        var matchResut = row[j].match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/);
                        if (matchResut != null && row[j] == row[j].match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)[0]) {
                            var obj = {
                                interfaceName: interfaceName,
                                mac: row[j]
                            };
                            interfacesInfo.push(obj);
                            newStart = true;
                        }
                    }
                }
            }
            resolve(interfacesInfo);
        });
    });
}

module.exports = getNetworkInterfaces;
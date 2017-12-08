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
var exec = require('child_process').exec;

function getNasInterfacesName() {
    return new Promise(function(resolve, reject) {
            exec("dmesg | grep tn40", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
                resolve(stdout);
            });
        })
        .then(function(data) {
            var result = parseInfo(data);
            return result;
        })
}

function parseInfo(data) {
    if (data == null || data == undefined || data.length == 0) {
        return undefined;
    }
    var nameArray = [];
    var data = data.split('\n');
    for (var i = 0; i < data.length; i++) {
        if (data[i].indexOf('eth') != -1 && data[i].indexOf('Port') != -1) {
            var name = data[i].split(':')[1].split(',')[0].replace(',', '');
            if (nameArray.indexOf(name) == -1) {
                nameArray.push(name.trim());
            }
        }
    }
    return nameArray;
}

module.exports = getNasInterfacesName;
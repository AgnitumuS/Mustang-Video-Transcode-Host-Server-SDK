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

function getUsedPorts() {
    return new Promise(function(resolve, reject) {
        exec("netstat -tpln", function(error, stdout) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            var result = [];
            var array = stdout.split('\n');
            for (var i = 0; i < array.length; i++) {
                var row = array[i].replace(/\s\s+/g, ' ').split(' ');
                if (row[0].indexOf('tcp') != -1) {
                    var data = row[3].split(':');
                    result.push(data[data.length - 1]);
                }
            }
            resolve(result);
        });
    })
}

function checkUsedPortsAndIncrementIdx(portNum, usedPorts, newOccupiedPorts) {
    if (usedPorts == undefined || usedPorts.length == 0) {
        return {
            portNum: portNum,
            newOccupiedPorts: newOccupiedPorts
        }
    }
    while (usedPorts.indexOf(portNum) != -1 || newOccupiedPorts.indexOf(portNum) != -1) {
        portNum++;
    }
    var result = {
        portNum: portNum,
        newOccupiedPorts: newOccupiedPorts
    }
    return result;
}

module.exports = getUsedPorts;
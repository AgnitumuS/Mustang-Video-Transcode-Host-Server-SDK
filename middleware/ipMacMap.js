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

function ipMacMap(address, bridgeName) {
    return new Promise(function(resolve, reject) {
        var proc = exec("arp -a | grep " + bridgeName + " | awk '{print $2,$4}'| sed 's/[()]//g'", function(error, stdout) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            resolve(stdout);
        });
    })
    .then(function(result) {
        return new Promise(function(resolve, reject) {
            result = result.split('\n');
            for (var i = 0; i < result.length; i++) {
                var row = result[i].split(' ');
                if (row[0] == address) {
                    var obj = {
                        address : address,
                        macAddr : row[1]
                    }
                    resolve(obj);
                }
            }
            resolve(undefined);
        })
        .catch(function(err) {
            console.log(err);
        });
    })
    .catch(function(err) {
        console.log(err);
    });
}

module.exports = ipMacMap;
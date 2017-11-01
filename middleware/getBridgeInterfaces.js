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

function getBridgeInterfaces(bridgeName) {
    return new Promise(function(resolve, reject) {
        var cmd = "brctl show " + bridgeName + " | awk 'NR==2 {print $4}'";
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "" || stdout == undefined) {
                resolve(undefined);
            } else {
                var data = stdout.trim().split('\n'); 
                resolve(data[0]);
            }
        });
    })
    .then(function(data) {
        return new Promise(function(resolve, reject) {
            var cmd = "brctl show " + bridgeName + " | awk 'NF==1 {print $1}'";
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                }
                var result = [];
                if (stdout == "" || stdout == undefined) {
                    if (data != undefined && data != "") {
                        result.unshift(data);
                    }
                } else {
                    result = stdout.trim().split('\n');
                    if (data != undefined && data != "") {
                        result.unshift(data);
                    }
                }
                resolve(result);
            });
        })
        .catch(function(err) {
            console.log(err);
        });
    })
    .catch(function(err) {
        console.log(err);
    })
}

module.exports = getBridgeInterfaces;
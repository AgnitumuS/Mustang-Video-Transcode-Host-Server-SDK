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
var fs = require('fs');
var path = require('path');
var config = require('../config/config');
var exec = require('child_process').exec;

function getPlatform() {
    return new Promise(function(resolve, reject) {
        if (process.platform == 'linux') {
            var content = fs.readFileSync('/proc/self/cgroup', "utf8");
            if (content.indexOf('docker') != -1) {
                config.platform = 'qts';
            } else {
                config.platform = 'linux';
            }
            resolve(config.platform);
        } else if (process.platform.indexOf('win') != -1) {
            config.platform = 'windows';
            resolve(config.platform);
        } else {
            resolve(undefined);
        }
    })
    .catch(function(err) {
        console.log(err);
    });
}

module.exports = getPlatform;
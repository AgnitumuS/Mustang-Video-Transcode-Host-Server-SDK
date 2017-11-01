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
const filePath = '/etc/samba/smb.conf';
var config = require('../config/config');

function writeToSmbConf() {
    var contextArray = [
        '[share]',
        '# mustang_samba_setting',
        'browseable = yes',
        'path = ' + config.hostMountedDir,
        'guest ok = no',
        'writable = yes'
    ];
    var content = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    var result = false;
    for (var i = 0; i < content.length; i++) {
        var row = removeSpace(content[i]);
        if (row == '[share]') {
            result = checkSame(content.slice(i, i + 6), contextArray);
        }
    }
    if (result == false) {
        content = content.concat(contextArray);
        writeToFile(content, filePath);
    }
}

function checkSame(content, contextArray) {
    for (var i = 0; i < content.length; i++) {
        var contentRow = removeSpace(content[i]);
        var contextRow = removeSpace(contextArray[i]);
        if (contentRow != contentRow) {
            return false;
        }
    }
    return true;
}

function removeSpace(str) {
    var slow = 0;
    var fast = 0;
    var wordCount = 0;
    var array = str.split('');
    while (true) {
        while (fast < array.length && array[fast] == ' ') {
            fast++;
        }
        if (fast == array.length) {
            break;
        }
        if (wordCount > 0) {
            array[slow++] = ' ';
        }
        while (fast < array.length && array[fast] != ' ') {
            array[slow++] = array[fast++];
        }
        wordCount++;
    }
    return array.slice(0, slow).join('');
}

function writeToFile(data, targetPath) {
    new Promise(function(resolve, reject) {
            var file = fs.createWriteStream(targetPath);
            file.on('error', function(err) {
                console.log(err);
            });

            for (var i = 0; i < data.length; i++) {
                if (i != data.length - 1) {
                    file.write(data[i] + "\n");
                } else {
                    file.write(data[i]);
                }
            }
            file.end();
            file.on('close', function(err) {
                resolve({
                    Message: "Success"
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = writeToSmbConf;
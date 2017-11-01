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
var targetFilepath = '/etc/default/isc-dhcp-server';
const fileNullMsg = "File is null";
const checkEnvNull = "Please check your system have dhcp";
var envFlag = false;

function checkExist(filepath) {
    var promise = new Promise(function(resolve, reject) {
        if (envFlag == true) {
            resolve();
        } else {
            var fileExistFlag = false;
            try {
                fs.statSync(filepath);
                resolve();
            } catch (err) {
                reject(err);
            }
        }
    });
    return promise;
}

var updateContent = function(name) {
    if (name == null) {
        return;
    }
    if (name.length < 0) {
        return;
    }
    var promise = new Promise(function(resolve, reject) {
        var filepath = targetFilepath;
        checkExist(filepath).then(function() {
            envFlag = true;
            try {
                fs.readFile(filepath, 'utf8', function(err, data) {
                    if (err) {
                        console.log("update read error " + err);
                        reject("read file error");
                    }
                    var title = "INTERFACES";
                    var myRegexp = /INTERFACES=".+"/g;
                    var myRegexp2 = /INTERFACES=""/g;
                    var flag = false;
                    var startIndex = -1;
                    var endIndex = -1;
                    var match = myRegexp.exec(data);
                    if (match != null) {
                        flag = true;
                        startIndex = match.index + title.length + 1;
                        endIndex = match.index + match[0].length - 1;
                    } else {
                        var match2 = myRegexp2.exec(data);
                        if (match2 != null) {
                            flag = true;
                            startIndex = match2.index + title.length + 1;
                            endIndex = match2.index + match2[0].length - 1;
                        }
                    }
                    if (startIndex >= 0) {
                        var contentStr = data.substr(startIndex, endIndex - startIndex);
                        var resultPartStr = contentStr;
                        var pairFlag = -1;
                        if (contentStr.length == 1) {
                            resultPartStr = name;
                        } else {
                            pairFlag = contentStr.indexOf(name);
                        }

                        if (pairFlag < 0) {
                            resultPartStr = contentStr + " " + name;
                            var result = data.substr(0, startIndex) + resultPartStr + data.substr(endIndex);
                            fs.writeFile(filepath, result, 'utf8', function(err) {
                                if (err) {
                                    console.log("update writeFile error " + err);
                                    reject("write file error");
                                    return;
                                } else {
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }
                    } else {
                        reject(checkEnvNull);
                    }
                });
            } catch (err) {
                reject(fileNullMsg);
            }
        }).catch(function(err) {
            console.log("checkExist err " + err);
            envFlag = false;
            reject(fileNullMsg);
        });
    });
    return promise;
};
module.exports = {
    updateContent: updateContent
};
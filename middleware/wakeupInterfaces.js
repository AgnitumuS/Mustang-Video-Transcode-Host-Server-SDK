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
var getNasInterfacesName = require('./getNasInterfacesName');

function wakeupInterfaces() {
    return Promise.resolve(getNoIPInterfaces())
        .then(function(inactiveInterfaces) {
            return new Promise(function(resolve, reject) {
                if (inactiveInterfaces == undefined || inactiveInterfaces.length == 0) {
                    resolve({message : "No Interfaces need to wake up!"});
                } else {
                    var promiseArray = [];
                    for (var i = 0; i < inactiveInterfaces.length; i++) {
                        promiseArray.push(Promise.resolve(ifconfigUp(inactiveInterfaces[i])));
                    }
                    return Promise.all(promiseArray)
                        .then(function(allData) {
                            var allPass = true;
                            for (var i = 0; i < allData.length; i++) {
                                if (allData[i].success == false) {
                                    allPass = false;
                                }
                            }
                            var result = {
                                success : allPass
                            }
                            setTimeout(function() {
                                resolve(result);
                            }, 3000);
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                }
            })
        })
        .then(function(result) {
            return Promise.resolve(getNasInterfacesName())
                .then(function(nasInterfacesName) {
                    var promiseArray = [];
                    for (var i = 0; i < nasInterfacesName.length; i++) {
                        promiseArray.push(Promise.resolve(flushIP(nasInterfacesName[i])));
                    }
                    return Promise.all(promiseArray)
                        .then(function(allData) {
                            var allPass = true;
                            for (var i = 0; i < allData.length; i++) {
                                if (allData[i].success == false) {
                                    allPass = false;
                                }
                            }

                            return {success : allPass};
                        });
                });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function getNoIPInterfaces() {
    return new Promise(function(resolve, reject) {
        var cmd = "ifconfig -a";
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            var array = stdout.split('\n');
            var internetCards = [];
            var cardNameCandidate = "";
            var foundInet = false;

            for (var i = 0; i < array.length; i++) {
                var row = array[i].split(" ");
                if (row[0] != "") {
                    if (foundInet == false && cardNameCandidate != "") {
                        internetCards.push(cardNameCandidate);
                    }
                    cardNameCandidate = row[0].replace(":", "");
                    foundInet = false;
                } else if (array[i].indexOf('inet') != -1 && row[row.indexOf('inet')] === 'inet') {
                    foundInet = true;
                }
            }
            if (internetCards.indexOf('lo') != -1) {
                internetCards.splice(internetCards.indexOf('lo'), 1);
            }
            resolve(internetCards);
        });
    });    
}

function ifconfigUp(interfaceName) {
    return new Promise(function(resolve, reject) {
        var cmd = "ifconfig " + interfaceName + " up";
        var proc = exec(cmd, function(error, stdout) {
            if (error !== null) {
                console.log('exec error: ' + error);
                resolve({success : false});
            }
        });

        proc.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        proc.on('exit', function(code) {
            resolve({success: true});
        });
    })
    .catch(function(err) {
        console.log(err);
    });
}

function flushIP(interfaceName) {
    return new Promise(function(resolve, reject) {
        var cmd = "ip -4 addr flush dev " + interfaceName;
        var proc = exec(cmd, function(error, stdout) {
            if (error !== null) {
                console.log('exec error: ' + error);
                resolve({success : false});
            }
        });

        proc.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        proc.on('exit', function(code) {
            resolve({success: true});
        });
    })
    .catch(function(err) {
        console.log(err);
    });
}

module.exports = wakeupInterfaces;
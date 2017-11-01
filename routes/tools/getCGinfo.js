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
var request = require('request');

var getCGinfo = function(array) {
    var promiseArray = [];
    for (var i = 0; i < array.length; i++) {
        var wolf = Promise.resolve(cgUsage(array[i]));
        promiseArray.push(wolf);
    }

    return Promise.all(promiseArray)
        .then(function(allData) {
            return new Promise(function(resolve, reject) {
                var usageArray = [];
                var cpuavgCount = 0;
                var gpuavgCount = 0;
                var cpuSum = 0;
                var gpuSum = 0;

                for (var i = 0; i < allData.length; i++) {
                    if (allData[i].success == false) {
                        usageArray.push(allData[i]);
                    } else if (allData[i].success == true) {
                        cpuavgCount++;
                        gpuavgCount = allData[i].gpuUsage == null ? gpuavgCount : gpuavgCount + 1;
                        cpuSum = cpuSum + allData[i].cpuUsage;
                        gpuSum = allData[i].gpuUsage == null ? gpuSum : gpuSum + allData[i].gpuUsage;
                        var idx = i + 1;
                        var element = {
                            cpu: allData[i].cpuUsage,
                            gpu: allData[i].gpuUsage,
                            gam: allData[i].gam,
                            cs: allData[i].cs
                        }
                        usageArray.push(element);
                    }
                }
                var obj = {
                    cpuavg: (cpuSum / cpuavgCount).toFixed(2).toString(),
                    gpuavg: (gpuSum / gpuavgCount).toFixed(2).toString(),
                    usage: usageArray
                }
                resolve(obj);
            });
        });
}

function cgUsage(targetURL) {
    var cpuURL = targetURL + "/submachine/cpuusage";
    var gpuURL = targetURL + "/submachine/gpuusage";
    return Promise.all([cpuUsage(cpuURL), gpuUsage(gpuURL)])
        .then(function(allData) {
            return new Promise(function(resolve, reject) {
                if (allData[0].success == false || allData[1].success == false) {
                    var msg = {
                        success: false,
                        message: "Oh Noooooo~~~~, Connection to " + targetURL + " timeout!!!",
                        error: allData[0].error
                    }
                    resolve(msg);
                } else {
                    var obj = {
                        success: true,
                        cpuUsage: allData[0].result.data.cpuUsage == null ? null : Number.parseFloat(allData[0].result.data.cpuUsage),
                        gpuUsage: allData[1].result.data.gpuUsage == null ? null : Number.parseFloat(allData[1].result.data.gpuUsage),
                        gam: allData[1].result.data.gam == null ? null : Number.parseFloat(allData[1].result.data.gam),
                        cs: allData[1].result.data.cs == null ? null : Number.parseFloat(allData[1].result.data.cs)
                    };
                    resolve(obj);
                }
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function cpuUsage(targetURL) {
    return new Promise(function(resolve, reject) {
        request(targetURL, {
            timeout: 1500
        }, function(error, response, body) {
            if (error) {
                console.log("Oh Noooooo~~~~, Connection to " + targetURL + " timeout!!!");
                console.log(error);
                var msg = {
                    success: false,
                    message: "Oh Noooooo~~~~, Connection to " + targetURL + " timeout!!!",
                    error: error
                }
                resolve(msg);
            } else {
                var msg = {
                    success: true,
                    result: JSON.parse(body)
                }
                resolve(msg);
            }
        });
    });
}

function gpuUsage(targetURL) {
    return new Promise(function(resolve, reject) {
        request(targetURL, {
            timeout: 1500
        }, function(error, response, body) {
            if (error) {
                console.log("Oh Noooooo~~~~, Connection to " + targetURL + " timeout!!!");
                console.log(error);
                var msg = {
                    success: false,
                    message: "Oh Noooooo~~~~, Connection to " + targetURL + " timeout!!!",
                    error: error
                }
                resolve(msg);
            } else {
                var msg = {
                    success: true,
                    result: JSON.parse(body)
                }
                resolve(msg);
            }
        });
    });
}

module.exports = getCGinfo;
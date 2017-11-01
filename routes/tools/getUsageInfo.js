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
var cardMap = require('../../config/cardMap');

function getUsageInfo(cardid, targetInfo) {
    var urlArray = buildTargetURLs(cardid, targetInfo);
    var promiseArray = [];
    for (var i = 0; i < urlArray.length; i++) {
        promiseArray.push(Promise.resolve(getUsageFromOneCPU(urlArray[i])));
    }

    return Promise.all(promiseArray)
        .then(function(allData) {
            return new Promise(function(resolve, reject) {
                var usageArray = [];
                for (var i = 0; i < allData.length; i++) {
                    if (allData[i].success == true) {
                        allData[i].data["cpuId"] = "CPUID" + (i + 1);
                        usageArray.push(allData[i].data);
                    } else {
                        usageArray.push(null);
                    }
                }
                var result = {
                    cardid: cardid,
                    usage: usageArray
                }
                resolve(result);
            })
        });
}

function getUsageFromOneCPU(targetURL) {
    return new Promise(function(resolve, reject) {
        request(targetURL, {
            timeout: 1500
        }, function(error, response, body) {
            if (error) {
                console.log("Opps, Connection to " + targetURL + " timeout!!!");
                console.log(error);
                var msg = {
                    success: false,
                    message: "Opps, Connection to " + targetURL + " timeout!!!",
                    error: error
                }
                resolve(msg);
            } else {
                if (body[0] == "<") {
                    var msg = {
                        success: false,
                        message: "Internal Server Error"
                    }
                    resolve(msg);
                } else {
                    var msg = {
                        success: true,
                        data: JSON.parse(body).data
                    }
                    resolve(msg);
                }
            }
        });
    });
}

function buildTargetURLs(cardid, targetInfo) {
    var targetURL = "";
    var infoURI = "";
    switch (targetInfo) {
        case "temperature":
            infoURI = "/submachine/cputemp";
            break;
        case "traffic":
            infoURI = "/submachine/traffic";
            break;
        case "memoryusage":
            infoURI = "/submachine/memoryusage";
            break;
        default:
            infoURI = "";
    }
    var array = cardMap[cardid].getAllIPAndPort();
    for (var i = 0; i < array.length; i++) {
        array[i] = "http://" + array[i] + infoURI;
    }
    return array;
}

module.exports = getUsageInfo;
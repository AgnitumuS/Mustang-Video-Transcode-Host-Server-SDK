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
var config = require('../config/config');
var request = require('request');
var loadCards = require('./loadCards');
var buildIPTable = require('./buildIPTable');
var faye = require("./faye");
var mountRequest = require("./mountRequest");
var cardMap = require('../config/cardMap');
var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();
var detectedCardsRecord = require('./detectedCardsRecord');
var cards = [];
var statusMap = {};
var loadedCardID = [];
var count = 0;

function queryingWindowsCards(ipArray, firstRound) {
    if (firstRound) {
        count = 0;
        getCardsOnMachine(ipArray, firstRound);
        setTimeout(function() {
            count++;
            if (reloadCheck()) {
              queryingWindowsCards(ipArray, false);
            } else {
              console.log("All Recorded Cards Started!");
              console.log(Object.keys(cardMap));
            }
        }, 5 * 1000);
    } else {
        if (reloadCheck()) {
            getCardsOnMachine(ipArray, firstRound);
            count++;
            if (count < 10) {
                setTimeout(function() {
                    queryingWindowsCards(ipArray, false);
                }, 5 * 1000);
            } else {
                console.log("Detecting stopped!");
            }
        } else {
            console.log("All Recorded Cards Started!");
            console.log(Object.keys(cardMap));
        }
    }
}

function getCardsOnMachine(ipArray, firstRound) {
    console.log("Detecting Cards...");
    var promiseArray =[];
    for (var i = 0; i < ipArray.length; i++) {
        if (firstRound == true) {
          statusMap[ipArray[i]] = false;
        }
        promiseArray.push(Promise.resolve(requestCardinfo(ipArray[i])));
    }
    Promise.all(promiseArray)
        .then(function(allData) {
            for (var i = 0; i < allData.length; i++) {
                if (allData[i].success == true && allData[i].response.message == "Success") {
                    var dataObj = {
                        cardid : "CARD" + allData[i].response.data["Led"],
                        serialno : allData[i].response.data["System Information"]["Serial Number"],
                        model : allData[i].response.data["System Information"]["Product Name"],
                        firmware : allData[i].response.data["System Information"]["Version"],
                        manufacturer : allData[i].response.data["System Information"]["Manufacturer"],
                        cpu : [{
                            cpuid : "",
                            processor : allData[i].response.data["Processor Information"],
                            memory : allData[i].response.data["Memory Device"]["Size"],
                            hostSideIPaddress : "",
                            ipaddress : allData[i].address,
                            mac : "",
                            qtsName : allData[i].response.data["qtsName"],
                            version : allData[i].response.data["Version"],
                            statusMap: "running"
                        }]
                    }
                    statusMap[allData[i].address] = true;
                    buildCards(dataObj);
                }
            }
            reloadCheck();
            console.log("IP Connection Status:");
            console.log(statusMap);
        })
        .catch(function(err) {
            console.log(err);
        });
}

function requestCardinfo(ipAddr) {
    return new Promise(function(resolve, reject) {
            request({
                url: "http://" + ipAddr + ":" + config.cardPorts.container_ffmpeg + "/submachine/cardinfo",
                method: 'GET',
                timeout: 2000
            }, function(error, response, body) {
                if (error) {
                    var obj = {
                        success: false,
                        message: "Request to " + ipAddr + " failed!"
                    }
                    resolve(obj);
                } else {
                    body = body[0] == "{" ? JSON.parse(body) : body;
                    var obj = {
                        success: true,
                        address: ipAddr,
                        response: body
                    }
                    resolve(obj);
                }
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function buildCards(dataObj) {
    lock.readLock(function(release) {
        lock.writeLock(function(release) {
            if (cards.length == 0) {
                dataObj.cpu[0].cpuid = "CPUID1";
                cards.push(dataObj);
            } else {
                var found = false;
                var cardBuild = false;
                for (var i = 0; i < cards.length; i++) {
                    if (cards[i].cardid == dataObj.cardid) {
                        if (cards[i].cpu.length < 2 && cards[i].cpu[0].ipaddress != dataObj.cpu[0].ipaddress) {
                            var order = cards[i].cpu[0].ipaddress.split('.')[2] - dataObj.cpu[0].ipaddress.split('.')[2];
                            if (order < 0) {
                                dataObj.cpu[0].cpuid = "CPUID2";
                                cards[i].cpu.push(dataObj.cpu[0]);
                            } else {
                                cards[i].cpu[0].cpuid = "CPUID2";
                                dataObj.cpu[0].cpuid = "CPUID1";
                                cards[i].cpu.unshift(dataObj.cpu[0]);
                            }
                            found = true;
                        } else {
                            cardBuild = true;
                        }
                    }
                }
                if (found == false && cardBuild == false) {
                    dataObj.cpu[0].cpuid = "CPUID1";
                    cards.push(dataObj);
                }
            }
            release();
        });
        release();
    });
}

function reloadCheck() {
    var reloadCardInfo = false;
    if (Object.keys(statusMap).length == 0) {
        reloadCardInfo = true;
    } else {
        for (var ipAddr in statusMap) {
            if (statusMap[ipAddr] == false) {
                reloadCardInfo = true;
            }
        }
    }
    for (var i = 0; i < cards.length; i++) {
        if (loadedCardID.indexOf(cards[i].cardid) == -1 && cards[i].cpu.length == 2) {
            loadedCardID.push(cards[i].cardid);
            loadCards([cards[i]]);
            faye([cards[i].cardid]);
            mountRequest.mountAllCards();
        }
    }
    return reloadCardInfo;
}

module.exports = queryingWindowsCards;

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
var mapIPAddr = require('./mapIPAddr');
var buildIPTable = require('./buildIPTable');
var faye = require("./faye");
var mountRequest = require("./mountRequest");
var cardMap = require('../config/cardMap');
var detectedCardsRecord = require('./detectedCardsRecord');

function queryingCards(runAgain) {
    var cards = needQueryCards();
    if (cards.length != 0) {
        getCardsOnMachine(cards, runAgain);
        setTimeout(function() {
            queryingCards()
        }, 10 * 1000);
    } else if (cards.length == 0) {
        console.log("Result of Mustang Cards:");
        console.log(config.detectedCards);
    }
}

function getCardsOnMachine(cards, runAgain) {
    Promise.resolve(mapIPAddr())
        .then(function(msg) {
            // console.log(msg.message);
            return Promise.resolve(buildIPTable());
        })
        .then(function(msg) {
            // console.log(msg.message);
            var promiseArr = [];
            for (var i = 0; i < cards.length; i++) {
                promiseArr.push(Promise.resolve(requestSingleCard(cards[i])))
            }
            Promise.all(promiseArr)
                .then(function(mustangs) {
                    loadCards(mustangs);
                    checkCallFaye();
                    mountRequest.mountAllCards();
                    if (runAgain != true) {
                        detectedCardsRecord.wirteToDB();
                    } 
                })
                .catch(function(err) {
                    console.log(err);
                });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function requestSingleCard(key) {
    var promiseArr = [];
    var currentCard = config.detectedCards[key];
    promiseArr.push(requestCardinfo(currentCard.cpu1.ipAddr));
    promiseArr.push(requestCardinfo(currentCard.cpu2.ipAddr));

    return Promise.all(promiseArr)
        .then(function(allData) {
            var dataObj = {
                cpu : []
            }
            for (var i = 0; i < allData.length; i++) {
                if (i == 0) {
                    if (allData[i].success == true && allData[i].response.message == "Success") {
                        dataObj.cardid = "CARD" + allData[i].response.data["Led"];
                        dataObj.serialno = allData[i].response.data["System Information"]["Serial Number"];
                        dataObj.model = allData[i].response.data["System Information"]["Product Name"];
                        dataObj.firmware = allData[i].response.data["System Information"]["Version"];
                        dataObj.manufacturer = allData[i].response.data["System Information"]["Manufacturer"];
                        dataObj.cpu[0] = {
                            cpuid: "CPUID1",
                            processor: allData[i].response.data["Processor Information"],
                            memory: allData[i].response.data["Memory Device"]["Size"],
                            hostSideIPaddress: "169.254.100.1",
                            ipaddress: currentCard.cpu1.ipAddr,
                            mac: "",
                            qtsName: allData[i].response.data["qtsName"],
                            version: allData[i].response.data["Version"],
                            statusMsg: "running"
                        };
                        config.detectedCards[key].cpu1.apiConnected = true;
                    } else if (allData[i].success == true && allData[i].response.message != "Success") {
                        var obj = {
                            cpuid: "CPUID1",
                            statusMsg: "mustang internal server error"
                        };
                        dataObj.cardid = "CARD" + parseInt(key).toString(16);
                        dataObj.cpu[0] = obj;
                    } else {
                        if (currentCard.cpu1.ipConnected == true) {
                            var obj = {
                                cpuid: "CPUID1",
                                statusMsg: "application not connected"
                            }
                        } else if (currentCard.cpu1.ipConnected == false) {
                            var obj = {
                                cpuid: "CPUID1",
                                statusMsg: "network not connected"
                            }
                        }
                        dataObj.cardid = "CARD" + parseInt(key).toString(16);
                        dataObj.cpu[0] = obj;
                    }
                } else if (i == 1) {
                    if (allData[i].success == true && allData[i].response.message == "Success") {
                        dataObj.cardid = "CARD" + allData[i].response.data["Led"];
                        dataObj.serialno = allData[i].response.data["System Information"]["Serial Number"];
                        dataObj.model = allData[i].response.data["System Information"]["Product Name"];
                        dataObj.firmware = allData[i].response.data["System Information"]["Version"];
                        dataObj.manufacturer = allData[i].response.data["System Information"]["Manufacturer"];
                        dataObj.cpu[1] = {
                            cpuid: "CPUID2",
                            processor: allData[i].response.data["Processor Information"],
                            memory: allData[i].response.data["Memory Device"]["Size"],
                            hostSideIPaddress: "169.254.100.1",
                            ipaddress: currentCard.cpu2.ipAddr,
                            mac: "",
                            qtsName: allData[i].response.data["qtsName"],
                            version: allData[i].response.data["Version"],
                            statusMsg: "running"
                        };
                        config.detectedCards[key].cpu2.apiConnected = true;
                    } else if (allData[i].success == true && allData[i].response.message != "Success") {
                        var obj = {
                            cpuid: "CPUID2",
                            statusMsg: "mustang internal server error"
                        };
                        dataObj.cardid = "CARD" + parseInt(key).toString(16);
                        dataObj.cpu[1] = obj;
                    } else {
                        if (currentCard.cpu2.ipConnected == true) {
                            var obj = {
                                cpuid: "CPUID2",
                                statusMsg: "application not connected"
                            }
                        } else if (currentCard.cpu2.ipConnected == false) {
                            var obj = {
                                cpuid: "CPUID2",
                                statusMsg: "network not connected"
                            }
                        }
                        dataObj.cardid = "CARD" + parseInt(key).toString(16);
                        dataObj.cpu[1] = obj;
                    }
                }
            }
            return dataObj;
        })
        .catch(function(err) {
            console.log(err);
        });
}

function needQueryCards() {
    var obj = config.detectedCards;
    var result = [];
    for (var key in obj) {
        if (obj[key].cpu1.ipConnected == true && obj[key].cpu1.apiConnected == false ||
            obj[key].cpu2.ipConnected == true && obj[key].cpu2.apiConnected == false
        ) {
            result.push(key);
        }
    }
    console.log("Detecting MVT Application...");
    return result;
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

function checkCallFaye() {
    var currentCards = config.detectedCards;
    for (var key in currentCards) {
        var obj = currentCards[key];
        var callFaye = true;
        if (obj.cpu1.ipConnected == true && obj.cpu1.apiConnected == false 
            || obj.cpu2.ipConnected == true && obj.cpu2.apiConnected == false
            ) {
            callFaye = false;
        }
        if (callFaye == true) {
            var cardid = "CARD" + parseInt(key).toString(16);
            var input = [];
            input.push(cardid);
            faye(input);
        }
    }
}

module.exports = queryingCards;
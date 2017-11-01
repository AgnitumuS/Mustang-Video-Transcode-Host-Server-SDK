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
var install = require('../installation/install');
var config = require('../config/config');
var iptables = install.iptables;
var add_iptables = install.add_iptables;
var exe_iptables = install.exe_iptables;
var getUsedPorts = require('../routes/tools/getUsedPorts');
var getExternalIP = require("./getExternalIP");
var newOccupiedPorts = [];

function buildIPTable() {
    var detectedCards = config.detectedCards;
    return Promise.resolve(getExternalIP())
        .then(function(externalIP) {
            var externalInterface = externalIP.name;
            iptables(externalInterface);
            return Promise.resolve(getUsedPorts())
                .then(function(usedPorts) {
                    return new Promise(function(resolve, reject) {
                            var obj = {
                                externalInterface: externalInterface,
                                usedPorts: usedPorts
                            }
                            resolve(obj);
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                });
        })
        .then(function(dataObj) {
            var externalInterface = dataObj.externalInterface;
            var usedPorts = dataObj.usedPorts;
            var index = 0;
            for (var key in detectedCards) {
                add_iptables(detectedCards[key].cpu1.ipAddr, externalInterface, buildPortsObject(usedPorts, index++));
                add_iptables(detectedCards[key].cpu2.ipAddr, externalInterface, buildPortsObject(usedPorts, index++));
            }
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve("add_iptables completed");
                }, 100);
            })
        })
        .then(function(msg) {
            return Promise.resolve(exe_iptables());
        })
        .catch(function(err) {
            console.log(err);
        });
}

function checkUsedPortsAndIncrementIdx(portNum, usedPorts, newOccupiedPorts) {
    if (usedPorts == undefined || usedPorts.length == 0) {
        return {
            portNum: portNum,
            newOccupiedPorts: newOccupiedPorts
        }
    }
    while (usedPorts.indexOf(portNum) != -1 || newOccupiedPorts.indexOf(portNum) != -1) {
        portNum++;
    }
    var result = {
        portNum: portNum,
        newOccupiedPorts: newOccupiedPorts
    }
    return result;
}

function buildPortsObject(usedPorts, index) {
    tempData = checkUsedPortsAndIncrementIdx(config.cardPorts.qts + index, usedPorts, newOccupiedPorts);
    nasPort = tempData.portNum;
    newOccupiedPorts = tempData.newOccupiedPorts;

    tempData = checkUsedPortsAndIncrementIdx(config.cardPorts.http + index, usedPorts, newOccupiedPorts);
    hlsPort = tempData.portNum;
    newOccupiedPorts = tempData.newOccupiedPorts;

    tempData = checkUsedPortsAndIncrementIdx(config.cardPorts.rtmp + index, usedPorts, newOccupiedPorts);
    rtmpPort = tempData.portNum;
    newOccupiedPorts = tempData.newOccupiedPorts;

    tempData = checkUsedPortsAndIncrementIdx(config.cardPorts.icecast + index, usedPorts, newOccupiedPorts);
    icecastPort = tempData.portNum;
    newOccupiedPorts = tempData.newOccupiedPorts;

    var ports = {
        nas: nasPort,
        hls: hlsPort,
        rtmp: rtmpPort,
        icecast: icecastPort
    }
    return ports;
}

module.exports = buildIPTable;
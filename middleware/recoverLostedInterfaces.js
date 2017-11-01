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
var getInactiveNetworkInterfaces = require('./getInactiveNetworkInterfaces');
var getBridgeInterfaces = require('./getBridgeInterfaces');
var install = require('../installation/install');
var setup_bridge = install.setup_bridge;
var remove_bridge = install.remove_bridge;
var groupNewInterface = install.groupNewInterface;
var restart_dhcp = install.restart_dhcp;
var pingMustangs = require('./pingMustangs');

function recoverLostedInterfaces() {
    return Promise.resolve(getRecoverInterfaceList())
        .then(function(interfaceList) {
            return Promise.resolve(setup_bridge("br_temp", "169.254.100.1"))
                .then(function(msg) {
                    console.log(msg.message);
                    return Promise.resolve(interfaceList);
                });
        })
        .then(function(interfaceList) {
            return Promise.resolve(pingMustangs("br_temp", true, interfaceList))
                .then(function(result) {
                    updateDetectedCards(result.detectedCards);
                    return Promise.resolve(remove_bridge("br_temp"))
                        .then(function(msg) {
                            console.log(msg.message);
                            return Promise.resolve(groupNewInterface("br_mvt0", Object.keys(result.interfaceIPGroup)));
                        }, function(err) {
                            throw new Error({
                                message: err
                            });
                        });
                });
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(restart_dhcp());
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve({
                message: "Recover function completed!"
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function getRecoverInterfaceList() {
    return Promise.all([getInactiveNetworkInterfaces(), getBridgeInterfaces('br_mvt0')])
        .then(function(allData) {
            var inactiveInterfaces = allData[0];
            var bridgeInterfaces = allData[1];
            var result = [];
            for (var i = 0; i < inactiveInterfaces.length; i++) {
                if (bridgeInterfaces.indexOf(inactiveInterfaces[i]) == -1) {
                    result.push(inactiveInterfaces[i]);
                }
            }
            return result;
        })
        .catch(function(err) {
            console.log(err);
        });
}

function updateDetectedCards(newDetectedCards) {
    var detectedCards = config.detectedCards;
    var keys = Object.keys(detectedCards);
    var newkeys = Object.keys(newDetectedCards);
    for (var i = 0; i < newkeys.length; i++) {
        if (keys.indexOf(newkeys[i]) != -1) {
            if (detectedCards[newkeys[i]].cpu1.ipConnected == false && newDetectedCards[newkeys[i]].cpu1.ipConnected == true) {
                detectedCards[newkeys[i]].cpu1.ipConnected = true;
                detectedCards[newkeys[i]].cpu1.macAddr = newDetectedCards[newkeys[i]].cpu1.macAddr;
            } else if (detectedCards[newkeys[i]].cpu2.ipConnected == false && newDetectedCards[newkeys[i]].cpu2.ipConnected == true) {
                detectedCards[newkeys[i]].cpu2.ipConnected = true;
                detectedCards[newkeys[i]].cpu2.macAddr = newDetectedCards[newkeys[i]].cpu2.macAddr;
            }
        } else {
            detectedCards[newkeys[i]] = newDetectedCards[newkeys[i]];
        }
    }
    config.detectedCards = detectedCards;
    console.log("DetectedCards Updated!");
}

module.exports = recoverLostedInterfaces;
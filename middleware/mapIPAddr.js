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
var ipMacMap = require('./ipMacMap');
var macIPMap = require('./macIPMap');

function mapIPAddr() {
    var promiseArr = [];
    var currentCards = config.detectedCards;
    for (var key in currentCards) {
        if (currentCards[key].cpu1.ipUpdated == false) {
            promiseArr.push(Promise.resolve(macIPMap(currentCards[key].cpu1.macAddr)));
        }
        if (currentCards[key].cpu2.ipUpdated == false) {
            promiseArr.push(Promise.resolve(macIPMap(currentCards[key].cpu2.macAddr)));
        }
    }
    return Promise.all(promiseArr)
        .then(function(allData) {
            for (var i = 0; i < allData.length; i++) {
                if (allData[i] != undefined) {
                    updateIPAddr(allData[i]);
                }
            }
            return {message : "mapIPAddr Executed"};
        })
        .catch(function(err) {
            console.log(err);
        });
}

function updateIPAddr(data) {
    var address = data.address;
    var macAddr = data.macAddr;
    for (var key in config.detectedCards) {
        if (config.detectedCards[key].cpu1.macAddr == macAddr) {
            config.detectedCards[key].cpu1.ipAddr = address;
            config.detectedCards[key].cpu1.ipUpdated = true;
        }
        if (config.detectedCards[key].cpu2.macAddr == macAddr) {
            config.detectedCards[key].cpu2.ipAddr = address;
            config.detectedCards[key].cpu2.ipUpdated = true;
        }
    }
}

module.exports = mapIPAddr;
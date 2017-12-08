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
var cardMap = require('../config/cardMap');
var MVT = require('../class/card');
var fs = require('fs');
var config = require('../config/config');
var sortCardMap = require('./sortCardMap');

function loadPortInfo() {
    if (config.platform == "windows") {
        loadPortInfoWindows();
    } else {
        loadPortInfoLinux();
    }
}

function loadPortInfoWindows() {
    if (fs.existsSync(config.routeMapWindowsPath) === false) {
        return;
    } else {
        var reg = /\r\n|\n\r|\n|\r/g;
        var content = fs.readFileSync(config.routeMapWindowsPath, "utf-8").replace(reg, "\n").split('\n');
        for (var i = 0; i < content.length; i++) {
            var row = content[i];
            if (row.indexOf('listenport') != -1 && row.indexOf('connectport') != -1) {
                var rowArray = row.split(' ');
                var outwardPort = rowArray[rowArray.indexOf('v4tov4') + 1].split("=")[1];
                var inwardPort = rowArray[rowArray.indexOf('v4tov4') + 3].split("=")[1];
                var cpuip = rowArray[rowArray.indexOf('v4tov4') + 4].split("=")[1];
                loadPortIntoCard(outwardPort, inwardPort, cpuip);
            }
        }
        sortCardMap();
    } 
}

function loadPortInfoLinux() {
    var routePath = config.platform == "linux" ? config.routeMapPath : config.routeMapQtsPath;
    if (fs.existsSync(routePath) === false) {
        return;
    } else {
        var content = fs.readFileSync(routePath, "utf-8").split('\n');
        for (var i = 0; i < content.length; i++) {
            var row = content[i].split(' ');
            if (row.indexOf('--dport') != -1 && row.indexOf('--to-destination') != -1) {
                var outwardPort = row[row.indexOf('--dport') + 1];
                var inwardPort = row[row.indexOf('--to-destination') + 1].split(":")[1];
                var cpuip = row[row.indexOf('--to-destination') + 1].split(":")[0];
                loadPortIntoCard(outwardPort, inwardPort, cpuip);
            }
        }
        sortCardMap();
    }    
}

function loadPortIntoCard(outwardPort, inwardPort, cpuip) {
    for (var key in cardMap) {
        if (cardMap[key].cpu1().getIPAddr() == cpuip) {
            switch (parseInt(inwardPort)) {
                case config.cardPorts.rtmp:
                    cardMap[key].cpu1().setRtmpPort(outwardPort);
                    break;
                case config.cardPorts.http:
                    cardMap[key].cpu1().setHttpPort(outwardPort);
                    break;
                case config.cardPorts.qts:
                    cardMap[key].cpu1().setQtsPort(outwardPort);
                    break;
                case config.cardPorts.icecast:
                    cardMap[key].cpu1().setIcecastPort(outwardPort);
                    break;
                default:
                    break;
            }

        } else if (cardMap[key].cpu2().getIPAddr() == cpuip) {
            switch (parseInt(inwardPort)) {
                case config.cardPorts.rtmp:
                    cardMap[key].cpu2().setRtmpPort(outwardPort);
                    break;
                case config.cardPorts.http:
                    cardMap[key].cpu2().setHttpPort(outwardPort);
                    break;
                case config.cardPorts.qts:
                    cardMap[key].cpu2().setQtsPort(outwardPort);
                    break;
                case config.cardPorts.icecast:
                    cardMap[key].cpu2().setIcecastPort(outwardPort);
                    break;
                default:
                    break;
            }
        }
    }
}

loadPortInfo();

module.exports = loadPortInfo;
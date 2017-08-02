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

function loadPortInfo() {
	var content = fs.readFileSync(config.routeMapPath, "utf-8").split('\n');
	for (var i = 0; i < content.length; i++) {
		var row = content[i].split(' ');
		if (row.indexOf('--dport') != -1 && row.indexOf('--to-destination') != -1) {
			var outwardPort = row[row.indexOf('--dport') + 1];
			var inwardPort = row[row.indexOf('--to-destination') + 1].split(":")[1];
			var cpuip = row[row.indexOf('--to-destination') + 1].split(":")[0];
			loadPortIntoCard(outwardPort, inwardPort, cpuip);
		}
	}
}

function loadPortIntoCard(outwardPort, inwardPort, cpuip) {
	for (var key in cardMap) {
		if (cardMap[key].cpu1().getIPAddr() == cpuip) {
			switch (inwardPort) {
				case "1935":
					cardMap[key].cpu1().setRtmpPort(outwardPort);
					break;
				case "8000":
					cardMap[key].cpu1().setHttpPort(outwardPort);
					break;
				case "8080":
					cardMap[key].cpu1().setQtsPort(outwardPort);
					break;
				case "8100":
					cardMap[key].cpu1().setIcecastPort(outwardPort);
					break;
				default:
					break;
			}

		} else if (cardMap[key].cpu2().getIPAddr() == cpuip) {
			switch (inwardPort) {
				case "1935":
					cardMap[key].cpu2().setRtmpPort(outwardPort);
					break;
				case "8000":
					cardMap[key].cpu2().setHttpPort(outwardPort);
					break;
				case "8080":
					cardMap[key].cpu2().setQtsPort(outwardPort);
					break;
				case "8100":
					cardMap[key].cpu2().setIcecastPort(outwardPort);
					break;
				default:
					break;
			}
		}
	}
}

module.exports = loadPortInfo;
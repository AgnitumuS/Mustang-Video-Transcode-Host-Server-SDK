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

var express = require('express');
var cardinfoAPI = express.Router();
var cardMap = require('../config/cardMap');
var cpuSettings = require('../config/config').cpuSettings;

cardinfoAPI.route('/')
	.get(function(req, res) {
		var cardinfo = [];
		for (var key in cardMap) {
			var info = cardMap[key].info;
			var obj = {
				cardid : key,
				serialno : info.serialno,
				cardname : info.cardname,
				model : info.model,
				firmware : info.firmware,
				manufacturer : info.manufacturer,
				cpu : [
					{
						cpuId : cardMap[key].cpu1().cpuID(),
						processor : cardMap[key].cpu1().getProcessor(),
						memory : cardMap[key].cpu1().getMemory(),
						ipaddress : cardMap[key].cpu1().getIPAddr(),
						mac : cardMap[key].cpu1().getMac(),
						gpu : cardMap[key].cpu1().getGPU(),
						qtsPort : cardMap[key].cpu1().getQtsPort(),
						rtmpPort : cardMap[key].cpu1().getRtmpPort(),
						httpPort : cardMap[key].cpu1().getHttpPort(),
						icecastPort : cardMap[key].cpu1().getIcecastPort()
					},
					{
						cpuId : cardMap[key].cpu2().cpuID(),
						processor : cardMap[key].cpu2().getProcessor(),
						memory : cardMap[key].cpu2().getMemory(),
						ipaddress : cardMap[key].cpu2().getIPAddr(),
						mac : cardMap[key].cpu2().getMac(),
						gpu : cardMap[key].cpu2().getGPU(),
						qtsPort : cardMap[key].cpu2().getQtsPort(),
						rtmpPort : cardMap[key].cpu2().getRtmpPort(),
						httpPort : cardMap[key].cpu2().getHttpPort(),
						icecastPort : cardMap[key].cpu2().getIcecastPort()
					}
				]
			};
			cardinfo.push(obj);
		}
 		res.json(cardinfo);
	});

module.exports = cardinfoAPI;
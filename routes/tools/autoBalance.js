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
var config = require('../../config/config');
var config = require('../../config/config');
var cardMap = require('../../config/cardMap');
var getCGinfo = require('./getCGinfo');

var autoBalance = function(dataObj) {
	return new Promise(function(resolve, reject) {
		var cards = Object.keys(cardMap);
		var promiseArr = [];

		for (var i = 0; i < cards.length; i++) {
			promiseArr.push(Promise.resolve(cginfoOneCard(cards[i])));
		}

		Promise.all(promiseArr)
			.then(function(allData) {
				var cardid = "";
				var cpuid = "";
				var min = 100;
				for (var i = 0; i < allData.length; i++) {
					var usage = allData[i].cginfo.usage;
					for (var j = 0; j < usage.length; j++) {
						// Select method when gpu usage under 50%
						if (usage[j].gpu <= 50 && usage[j].gpu < min) {
							min = usage[j].gpu;
							cardid = allData[i].cardid;
							cpuid = usage[j].cpuid;
						} else if (usage[j].gpu < min) {
							// When all of the gpu is more than 50%
							// There may have other algorithm to choose the card,
							// Will implement later
							min = usage[j].gpu;
							cardid = allData[i].cardid;
							cpuid = usage[j].cpuid;
						}
					}
				}
				dataObj.job.cardid = cardid;
				dataObj.job.cpu_cpuid = cpuid;
				resolve(dataObj);
			});
	});
}

function cginfoOneCard(cardid) {
	var array = cardMap[cardid].getAllIPAndPort();
	for (var i = 0; i < array.length; i++) {
		array[i] = "http://" + array[i];
	}

	return Promise.resolve(getCGinfo(array))
		.then(function(result) {
			return new Promise(function(resolve, reject) {
				var idArr = cardMap[cardid].getAllCPUID();
				for (var i = 0; i < result.usage.length; i++) {
					result.usage[i].cpuid = idArr[i];
				}

				var obj = {
					cardid : cardid,
					cginfo : result
				}
				resolve(obj);
			});
		});
}

module.exports = autoBalance;
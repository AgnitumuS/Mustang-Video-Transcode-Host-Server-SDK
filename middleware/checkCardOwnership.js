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
var db = require('../db/dbSqlite').sqliteDB;
var os = require('os');
var config = require('../config/config');
var loadCards = require('./loadCards');
var faye = require('./faye');
var mountRequest = require('./mountRequest');
var getExternalIP = require('./getExternalIP');
var cardMap = require('../config/cardMap');
var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();
var install = require("../installation/install");
var runIPtableRecoverCheck = require('./runIPtableRecoverCheck');
var ubuntu_dhcp_recover = install.ubuntu_dhcp_recover;
var iptables = install.iptables;
var cards = [];
var newStart = true;
var timeCount = 0;

function checkCardOwnership() {
	if (newStart || config.cardids.length == 0) {
		if (newStart) {
			newStart = false;
			getInterfaces();
			checkCardOwnership();
		} else if (config.cardids.length == 0) {
			setTimeout(function() {
				getInterfaces();
				checkCardOwnership();
				console.log("Retriving cards Information...");
			}, 5 * 1000);
		} else {
			checkCardOwnership();
		}
	} else {
		var countLimit = 9;
		if (timeCount < countLimit) {
			setTimeout(function() {
				getInterfaces();
				checkCardOwnership();
				timeCount++;
				process.stdout.write("... ");
			}, 20 * 1000);
		} else {
			runIPtableRecoverCheck();
		}
	}
}

function getInterfaces() {
	var networkInterfaces = os.networkInterfaces();
	var keys = Object.keys(networkInterfaces);
	var urlArray = [];

	for (var i = 0; i < keys.length; i++) {
		for (var j = 0; j < networkInterfaces[keys[i]].length; j++) {
			if (networkInterfaces[keys[i]][j].family == 'IPv4') {
				var obj = {
					name : keys[i],
					info : networkInterfaces[keys[i]][j]
				}
				urlArray.push(obj);
			}
		}
	}
	var promiseArray =[];
	for (var i = 0; i < urlArray.length; i++) {
		promiseArray.push(Promise.resolve(requestCardinfo(urlArray[i])));
	}

	Promise.all(promiseArray)
		.then(function(allData) {
			for (var i = 0; i < allData.length; i++) {
				if (allData[i].success == true && allData[i].response.message == "Success") {
					var ipaddress = allData[i].data.info.address.split('.');
					ipaddress[3] = "2";
					ipaddress = ipaddress.join(".");

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
							hostSideIPaddress : allData[i].data.info.address,
							ipaddress : ipaddress,
							mac : allData[i].data.info.mac
						}]
					}
					buildCards(dataObj);
				}
			}
			reloadCheck(cards);
		})
		.catch(function(err) {
			console.log(err);
		});
}

function reloadCheck(cards) {
	if (cards == undefined || cards.length == 0) {
		return;
	}
	var reloadCardInfo = false;
	for (var i = 0; i < cards.length; i++) {
		var found = false;
		for (var j = 0; j < config.cardids.length; j++) {
			if (cards[i].cardid == config.cardids[j] && cards[i].cpu.length == 2) {
				found = true;
			}
		}
		if (found == false) {
			if (config.cardids.indexOf(cards[i].cardid) == -1 && cards[i].cpu.length == 2) {
				config.cardids.push(cards[i].cardid);
			}
			reloadCardInfo = true;
		}
	}
	if (reloadCardInfo == true) {
		loadCards(cards);
		faye();
		mountRequest();
	}
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
							dataObj.cpu[0].cpuid = "CPUID2";
							cards[i].cpu.push(dataObj.cpu[0]);
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

function requestCardinfo(data) {
	return new Promise(function(resolve, reject) {
		var address = data.info.address.split('.');
		address[3] = "2";
		address = address.join(".");

		request({
	        url: "http://" + address + ":9000/submachine/cardinfo",
	        method: 'GET',
	        timeout : 2000
	    }, function(error, response, body) {
	    	if (error) {
	    		var obj = {
	    			success : false,
	    			message : "Request to " + address + " failed!"
	    		}
	    		resolve(obj);
	    	} else {
	    		body = body[0] == "{" ? JSON.parse(body) : body;
	    		var obj = {
	    			success : true,
	    			data : data,
	    			response : body
	    		}
		     	resolve(obj);
	    	}
	    });
	})
	.catch(function(err) {
		console.log(err);
	});
}

module.exports = checkCardOwnership;
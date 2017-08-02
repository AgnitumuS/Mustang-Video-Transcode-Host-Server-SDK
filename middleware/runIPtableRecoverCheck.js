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

var os = require('os');
var db = require('../db/dbSqlite').sqliteDB;
var install = require("../installation/install");
var ubuntu_dhcp_recover = install.ubuntu_dhcp_recover;
var iptables = install.iptables;
var getExternalIP = require('./getExternalIP');
var cardMap = require('../config/cardMap');
var config = require('../config/config');
var mustangInterfaces = [];

function runIPtableRecoverCheck() {
	new Promise(function(resolve, reject) {
		db.run("CREATE TABLE IF NOT EXISTS routedInterfaces (name TEXT)");
		db.all("SELECT * FROM routedInterfaces", function(err, rows) {
			if (err) {
				console.log(err);
			}
			var sameArray = false;
			if (rows != undefined) {
				Promise.resolve(getCardInterfaceName(config.cardids))
					.then(function(cardInterfaceName) {
						sameArray = true;
						if (cardInterfaceName.length != 0 && rows.length == 0) {
							sameArray = false;
						} else {
							if (cardInterfaceName.length != 0) {
								for (var i = 0; i < rows.length; i++) {
									if (cardInterfaceName.indexOf(rows[i].name) == -1) {
										sameArray = false;
									}
								}
							}
						}
						var dataObj = {
							sameArray : sameArray,
							cardInterfaceName : cardInterfaceName
						}
						resolve(dataObj);
					});
			}
		});
	})
	.then(function(dataObj) {
		var sameArray = dataObj.sameArray;
		var cardInterfaceName = dataObj.cardInterfaceName;
		if (sameArray == false) {
			db.run("DELETE FROM routedInterfaces");
			for (var i = 0; i < cardInterfaceName.length; i++) {
				var stmt = db.prepare("INSERT INTO routedInterfaces VALUES (?)");
				stmt.run([cardInterfaceName[i]]);
			}
			recoverRoute(cardInterfaceName);
		}
	})
	.catch(function(err) {
		console.log(err);
	});
}

function recoverRoute(cardInterfaceName) {
	Promise.resolve(ubuntu_dhcp_recover(cardInterfaceName))
		.then(function(msg) {
			return Promise.resolve(getExternalIP())
				.then(function(externalIP) {
					return new Promise(function(resolve, reject) {
						var obj = {
							cardNames : cardInterfaceName,
							externalIPName : externalIP.name
						}
						resolve(obj);
					});
				});
		})
		.then(function(dataObj) {
			Promise.resolve(iptables(dataObj.cardNames, dataObj.externalIPName))
				.then(function(msg) {
					var str = "*************************************************************\n" +
							  "***************** Please Reboot the System ******************\n" +
							  "*************************************************************\n";
					process.stdout.write('\n');
					console.log(str);
					process.exit(0);
				});
		})
		.catch(function(err) {
			console.log(err);
		});
}

function getCardInterfaceName() {
	return new Promise(function(resolve, reject) {
		resolve(os.networkInterfaces());
	})
	.then(function(networkInterfaces) {
		var result = [];
		for (var key in cardMap) {
			var ipAddrs = cardMap[key].getAllIPAddr();
			for (var i = 0; i < ipAddrs.length; i++) {
				for (var ele in networkInterfaces) {
					for (var j = 0; j < networkInterfaces[ele].length; j++) {
						var ipaddress = networkInterfaces[ele][j].address.split('.');
						ipaddress[3] = "2";
						ipaddress = ipaddress.join(".");
						if (ipaddress == ipAddrs[i] && networkInterfaces[ele][j].family == 'IPv4') {
							result.push(ele);
						}
					}
				}
			}
		}
		return result;
	})
	.catch(function(err) {
		if (err) {
			console.log(err);
		}
	});
}

module.exports = runIPtableRecoverCheck;
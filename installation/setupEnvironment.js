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
var db = require('../db/dbSqlite').sqliteDB;
var middleware = require('../middleware/middlewareIndex');
var getInactiveNetworkInterfaces = middleware.getInactiveNetworkInterfaces;
var getExternalIP = middleware.getExternalIP;
var checkCardOwnership = middleware.checkCardOwnership;
var install = require("./install");
var ubuntu_install_mediainfo = install.ubuntu_install_mediainfo;
var install_driver = install.install_driver;
var ubuntu_dhcp = install.ubuntu_dhcp;
var ubuntu_auto_start = install.ubuntu_auto_start;
var ubuntu_samba = install.ubuntu_samba;
var iptables = install.iptables;

function setupEnvironment() {
	return Promise.resolve(getInactiveNetworkInterfaces())
	.then(function(cardNames) {
		return Promise.resolve(ubuntu_dhcp(cardNames))
			.then(function(msg) {
				return new Promise(function(resolve, reject) {
					var str = "*************************************************************\n" +
							  "******************* Ubuntu DHCP Completed! ******************\n" +
							  "*************************************************************\n";
					resolve({cardNames : cardNames, message : str});
				})
			})
	})
	.then(function(dataObj) {
		console.log(dataObj.message);
		return Promise.resolve(getExternalIP())
			.then(function(externalIP) {
				return new Promise(function(resolve, reject) {
					var obj = {
						cardNames : dataObj.cardNames,
						externalIPName : externalIP.name
					}
					resolve(obj);
				});
			});
	})
	.then(function(dataObj) {
		return Promise.resolve(iptables(dataObj.cardNames, dataObj.externalIPName))
			.then(function(msg) {
				db.serialize(function() {
					db.run("CREATE TABLE IF NOT EXISTS routedInterfaces (name TEXT)");
					var stmt = db.prepare("INSERT INTO routedInterfaces VALUES (?)");
					for (var i = 0; i < dataObj.cardNames.length; i++) {
						stmt.run([dataObj.cardNames[i]]);
					}
				});

				return new Promise(function(resolve, reject) {
					resolve(msg);
				})
			})
	})
	.then(function(msg) {
		console.log(msg.message);
		return Promise.resolve(ubuntu_install_mediainfo())
			.then(function(msg) {
				return new Promise(function(resolve, reject) {
					resolve(msg);
				});
			});
	})
	.then(function(msg) {
		console.log(msg.message);
		return Promise.resolve(ubuntu_samba("anywaytest", config.hostMountedDir))
			.then(function(msg) {
				return new Promise(function(resolve, reject) {
					resolve(msg);
				});
			});
	})
	.then(function(msg) {
		console.log(msg.message);
		return Promise.resolve(ubuntu_auto_start())
			.then(function(msg) {
				return new Promise(function(resolve, reject) {
					resolve(msg);
				});
			});
	})
	.then(function(msg) {
		console.log(msg.message);
	})
	.catch(function(err) {
		console.log(err);
	});
}

module.exports = setupEnvironment;
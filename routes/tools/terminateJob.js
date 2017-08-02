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
var db = require('../../db/dbSqlite').sqliteDB;
var config = require('../../config/config');
var cardMap = require('../../config/cardMap');
var updateStatusToTerminated = require('./updateStatusToTerminated');

var terminateJob = function(jobid) {
    var targetURL = "";
    var data = {
    	name : jobid
    }
    return new Promise(function(resolve, reject) {
		db.serialize(function() {
			db.get("SELECT cardid, cpu_cpuid from jobs WHERE jobid = " + data.name, function(err, result) {
				if (result == undefined) {
					resolve({Message : "Cannot find jobid, please check again!"});
				} else {
					var cardid = result.cardid;
					var cpuid = result.cpu_cpuid;

					targetURL = "http://" + cardMap[cardid].cpu(cpuid).getIPAddr() + ":" + cardMap[cardid].cpu(cpuid).getPort() + "/submachine/removeProcess";
					resolve(targetURL);
				}
			});
		});
    })
	.then(function(targetURL) {
    	return new Promise(function(resolve, reject) {
			if (targetURL == undefined) {
				resolve({'success' : false});
			} else {
				request({
				    url: targetURL,
				    method: 'POST',
				    json: data,
				    timeout : 2000
				}, function(error, response, body) {
				    if (error) {
				        console.log(error);
				        resolve(error);
				    } else {
				    	if (body.message == "Success") {
				    		updateStatusToTerminated(jobid);
				    		resolve({'success' : true});
				    	} else if (body.message == "Fail") {
				    		resolve({'success' : false});
				    	}
				    	resolve(undefined);
				    }
				});
			}
    	});
    });
}

module.exports = terminateJob;
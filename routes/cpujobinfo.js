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
var cpujobinfoAPI = express.Router();
var request = require('request');
var config = require('../config/config');
var db = require('../db/dbSqlite').sqliteDB;
var cardMap = require('../config/cardMap');

cpujobinfoAPI.route('/')
	.get(function(req, res) {
		var cards = Object.keys(cardMap);
		var promiseArr = [];

		for (var i = 0; i < cards.length; i++) {
			promiseArr.push(Promise.resolve(cpuJobInfoOneCard(cards[i])));
		}		

		Promise.all(promiseArr)
			.then(function(allData) {
				res.json(allData);
			})
			.catch(function(err) {
				console.log(err);
				res.statusCode = 500;
				res.json({Message : "Internal Server Error"});
			});
	});

cpujobinfoAPI.route('/:cardid')
	.get(function(req, res) {
		Promise.resolve(cpuJobInfoOneCard(req.params.cardid))
			.then(function(result) {
				if (cardMap[req.params.cardid] == undefined) {
					res.json({Message : "Card not found! Please check cardid"});
				} else {
					res.json(result);
				}
			})
			.catch(function(err) {
				console.log(err);
				res.statusCode = 500;
				res.json({Message : "Internal Server Error"});
			});
	});

function cpuJobInfoOneCard(cardid) {
	var array = cardMap[cardid].getAllIPAddr();
	var idArr = cardMap[cardid].getAllCPUID();
	var promiseArr = [];
	for (var i = 0; i < array.length; i++) {
		var targetURL = "http://" + array[i] + ":" + cardMap[cardid].cpu(idArr[i]).getPort() + "/submachine/checkProcessNum";
		promiseArr.push(Promise.resolve(processNumber(targetURL)));
	}

	return Promise.all([getProcessFromOneServer(promiseArr)])
		.then(function(allData) {
			return new Promise(function(resolve, reject) {
				var output = [];
				for (var i = 0; i < allData[0].length; i++) {
					var data0Success = allData[0][i].hasOwnProperty("Message") ? false : true;

					if (data0Success) {
						var obj = {
					      cpuId: idArr[i],
					      numofjobs: allData[0][i].numofjobs,
					      jobs: allData[0][i].jobs
					    }
					    output.push(obj);
					} else {
						var obj =     {
					      cpuId: idArr[i],
					      message : allData[0][i].Message,
					    }
					    output.push(obj);
					}
				}
				var result = {
					cardid : cardid,
					cpujobinfo : output
				}
				resolve(result);
			});
		});
}

function getProcessFromOneServer(promiseArr) {
	return Promise.all(promiseArr)
		.then(function(allData) {
			var requestArray = [];
			var nonWorkingJobs = [];
			var failArray = [];
			for (var i = 0; i < allData.length; i++) {
				if (allData[i].success == false) {
					failArray.push({cpuid : i + 1, Message : allData[i]});
				} else if (allData[i].success == true) {
					if (allData[i].result.data.hasOwnProperty("ids")) {
						requestArray.push({cpuid : i + 1, jobsArray : allData[i].result.data.ids});
					} else if (allData[i].result.data.hasOwnProperty("msg")) {
						nonWorkingJobs.push({cpuid : i + 1});
					}
				}
			}

			return new Promise(function(resolve, reject) {
				Promise.resolve(iterateAllCPU(requestArray))
					.then(function(data) {
						var result = {
							nonWorkingJobs : nonWorkingJobs,
							workingJobs : data,
							failArray : failArray
						}
						resolve(result);
					});
			});
		})
		.then(function(data) {
			return new Promise(function(resolve, reject) {
				var array = mergeArray(data);
				var result = mergeFailArray(array, data.failArray);
				resolve(result);
			})
		});	
}

function processNumber(targetURL) {
	return new Promise(function(resolve, reject) {
		request(targetURL, {timeout: 2000}, function (error, response, body) {
			if (error) {
				console.log("Opps, connection to " + targetURL + " meet problem!");
				console.log(error);
				var msg = {
					success : false,
					message : "Opps, connection to " + targetURL + " meet problem!",
					error : error 
				}
				resolve(msg);
			} else {
				var msg = {
					success : true,
					result : JSON.parse(body)
				}
				resolve(msg);
			}
		});
	});
}

var mergeArray = function(data) {
	var i = 0;
	var j = 0;
	var array = [];

	while (i < data.nonWorkingJobs.length && j < data.workingJobs.length) {
		if (data.nonWorkingJobs[i].cpuid < data.workingJobs[j].cpuid) {
			var obj = {
				cpuId : "CPUID" + data.nonWorkingJobs[i].cpuid,
				numofjobs : 0,
				jobs : []
			}
			array.push(obj);
			i++;
		} else if (data.nonWorkingJobs[i].cpuid > data.workingJobs[j].cpuid) {
			var obj = {
				cpuId : "CPUID" + data.workingJobs[j].cpuid,
				numofjobs : data.workingJobs[j].jobs.length,
				jobs : data.workingJobs[j].jobs
			}
			array.push(obj);
			j++;
		}
	}

	while (i < data.nonWorkingJobs.length) {
		var obj = {
			cpuId : "CPUID" + data.nonWorkingJobs[i].cpuid,
			numofjobs : 0,
			jobs : []
		}
		array.push(obj);
		i++;
	}

	while (j < data.workingJobs.length) {
		var obj = {
			cpuId : "CPUID" + data.workingJobs[j].cpuid,
			numofjobs : data.workingJobs[j].jobs.length,
			jobs : data.workingJobs[j].jobs
		}
		array.push(obj);
		j++;
	}
	return array;
}

mergeFailArray = function(array1, array2) {
	var i = 0;
	var j = 0;
	var array = [];

	if (array1.length == 0 || array1 == undefined) {
		while (j < array2.length) {
			array2[j].cpuid = "CPUID" + array2[j].cpuid;
			array.push(array2[j++]);		
		}
		return array;
	} else {
		while (i < array1.length && j < array2.length) {
			var cpuid = array1[i].cpuId[array1[i].cpuId.length - 1];
			if (cpuid < array2[j].cpuid) {
				array.push(array1[i++]);
			} else {
				array2[j].cpuid = "CPUID" + array2[j].cpuid;
				array.push(array2[j++]);
			}
		}

		while (i < array1.length) {
			array.push(array1[i++]);
		}

		while (j < array2.length) {
			array2[j].cpuid = "CPUID" + array2[j].cpuid;
			array.push(array2[j++]);
		}
		return array;
	}
}

var iterateAllCPU = function(array) {
	var promiseArr = [];
	for (var i = 0; i < array.length; i++) {
		var wolf = Promise.resolve(oneCPUJobs(array[i]));
		promiseArr.push(wolf);
	}

	return Promise.all(promiseArr)
		.then(function(allData) {
			return allData;
		});
}

var oneCPUJobs = function(obj) {
	return new Promise(function(resolve, reject) {
		Promise.resolve(getAllInfo(obj.jobsArray))
			.then(function(data) {
				var result = {
					cpuid : obj.cpuid,
					jobs : data
				}
				resolve(result);
			});
	});
}

var getAllInfo = function(array) {
	var promiseArr = [];
	for (var i = 0; i < array.length; i++) {
		var wolf = Promise.resolve(getInfo(array[i]));
		promiseArr.push(wolf);
	}

	return Promise.all(promiseArr)
		.then(function(allData) {
			return allData;
		});
}

var getInfo = function(jobid) {
	return new Promise(function(resolve, reject) {
		db.get("SELECT jobId, input_filepath, starttime, apiMethod, input_streamname, input_streamurl from jobs WHERE jobid = " + jobid, 
			function(err, data) {
			db.all("SELECT * from outputs WHERE jobid = " + jobid, function(err, outputRows) {
				if (data == undefined) {
					db.get("SELECT * from youtube WHERE jobid = " + jobid, function(err, data) {
						if (data == undefined) {
							var msg = {
								jobId : jobid,
								message : "Jobid is not exist"
							}
							resolve(msg);	
						} else {
							var msg = {
								jobId : data.jobid,
								type : "Youtube Live!",
								starttime : data.starttime
							}
							resolve(msg);
						}
					});
				} else {
					var type = "";
					switch (data.apiMethod) {
						case "file2file":
							type = "file";
							break;
						case "file2stream":
							type = "vod";
							break;
						case "stream2stream":
							type = "live";
							break;
						default:
							type = "";
					}
					if (type != "live") {
						var result = {
							jobId : data.jobid,
							type : type,
							input : {
								filepath : data.input_filepath
							},
							starttime : data.starttime,
							numofoutputs : outputRows.length,
							status : 1
						}
						resolve(result);
					} else {
						var result = {
							jobId : data.jobid,
							type : type,
							input : {
								streamname : data.input_streamname,
								streamurl : data.input_streamurl
							},
							starttime : data.starttime,
							numofoutputs : outputRows.length,
							status : 1
						}
						resolve(result);
					}
				}
			});
		});
	});
}

module.exports = {
	cpujobinfoAPI : cpujobinfoAPI,
	cpuJobInfoOneCard : cpuJobInfoOneCard
}
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

var db = require('../../db/dbSqlite').sqliteDB;
var mapIDs = require('./mapIDs');
var formatValidation = require('./formatValidation');
var generateJobID = require('./generateJobID');
var reverseBody = require('./reverseBody');
var removeEmptyField = require('./removeEmptyField');
var getJob = require('./getJob');
var cardMap = require('../../config/cardMap');
var config = require('../../config/config');
var input_streamurl = "";

function updateJob(jobid, reqBody, apiMethod) {
		idMap = mapIDs(reqBody);
		return new Promise(function(resolve, reject) {
			db.serialize(function() {
				db.get("SELECT * from jobs WHERE jobid = " + jobid, function(err, jobRow) {
					db.all("SELECT * from outputs WHERE jobid = " + jobid, function(err, outputRows) {
						if (jobRow !== undefined) {
							var data = jobRow;
							data.outputs = outputRows;

							data.description = reqBody.description == undefined ? "" : reqBody.description;
							data.fileextension = reqBody.fileextension == undefined ? "" : reqBody.fileextension;
							data.protocol = reqBody.protocol == undefined ? "" : reqBody.protocol;
							data.input_streamurl == undefined ? "" : reqBody.input.streamurl;
							data.output_vcodecid = reqBody.output.vcodecid == undefined ? "" : reqBody.output.vcodecid;
							data.output_profileid = reqBody.output.profileid == undefined ? "" : reqBody.output.profileid;
							data.output_levelid = reqBody.output.levelid == undefined ? "" : reqBody.output.levelid;
							data.output_acodecid = reqBody.output.acodecid == undefined ? "" : reqBody.output.acodecid;
							data.output_abitrate = idMap.output_abitrate == undefined ? "" : idMap.output_abitrate;
							data.cpu_autocpu = reqBody.cpu_autocpu == undefined ? "" : reqBody.cpu_autocpu;
							data.cpu_cpuid = reqBody.cpu_cpuid == undefined ? "" : reqBody.cpu_cpuid;

							var outputs = [];
							for (var i = 0; i < reqBody.outputs.length; i++) {
								var obj = {
									resolutionid : reqBody.outputs[i].resolutionid,
									framerate : reqBody.outputs[i].framerate,
									bitrateenable : reqBody.outputs[i].bitrateenable,
									vquality : reqBody.outputs[i].vquality,
									vbitrate :reqBody.outputs[i].vbitrate
								}
								outputs.push(obj);
							}
							data.outputs = outputs;

							if (data.apiMethod == "stream2stream" && reqBody.cpu.autocpu == false) {
								var ipAddr = config.externalIP;
								var port = cardMap[reqBody.cardid].cpu(reqBody.cpu.cpuid).getRtmpPort();
								input_streamurl = "rtmp://" + ipAddr + ":" + port + "/live/";
							} else {
								input_streamurl = "";
							}

							var result = formatValidation(data, data.apiMethod, reqBody.fileextension);
							if (result.message == "success") {
								var resObj = {
									jobId :　jobid,
									success : true
								}
								resolve(resObj);
							} else if (result.message == "fail") {
								var resObj = {
									jobId : jobid,
									success : false,
									error : result
								}
								resolve(resObj);
							}
						} else {
							resObj = {
								jobId : jobid,
								success : false,
								error : "JobId not exist!"
							}
							resolve(resObj);
						}
					});
				});
			});
		})
		.then(function(validatedResult) {
			return new Promise(function(resolve, reject) {
				if (validatedResult.success == true) {
					db.serialize(function() {
						db.run("UPDATE jobs SET " + 
											"description = " + "'" + reqBody.description + "', " +
											"fileextension = " + "'" + reqBody.fileextension + "', " +
											"protocol = " + "'" + reqBody.Fprotocol + "', " +
											"input_filepath = " + "'" + reqBody.input.filepath + "', " +
											"input_streamname = " + "'" + reqBody.input.streamname + "', " +
											"input_streamurl = " + "'" + input_streamurl + "', " +
											"output_vcodec = " + "'" + idMap.output_vcodec + "', " +
											"output_vcodecid = " + "'" + reqBody.output.vcodecid + "', " +
											"output_profile = " + "'" + idMap.output_profile + "', " +
											"output_profileid = " + "'" + reqBody.output.profileid + "', " +
											"output_level = " + "'" + idMap.output_level + "', " +
											"output_levelid = " + "'" + reqBody.output.levelid + "', " +
											"output_acodec = " + "'" + idMap.output_acodec + "', " +
											"output_acodecid = " + "'" + reqBody.output.acodecid + "', " +
											"output_abitrate = " + "'" + idMap.output_abitrate + "', " +
											"protocol = " + "'" + reqBody.protocol + "', " +
											"fileextension = " + "'" + reqBody.fileextension + "', " +
											"cardid = " + "'" + reqBody.cardid + "', " +
											"cpu_autocpu = " + "'" + reqBody.cpu.autocpu + "', " +
											"cpu_cpuid = " + "'" + reqBody.cpu.cpuid + "', " +
											"cpu_ipaddress = " + "'" + idMap.cpu_ipaddress + "'" +
											" WHERE jobid = " + jobid);
						db.run("DELETE FROM outputs WHERE jobid = " + jobid, function(err, row) {});

						db.run("CREATE TABLE IF NOT EXISTS outputs (" + 
									"jobid TEXT," +
									"outputsID TEXT," +
									"url TEXT," +
									"resolution TEXT," + 
									"resolutionid INTEGER," +
									"framerate TEXT," +
									"bitrateenable INTEGER," +
									"vquality TEXT," +
									"vbitrate TEXT" +
									")"
								);
						var stmt = db.prepare("INSERT INTO outputs VALUES ( ?, ?, ?, ?, ?," + 
																		   "?, ?, ?, ?)");

						db.get("SELECT protocol from jobs WHERE jobid = " + jobid, function(err, data) {
							for (var i = 0; i < reqBody.outputs.length; i++) {
								var outputsID = generateJobID();
								var vquality = "";
								var vbitrate = "";

								if (reqBody.outputs[i].bitrateenable == false) {
									vquality = reqBody.outputs[i].vquality;
									vbitrate = "";
								} else {
									vquality = "";
									vbitrate = reqBody.outputs[i].vquality;
								}

								stmt.run([
											jobid,
											outputsID,
											"",
											idMap.outputs_resolution[i].resolution,
											reqBody.outputs[i].resolutionid,
											reqBody.outputs[i].framerate,
											reqBody.outputs[i].bitrateenable,
											reqBody.outputs[i].vquality
										]);
							}
							stmt.finalize();
						});
						resolve(Promise.resolve(getJob(jobid)));
					});
				} else if (validatedResult.success == false) {
					resolve(validatedResult);
				}
			});
		})
		.catch(function(err) {
			console.log(err);
		});
}

module.exports = updateJob;
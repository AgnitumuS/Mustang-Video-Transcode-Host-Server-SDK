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
var sqlite3 = require('sqlite3').verbose();
var db = require('../../db/dbSqlite').sqliteDB;
var generateJobID = require('./generateJobID');
var transformBody = require('./transformBody');
var mapIDs = require('./mapIDs');
var getStatusMsg = require('./getStatusMsg');
var generateTimeStamp = require('./generateTimeStamp');
var formatValidation = require('./formatValidation');
var updateInputMediainfo = require('./updateInputMediainfo');
var cardMap = require('../../config/cardMap');

var createJob = function(reqBody, apiMethod, callback) {
	var jobid = generateJobID();
	var body = transformBody(reqBody, apiMethod);
	var idMap = mapIDs(reqBody);
	var statusCode = 0;
	var cpercentage = 0;
	var statusmessage = getStatusMsg(statusCode);

	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS jobs (" + 
					"jobid TEXT," + 
					"description TEXT," + 
					"starttime TEXT," +
					"endtime TEXT," +
					"cpercentage TEXT," +
					"status INTEGER," + 
					"statusmessage TEXT," +
					"error INTEGER," +
					"errorlog TEXT," +
					"quickTranscodeEnable INTEGER," +
					"action INTEGER," + 
					"input_filepath TEXT," +
					"input_streamname TEXT," +
					"input_streamurl TEXT," +
					"input_vresolution TEXT," +
					"input_vbitrate TEXT," +
					"input_vcodec TEXT," +
					"input_vprofile TEXT," +
					"input_vlevel TEXT," +
					"input_vframerate TEXT," +
					"input_vaspectratio TEXT," +
					"input_duration TEXT," +
					"input_acodec TEXT," +
					"input_abitrate TEXT," +
					"output_vcodec TEXT," +
					"output_vcodecid INTEGER," +
					"output_profile TEXT," +
					"output_profileid INTEGER," +
					"output_level TEXT," +
					"output_levelid INTEGER," +
					"output_acodec TEXT," +
					"output_acodecid INTEGER," +
					"output_abitrate TEXT," +
					"output_abitrateid INTEGER," +
					"protocol INTEGER," +
					"cardid TEXT," +
					"fileextension INTEGER," +
					"cpu_autocpu INTEGER," +
					"cpu_cpuid TEXT," +
					"cpu_ipaddress TEXT," +
					"apiMethod TEXT" +
					")"
				);

		var stmt = db.prepare("INSERT INTO jobs VALUES ( ?, ?, ?, ?, ?," + 
														"?, ?, ?, ?, ?," +
														"?, ?, ?, ?, ?," +
														"?, ?, ?, ?, ?," +
														"?, ?, ?, ?, ?," +
														"?, ?, ?, ?, ?," +
														"?, ?, ?, ?, ?," +
														"?," +
														"?, ?, ?, ?, ?)");

		stmt.run([
					jobid,
					body.description,
					"",
					"",
					cpercentage,
					statusCode,
					statusmessage,
					false,
					"",
					body.quickTranscodeEnable,
					body.action,
					body.input_filepath,
					body.input_streamname,
					body.input_streamurl,
					body.input_vresolution,
					body.input_vbitrate,
					body.input_vcodec,
					body.input_vprofile,
					body.input_vlevel,
					body.input_vframerate,
					body.input_vaspectratio,
					body.input_duration,
					body.input_acodec,
					body.input_abitrate,
					idMap.output_vcodec,
					body.output_vcodecid,
					idMap.output_profile,
					body.output_profileid,
					idMap.output_level,
					body.output_levelid,
					idMap.output_acodec,
					body.output_acodecid,
					idMap.output_abitrate,
					body.output_abitrateid,
					body.protocol,
					body.cardid,
					body.fileextension,
					body.cpu_autocpu,
					body.cpu_cpuid,
					idMap.cpu_ipaddress,
					apiMethod
				]);
		
		stmt.finalize();

		// Start to create the outputs table
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
		for (var i = 0; i < reqBody.outputs.length; i++) {
			var outputsID = generateJobID();
			var vquality = "";
			var vbitrate = "";			
			if (reqBody.outputs[i].bitrateenable == false) {
				vquality = reqBody.outputs[i].vquality;
				vbitrate = "";
			} else {
				vquality = "";
				vbitrate = reqBody.outputs[i].vbitrate + "M";
			}
			stmt.run([
						jobid,
						outputsID,
						"",
						idMap.outputs_resolution[i].resolution,
						reqBody.outputs[i].resolutionid,
						reqBody.outputs[i].framerate,
						reqBody.outputs[i].bitrateenable,
						vquality,
						vbitrate
					]);
		}
		stmt.finalize();

		// Test Section Start Here
		db.get("SELECT * from jobs WHERE jobid = " + jobid, function(err, jobRow) {
			db.all("SELECT * from outputs WHERE jobid = " + jobid, function(err, outputRows) {
				if (jobRow !== undefined) {
					if (apiMethod != "stream2stream") {
						updateInputMediainfo(jobRow.jobid, jobRow.input_filepath);
					}
					var data = jobRow;
					data.outputs = outputRows;
					cardid = data.cardid;
					cpuid = data.cpu_cpuid;
					var result = formatValidation(data, apiMethod, body.fileextension);
					if (result.message == "success") {
						if (cardMap[cardid] != undefined) {
							if (cardMap[cardid].cpu(cpuid) != undefined) {
								var resObj = {
									jobId :　jobid,
									success : true,
									status : statusCode,
									statusMessage : "Job Saved Successfully!"
								}
								callback(resObj);
							} else if (cardMap[cardid].cpu(cpuid) == undefined) {
								var resObj = {
									jobId :　jobid,
									success : false,
									status : statusCode,
									statusMessage : "Cannot find cpuid"
								}
								callback(resObj);
							}					
						} else if (cardMap[cardid] == undefined) {
							var resObj = {
								jobId :　jobid,
								success : false,
								status : statusCode,
								statusMessage : "Cannot find carid"
							}
							callback(resObj);
						}
					} else if (result.message == "fail") {
						var resObj = {
							jobId : jobid,
							success : false,
							error : result
						}
						callback(resObj);
					}
				} else {
					callback(null);
				}
			});
		});
	});
}

module.exports = createJob;
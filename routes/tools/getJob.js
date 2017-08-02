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
var reverseBody = require('./reverseBody');
var removeEmptyField = require('./removeEmptyField');

function getJob(jobid, apiMethod) {
	return new Promise(function(resolve, reject) {
		if (apiMethod == undefined) {
			db.serialize(function() {	
				db.get("SELECT * from jobs WHERE jobid = " + jobid, function(err, jobRow) {
					db.all("SELECT * from outputs WHERE jobid = " + jobid, function(err, outputRows) {
						if (jobRow !== undefined) {
							var result = reverseBody(jobRow);
							result = removeEmptyField(result);
							result.input = removeEmptyField(result.input);
							for (var i = 0; i < outputRows.length; i++) {
								outputRows[i] = removeEmptyField(outputRows[i]);
								outputRows[i].bitrateenable = outputRows[i].bitrateenable == 0 ? false : true;
								delete outputRows[i].jobid;
								delete outputRows[i].outputsID;
							}
							result.outputs = outputRows;
							resolve(result);
						} else {
							resolve(null);
						}
					});
				});
			});
		} else {
			db.serialize(function() {
				var out = [];
				db.each("SELECT * from jobs WHERE apiMethod = '" + apiMethod + "'", function(err, row) {
					var type = row.apiMethod;
					switch(type) {
						case "file2stream":
							type = "vod";
							break;
						case "stream2stream":
							type = "live";
							break;
						case "file2file":
							type = "file";
							break;
						default:
							type = undefined;
					}
					var obj = {
						jobId : row.jobid,
						input : row.input_filepath,
						starttime : row.starttime,
						status : row.status,
						statusmessage : row.statusmessage,
						type : type,
						cardid : row.cardid,
						cpuid : row.cpu_cpuid
					};
					out.push(obj);
				}, function(err, rowNum) {
					resolve(out);
				});
			});	
		}
	});
}

module.exports = getJob;
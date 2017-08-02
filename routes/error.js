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
var errorAPI = express.Router();
var db = require('../db/dbSqlite').sqliteDB;
var tools = require('./tools/toolsIdx');

errorAPI.route('/')
	.get(function(req, res) {
		db.serialize(function() {
			var out = [];
			db.each("SELECT * from jobs WHERE error = " + req.query.error, function(err, row) {
				if (row.error == true) {
					db.run("UPDATE jobs SET " +
										"status = '3'," +
										"statusmessage = 'Failed'" +
										" WHERE jobid = " + row.jobid);
					var obj = {
						jobId : row.jobid,
						input : row.input_filepath,
						starttime : row.starttime,
						status : '3',
						statusmessage : "Failed",
						error : row.error,
						errorlog : row.errorlog,
						cpu : row.cpu_cpuid
					};
					out.push(obj);					
				} else {
					var obj = {
						jobId : row.jobid,
						input : row.input_filepath,
						starttime : row.starttime,
						status : row.status,
						statusmessage : row.statusmessage,
						error : row.error,
						errorlog : row.errorlog,
						cpu : row.cpu_cpuid
					};
					out.push(obj);					
				}
			}, function(err, rowNum) {
				res.json(out);
			});
		});
	});

module.exports = errorAPI;
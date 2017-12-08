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
var jobsAPI = express.Router();
var moment = require("moment");
var db = require('../db/dbSqlite').sqliteDB;
var tools = require('./tools/toolsIdx');

jobsAPI.route('/')
    .get(function(req, res) {
        db.serialize(function() {
            var out = [];
            db.each("SELECT * from jobs", function(err, jobRow) {
                var jobid = jobRow.jobid;
                db.all("SELECT * from outputs WHERE jobid = " + jobid, function(err, outputRows) {
                    if (jobRow !== undefined) {
                        var result = tools.reverseBody(jobRow);
                        result = tools.removeEmptyField(result);
                        for (var i = 0; i < outputRows.length; i++) {
                            outputRows[i] = tools.removeEmptyField(outputRows[i]);
                            delete outputRows[i].jobid;
                            delete outputRows[i].outputsID;
                        }
                        result.outputs = outputRows;
                        res.statusCode = 200;
                        res.json(result);
                    } else {
                        res.statusCode = 200;
                        res.json(null);
                    }
                });
                out.push(jobRow);
            }, function(err, rwoNum) {
                res.json(out);
            });
        });
    });

jobsAPI.route('/transcode')
    .post(function(req, res) {
        tools.startJob(req.body.jobId, function(response) {
            res.json(response);
        });
    });

jobsAPI.route('/status')
    .get(function(req, res) {
        Promise.resolve(tools.getJobByStatus(req.query.status))
            .then(function(result) {
                res.json(result);
            })
            .catch(function(err) {
                console.log(err);
                res.json(err);
            });
    });

jobsAPI.route('/timeinterval')
    .get(function(req, res) {
        var out = [];
        db.serialize(function() {
            var cardid = "";
            var cpuid = "";
            if (req.query.cardid == undefined || req.query.cardid == null || req.query.cardid == "") {
                cardid = undefined;
            } else {
                cardid = req.query.cardid;
            }
            if (req.query.cpuid == undefined || req.query.cpuid == null || req.query.cpuid == "") {
                cpuid = undefined;
            } else {
                cpuid = req.query.cpuid;
            }

            var countPerPage = req.query.countPerPage;
            var idx = (req.query.pageIdx - 1) * countPerPage;
            var startDate = req.query.startDate;
            var endDate = req.query.endDate;
            var interval = moment(startDate).diff(moment(startDate), 'days');

            if (interval > 7) {
                res.json({
                    Message: "The select interval cannot exceed 7 days."
                });
            } else if (countPerPage > 100) {
                res.json({
                    Message: "The countPerPage value cannot exceed 100."
                });
            } else {
                var sqliteInit = "SELECT * FROM jobs WHERE ";
                var sqliteQuery = "";
                var sqliteQueryTotalCnt = "";
                var timeQuery = "strftime('%Y-%m-%d %H:%M',starttime) BETWEEN '" + startDate + "' AND '" + endDate +
                    "' order by datetime(starttime) DESC limit " + idx + ", " + countPerPage;
                var timeQueryNoLimit = "strftime('%Y-%m-%d %H:%M',starttime) BETWEEN '" + startDate + "' AND '" + endDate + "'";
                sqliteQuery = sqliteInit;
                var needAnd = false;
                if (req.query.type != undefined && req.query.type != "") {
                    var apiMethodQuery = "";
                    switch (req.query.type) {
                        case "vod":
                            apiMethodQuery = "file2stream";
                            break;
                        case "live":
                            apiMethodQuery = "stream2stream";
                            break;
                        case "file":
                            apiMethodQuery = "file2file";
                            break;
                        default:
                            apiMethodQuery = "";
                    }
                    sqliteQuery = sqliteQuery + "apiMethod = '" + apiMethodQuery + "'";
                    needAnd = true;
                }
                if (req.query.status != undefined && req.query.status != "") {
                    if (needAnd == true) {
                        sqliteQuery = sqliteQuery + " AND status = " + req.query.status;
                    } else {
                        sqliteQuery = sqliteQuery + " status = " + req.query.status;
                        needAnd = true;
                    }
                }
                if (cardid != undefined && cpuid != undefined) {
                    if (needAnd == true) {
                        sqliteQuery = sqliteQuery + " AND cardid = '" + cardid + "' AND cpu_cpuid = '" + cpuid + "'";
                    } else {
                        sqliteQuery = sqliteQuery + "cardid = '" + cardid + "' AND cpu_cpuid = '" + cpuid + "'";
                        needAnd = true;
                    }
                }
                if (cardid != undefined && cpuid == undefined) {
                    if (needAnd == true) {
                        sqliteQuery = sqliteQuery + " AND cardid = '" + cardid + "'";
                    } else {
                        sqliteQuery = sqliteQuery + "cardid = '" + cardid + "'";
                        needAnd = true;
                    }
                }
                if (sqliteQuery == sqliteInit) {
                    var temp = sqliteQuery;
                    sqliteQuery = sqliteQuery + timeQuery;
                    sqliteQueryTotalCnt = temp + timeQueryNoLimit;
                } else {
                    var temp = sqliteQuery;
                    sqliteQuery = sqliteQuery + " AND " + timeQuery;
                    sqliteQueryTotalCnt = temp + " AND " + timeQueryNoLimit;
                }

                new Promise(function(resolve, reject) {
                        db.each(sqliteQuery, function(err, jobRow) {
                            var type = jobRow.apiMethod;
                            switch (type) {
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
                                jobId: jobRow.jobid,
                                starttime: jobRow.starttime,
                                status: jobRow.status,
                                input: {
                                    filepath: jobRow.input_filepath
                                },
                                cardid: jobRow.cardid,
                                cpuid: jobRow.cpu_cpuid,
                                type: type
                            }
                            if (type == "live") {
                                obj.input.streamname = jobRow.input_streamname;
                                obj.input.streamurl = jobRow.input_streamurl;
                            }
                            out.push(obj);
                        }, function(err, rowNum) {
                            resolve(out);
                        });
                    })
                    .then(function(result) {
                        var promiseArr = [];
                        for (var i = 0; i < result.length; i++) {
                            promiseArr.push(Promise.resolve(getOutputNum(result[i])));
                        }
                        return new Promise(function(resolve, reject) {
                            Promise.all(promiseArr)
                                .then(function(allData) {
                                    resolve(allData);
                                })
                                .catch(function(err) {
                                    console.log(err);
                                });
                        })
                    })
                    .then(function(allData) {
                        Promise.resolve(getTotalCount(sqliteQueryTotalCnt))
                            .then(function(count) {
                                var result = {
                                    totalCount: count,
                                    data: allData
                                }
                                res.json(result);
                            });
                    })
                    .catch(function(err) {
                        console.log(err);
                        res.json(err);
                    });
            }
        });
    });

jobsAPI.route('/:inputJobID')
    .get(function(req, res) {
        Promise.resolve(tools.getJob(req.params.inputJobID))
            .then(function(result) {
                res.json(result);
            })
            .catch(function(err) {
                console.log(err);
            });
    })
    .delete(function(req, res) {
        Promise.resolve(tools.deleteJob(req.params.inputJobID))
            .then(function(result) {
                res.json(result);
            })
            .catch(function(err) {
                console.log(err);
                res.json(err);
            });
    });

function getOutputNum(data) {
    return new Promise(function(resolve, reject) {
            db.all("SELECT * from outputs WHERE jobid = " + data.jobId, function(err, outputRows) {
                data.numofoutputs = outputRows.length;
                resolve(data);
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function getTotalCount(query) {
    return new Promise(function(resolve, reject) {
            db.each(query, function(err, jobRow) {}, function(err, rowNum) {
                resolve(rowNum);
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = jobsAPI;
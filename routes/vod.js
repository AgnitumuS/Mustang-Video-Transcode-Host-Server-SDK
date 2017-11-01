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
var vodAPI = express.Router();
var request = require('request');
var db = require('../db/dbSqlite').sqliteDB;
var tools = require('./tools/toolsIdx');
var fs = require('fs');

vodAPI.route('/')
    .get(function(req, res) {
        if (req.query.status != undefined) {
            Promise.resolve(tools.getJobByStatus(req.query.status, "file2stream"))
                .then(function(result) {
                    res.json(result);
                })
                .catch(function(err) {
                    console.log(err);
                    res.json(err);
                });
        } else {
            Promise.resolve(tools.getJob(undefined, "file2stream"))
                .then(function(result) {
                    res.json(result);
                })
                .catch(function(err) {
                    res.json(err);
                });
        }
    })
    .post(function(req, res) {
        var promise = new Promise(function(resolve, reject) {
            if (fs.existsSync(req.body.input.filepath)) {
                var resObj = tools.createJob(req.body, "file2stream", function(resObj) {
                    resolve(resObj);
                });
            } else {
                var obj = {
                    success: false,
                    message: "Cannot find input file in the directory! Please check again."
                }
                resolve(obj);
            }
        });

        if (req.body.action == 1) {
            promise.then(function(resObj) {
                    if (resObj.success == true) {
                        tools.startJob(resObj.jobId, function(response) {
                            res.json(response);
                        });
                    } else if (resObj.success == false) {
                        res.json(resObj);
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        } else {
            promise.then(function(resObj) {
                    res.json(resObj);
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    });

vodAPI.route('/:inputJobID')
    .get(function(req, res) {
        db.serialize(function() {
            db.get("SELECT * from jobs WHERE jobid = " + req.params.inputJobID, function(err, jobRow) {
                db.all("SELECT * from outputs WHERE jobid = " + req.params.inputJobID, function(err, outputRows) {
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
            });
        });
    })
    .put(function(req, res) {
        Promise.resolve(tools.updateJob(req.params.inputJobID, req.body))
            .then(function(result) {
                res.json(result);
            })
            .catch(function(err) {
                console.log(err);
                res.json(err);
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

vodAPI.route('/:inputJobID/transcode')
    .post(function(req, res) {
        tools.startJob(req.params.inputJobID, "file2stream", function(response) {
            res.json(response);
        });
    });

vodAPI.route('/:inputJobID/terminate')
    .post(function(req, res) {
        db.get("SELECT apiMethod from jobs WHERE jobid = " + req.body.jobId, function(err, data) {
            if (data == undefined) {
                res.json({
                    'success': false
                });
            } else {
                if (data.apiMethod == "file2stream") {
                    tools.terminateJob(req.body.jobId, function(response) {
                        res.json(response);
                    });
                } else {
                    res.json({
                        'success': false
                    });
                }
            }
        });
    });

module.exports = vodAPI;
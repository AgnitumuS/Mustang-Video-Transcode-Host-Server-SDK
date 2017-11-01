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
var router = express.Router();
var request = require('request');
var db = require('../../db/dbSqlite').sqliteDB;
var path = require('path');
var config = require('../../config/config');
var generateTimeStamp = require('./generateTimeStamp');
var buildRequestData = require('./buildRequestData');
var getURL = require('./getURL');
var generateJobID = require('./generateJobID');
var autoBalance = require('./autoBalance');
var runGstreamer = require('./runGstreamer');
var tagJobError = require('./tagJobError');
var cardMap = require('../../config/cardMap');
var getAudioCodec = require('./getCodec').getAudioCodec;
var mountPath = require('./mountPath');
var originalInputPath = "";

var startJob = function(inputJobID, callback) {
    var promise = new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.get("SELECT * from jobs WHERE jobid = " + inputJobID, function(err, jobRow) {
                var resObj = {
                    jobId: 　jobRow.jobid,
                    status: 1,
                    statusMessage: "Transcoding Started",
                }
                db.all("SELECT * from outputs WHERE jobid = " + inputJobID, function(err, outputRows) {
                    jobRow.outputs = outputRows;
                    resolve({
                        resObj: resObj,
                        job: jobRow
                    });
                });
            });
        });
    });

    promise.then(function(dataObj) {
            originalInputPath = dataObj.job.input_filepath;
            return new Promise(function(resolve, reject) {
                Promise.resolve(mountPath(dataObj.job.input_filepath, dataObj.job.apiMethod))
                    .then(function(result) {
                        dataObj.job.input_filepath = result;
                        resolve(dataObj);
                    });
            });
        })
        .then(function(dataObj) {
            // Check if need auto balance
            return new Promise(function(resolve, reject) {
                if (dataObj.job.cpu_autocpu == true) {
                    Promise.resolve(autoBalance(dataObj))
                        .then(function(dataObj) {
                            var cpuid = dataObj.job.cpu_cpuid;
                            var cardid = dataObj.job.cardid;
                            var ipAddr = cardMap[cardid].cpu(cpuid).getIPAddr();
                            var port = cardMap[cardid].cpu(cpuid).getPort();
                            // Handle the Live case
                            if (dataObj.job.apiMethod == "stream2stream") {
                                var ipAddrLive = config.externalIP;
                                var portLive = cardMap[cardid].cpu(cpuid).getRtmpPort();
                                input_streamurl = "rtmp://" + ipAddrLive + ":" + portLive + "/live/";
                                dataObj.job.input_streamurl = input_streamurl;
                                db.run("UPDATE jobs SET " +
                                    "input_streamurl = '" + input_streamurl + "' " +
                                    " WHERE jobid = " + dataObj.job.jobid);
                            }

                            dataObj.targetURL = "http://" + ipAddr + ":" + port + "/submachine/transcode";
                            db.run("UPDATE jobs SET " +
                                "starttime = " + "'" + generateTimeStamp() + "', " +
                                "status = " + "1, " +
                                "statusmessage = " + "'Running', " +
                                "cardid = '" + cardid + "', " +
                                "cpu_cpuid = '" + cpuid + "', " +
                                "cpu_ipaddress = '" + ipAddr + "' " +
                                " WHERE jobid = " + dataObj.job.jobid);
                            resolve(dataObj);
                        });
                } else if (dataObj.job.cpu_autocpu == false) {
                    var cpuid = dataObj.job.cpu_cpuid;
                    var cardid = dataObj.job.cardid;
                    var ipAddr = cardMap[cardid].cpu(cpuid).getIPAddr();
                    var port = cardMap[cardid].cpu(cpuid).getPort();
                    dataObj.targetURL = "http://" + ipAddr + ":" + port + "/submachine/transcode";

                    db.run("UPDATE jobs SET " +
                        "starttime = " + "'" + generateTimeStamp() + "', " +
                        "status = " + "1, " +
                        "statusmessage = " + "'Running', " +
                        "cardid = '" + cardid + "', " +
                        "cpu_cpuid = '" + cpuid + "', " +
                        "cpu_ipaddress = '" + ipAddr + "' " +
                        " WHERE jobid = " + dataObj.job.jobid);
                    resolve(dataObj);
                }
            });
        })
        .then(function(dataObj) {
            // check the acodec is copy
            if (dataObj.job.output_acodec == "copy") {
                return Promise.resolve(getAudioCodec(dataObj.job.input_filepath))
                    .then(function(acodec) {
                        return new Promise(function(resolve, reject) {
                            dataObj.job.output_acodec = acodec;
                            resolve(dataObj);
                        });
                    });
            } else {
                return dataObj;
            }
        })
        .then(function(dataObj) {
            return new Promise(function(resolve, reject) {
                if (dataObj.targetURL == "Busy") {
                    resolve(dataObj);
                } else {
                    var fileextension = dataObj.job.hasOwnProperty("fileextension") ? dataObj.job.fileextension : undefined;
                    if (fileextension != undefined) {
                        switch (fileextension) {
                            case 0:
                                fileextension = "mkv";
                                break;
                            case 1:
                                fileextension = "mp4";
                                break;
                            case 2:
                                fileextension = "flv";
                                break;
                            case 3:
                                fileextension = "f4v";
                                break;
                            case 4:
                                fileextension = "avi";
                                break;
                            case 5:
                                fileextension = "webm";
                                break;
                            case 6:
                                fileextension = "mpeg";
                                break;
                            case 7:
                                fileextension = "mov";
                                break;
                            case 8:
                                fileextension = "mpg";
                                break;
                            case 9:
                                fileextension = "ms";
                                break;
                            case 10:
                                fileextension = "mts";
                                break;
                            default:
                                fileextension = undefined;
                                break;
                        }
                    }

                    var data = buildRequestData(dataObj.job, dataObj.job.apiMethod, fileextension);
                    if (dataObj.job.output_vcodec != "vp9") {
                        console.log(data);
                    }
                    dataObj.inputData = data;

                    var array = [];
                    for (var i = 0; i < dataObj.job.outputs.length; i++) {
                        var outputsID = dataObj.job.outputs[i].outputsID;
                        var outputFilename = path.basename(data.outputs[i].name);
                        var outURL = getURL(outputsID, dataObj.job, originalInputPath, outputFilename, fileextension);
                        array.push({
                            url: outURL
                        });
                        db.run("UPDATE outputs SET url = '" + outURL + "' WHERE outputsid = " + outputsID);
                    }
                    if (dataObj.job.apiMethod == "stream2stream") {
                        dataObj.resObj.input = {
                            streamname: dataObj.job.input_streamname,
                            streamurl: dataObj.job.input_streamurl
                        }
                    }
                    dataObj.resObj.outputs = array;

                    if (dataObj.job.output_vcodec == "vp9") {
                        Promise.resolve(runGstreamer(dataObj))
                            .then(function(data) {
                                resolve(data);
                            });
                    } else {
                        request({
                            url: dataObj.targetURL,
                            method: 'POST',
                            json: data,
                            timeout: 3000
                        }, function(error, response, body) {
                            if (error) {
                                console.log("Oh Noooooo~~~~, Connection to " + dataObj.targetURL + " timeout!!!");
                                console.log(error);
                                tagJobError(data.jobId);
                                var msg = {
                                    success: false,
                                    message: "Oh Noooooo~~~~, Connection to " + dataObj.targetURL + " timeout!!!",
                                    error: error
                                }
                                dataObj.msg = msg;
                                resolve(dataObj);
                            } else {
                                console.log(body);
                                if (body.message != "Success") {
                                    if (body.data[0].hasOwnProperty("message")) {
                                        db.run("UPDATE jobs SET " +
                                            "error = 1," +
                                            "errorlog = '" + JSON.stringify(body.data[0].message) + "'," +
                                            "status = 3," +
                                            "statusmessage = 'failed'" +
                                            " WHERE jobid = " + dataObj.job.jobid);
                                    } else if (body.data.data[0].hasOwnProperty("message")) {
                                        db.run("UPDATE jobs SET " +
                                            "error = 1," +
                                            "errorlog = '" + JSON.stringify(body.data.data[0].message) + "'," +
                                            "status = 3," +
                                            "statusmessage = 'failed'" +
                                            " WHERE jobid = " + dataObj.job.jobid);
                                    }
                                    dataObj.msg = {
                                        jobId: dataObj.job.jobid,
                                        success: false,
                                        error: body.data
                                    }
                                    resolve(dataObj);
                                } else {
                                    dataObj.msg = body;
                                    resolve(dataObj);
                                }
                            }
                        });
                    }
                }
            });
        })
        .then(function(dataObj) {
            if (dataObj.targetURL == "Busy") {
                return callback("All card are too busy, please try later!");
            } else if (dataObj.msg.message == "Success") {
                return callback(dataObj.resObj);
            } else {
                return callback(dataObj.msg);
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = startJob;
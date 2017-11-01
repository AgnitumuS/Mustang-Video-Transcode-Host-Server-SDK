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
const exec = require('child_process').exec;
var request = require('request');
var config = require('../../config/config');
var tagJobError = require('./tagJobError');
var cardMap = require('../../config/cardMap');
var getCodecInfo = require('./getCodec').getCodecInfo;
var generateFilename = require('./generateFilename');
var path = require('path');
var db = require('../../db/dbSqlite').sqliteDB;

function runGstreamer(dataObj) {
    return Promise.resolve(getCodecInfo(dataObj.job.input_filepath))
        .then(function(mediaInfo) {
            var array = [];
            for (var i = 0; i < dataObj.job.outputs.length; i++) {
                var resolution = dataObj.job.outputs[i].resolution;
                if (dataObj.job.outputs[i].resolutionid == 5) {
                    resolution = "856x480";
                } else if (dataObj.job.outputs[i].resolutionid == 7) {
                    resolution = "424x240";
                }
                if (dataObj.job.apiMethod == "file2file") {
                    var filename = generateFilename(dataObj.job.input_filepath, resolution, "vp9");
                    var obj = {
                        name: path.dirname(dataObj.job.input_filepath).replace(config.hostMountedDir, config.cardMountedDir) + "/output" + "/" + filename + i,
                        resolution: resolution,
                        framerate: Number.parseInt(dataObj.job.outputs[i].framerate),
                        vquality: Number.parseInt(dataObj.job.outputs[i].vquality)
                    }
                    array.push(obj);
                } else if (dataObj.job.apiMethod == "file2stream") {
                    var obj = {
                        name: dataObj.job.outputs[i].outputsID,
                        resolution: resolution,
                        framerate: Number.parseInt(dataObj.job.outputs[i].framerate),
                        vquality: Number.parseInt(dataObj.job.outputs[i].vquality)
                    }
                    array.push(obj);
                }
                // var filename = generateFilename(dataObj.job.input_filepath, dataObj.job.outputs[i].resolution);
                // var obj = {
                // 	// name : dataObj.job.outputs[i].outputsID,
                // 	name : path.dirname(dataObj.job.input_filepath).replace(config.hostMountedDir, config.cardMountedDir) + "/output" + "/" + filename + i,
                // 	resolution : resolution,
                // 	framerate : Number.parseInt(dataObj.job.outputs[i].framerate),
                // 	vquality : Number.parseInt(dataObj.job.outputs[i].vquality)
                // }
                // array.push(obj);
            }

            return new Promise(function(resolve, reject) {
                var inputObj = {
                    jobId: dataObj.job.jobid,
                    transcode: dataObj.job.apiMethod,
                    data: {
                        path: dataObj.job.input_filepath.replace(config.hostMountedDir, config.cardMountedDir)
                    },
                    input: mediaInfo,
                    outputs: array
                }
                console.log("This is input of vp9:");
                console.log(inputObj);

                var cpuid = dataObj.job.cpu_cpuid;
                var cardid = dataObj.job.cardid;
                var ipAddr = cardMap[cardid].cpu(cpuid).getIPAddr();
                var port = cardMap[cardid].cpu(cpuid).getGstreamerPort();
                var gstreamerURL = "http://" + ipAddr + ":" + port + "/submachine/transcode";

                request({
                    url: gstreamerURL,
                    method: 'POST',
                    json: inputObj,
                    timeout: 3000
                }, function(error, response, body) {
                    if (error) {
                        console.log("Oh Noooooo~~~~, Connection to " + gstreamerURL + " timeout!!!");
                        console.log(error);
                        tagJobError(dataObj.job.jobid);
                        var msg = {
                            success: false,
                            message: "Oh Noooooo~~~~, Connection to " + gstreamerURL + " timeout!!!",
                            error: error
                        }
                        dataObj.msg = msg;
                        resolve(dataObj);
                    } else {
                        console.log(body);
                        if (body.message != "Success") {
                            db.run("UPDATE jobs SET " +
                                "error = 1," +
                                "errorlog = '" + JSON.stringify(body.data[0].message) + "'," +
                                "status = '3'," +
                                "status = '3'," +
                                "statusmessage = 'failed'" +
                                " WHERE jobid = " + dataObj.job.jobid);
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
            });
        })
        .catch(function(error) {
            console.log(error);
        });
}

module.exports = runGstreamer;
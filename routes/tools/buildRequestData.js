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
var generateFilename = require('./generateFilename');
var config = require('../../config/config');
var path = require('path');

var buildRequestData = function(body, apiMethod, fileextension) {
    var outputArr = [];
    var protocolMap = {
        0: "live",
        1: "hls",
        2: "dash",
        3: "none"
    }
    switch (apiMethod) {
        case "file2file":
            for (var i = 0; i < body.outputs.length; i++) {
                var filename = generateFilename(body.input_filepath, body.outputs[i].resolution);
                var out = {};
                out.name = path.dirname(body.input_filepath).replace(config.hostMountedDir, config.cardMountedDir).replace(/\\/g, '/') + "/output" + "/" + filename + i;
                out.resolution = body.outputs[i].resolution;
                out.framerate = parseInt(body.outputs[i].framerate);
                if (body.outputs[i].bitrateenable == false) {
                    out.vquality = parseInt(body.outputs[i].vquality);
                } else {
                    out.vbitrate = body.outputs[i].vbitrate;
                }
                outputArr.push(out);
            }
            data = {
                "jobId": body.jobid,
                "transcode": "file2file",
                "quickTranscodeEnable": body.quickTranscodeEnable == 1 ? true : false,
                "data": {
                    "path": body.input_filepath.replace(config.hostMountedDir, config.cardMountedDir).replace(/\\/g, '/')
                },
                "outputs": outputArr,
                "output": {
                    "vcodec": body.output_vcodec == "h265" ? "hevc" : body.output_vcodec,
                    "profile": body.output_profile,
                    "level": body.output_level,
                    "acodec": body.output_acodec,
                    "abitrate": body.output_abitrate,
                    "format": fileextension == "mkv" ? "matroska" : fileextension,
                }
            };
            break;
        case "file2stream":
            var format = "";
            switch (body.output_vcodec) {
                case "h264":
                    format = "flv";
                    break;
                case "h265":
                    if (body.protocol == 1) {
                        format = "ssegment";
                    } else if (body.protocol == 2) {
                        format = "dash";
                    }
                    break;
                case "vp8":
                    format = "webm";
                    break;
                default:
                    break;
            }
            for (var i = 0; i < body.outputs.length; i++) {
                var out = {};
                out.name = body.outputs[i].outputsID;
                out.resolution = body.outputs[i].resolution;
                out.framerate = parseInt(body.outputs[i].framerate);
                if (body.outputs[i].bitrateenable == false) {
                    out.vquality = parseInt(body.outputs[i].vquality);
                } else {
                    out.vbitrate = body.outputs[i].vbitrate;
                }
                outputArr.push(out);
            }
            data = {
                "jobId": body.jobid,
                "transcode": "file2stream",
                "data": {
                    "path": body.input_filepath.replace(config.hostMountedDir, config.cardMountedDir).replace(/\\/g, '/')
                },
                "outputs": outputArr,
                "output": {
                    "vcodec": body.output_vcodec == "h265" ? "hevc" : body.output_vcodec,
                    "profile": body.output_profile,
                    "level": body.output_level,
                    "acodec": body.output_acodec,
                    "abitrate": body.output_abitrate,
                    "format": format,
                    "protocol": body.output_vcodec == "vp8" ? "none" : protocolMap[body.protocol]
                }
            };
            break;
        case "stream2stream":
            for (var i = 0; i < body.outputs.length; i++) {
                var out = {};
                out.name = body.outputs[i].outputsID;
                out.resolution = body.outputs[i].resolution;
                out.framerate = parseInt(body.outputs[i].framerate);
                if (body.outputs[i].bitrateenable == false) {
                    out.vquality = parseInt(body.outputs[i].vquality);
                } else {
                    out.vbitrate = body.outputs[i].vbitrate;
                }
                outputArr.push(out);
            }
            data = {
                "jobId": body.jobid,
                "transcode": "stream2stream",
                "data": {
                    "path": body.input_streamurl + body.input_streamname
                },
                "outputs": outputArr,
                "output": {
                    "vcodec": body.output_vcodec == "h265" ? "hevc" : body.output_vcodec,
                    "profile": body.output_profile,
                    "level": body.output_level,
                    "acodec": body.output_acodec,
                    "abitrate": body.output_abitrate,
                    "format": body.output_vcodec == "h264" ? "flv" : "webm",
                    "protocol": body.output_vcodec == "vp8" ? "none" : protocolMap[body.protocol]
                }
            };
            break;
        default:
            break;
    }
    return data;
}

module.exports = buildRequestData;

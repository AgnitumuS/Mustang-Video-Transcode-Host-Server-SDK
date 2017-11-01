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
var getVideoCodec = require('./getCodec').getVideoCodec;
var getAudioCodec = require('./getCodec').getAudioCodec;

function getMediaInfo(filePath) {
    return Promise.all([
            getResolutionWidth(filePath),
            getResolutionHeight(filePath),
            getVideoBitrate(filePath),
            getFramerate(filePath),
            getAspectRatio(filePath),
            getDuration(filePath),
            getAudioBitrate(filePath),
            getVideoCodec(filePath),
            getAudioCodec(filePath),
            getVideoProfie(filePath)
        ])
        .then(function(allData) {
            var result = {
                vresolution: allData[0] + "x" + allData[1],
                vbitrate: allData[2],
                vframerate: allData[3],
                vaspectratio: allData[4],
                duration: allData[5],
                abitrate: allData[6],
                vcodec: allData[7],
                acodec: allData[8],
                vprofile: allData[9]
            }
            return result;
        });
}

function getResolutionWidth(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo --Inform="Video;%Width%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "\n") {
                resolve("");
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

function getResolutionHeight(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo --Inform="Video;%Height%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "\n") {
                resolve("");
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

function getVideoBitrate(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo --Inform="Video;%BitRate%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "\n") {
                resolve("");
            } else {
                var bitrate = Number.parseInt(stdout);
                bitrate = (bitrate / 1000000).toString() + "Mbps";
                resolve(bitrate);
            }
        });
    });
}

function getFramerate(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo --Inform="Video;%FrameRate%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "\n") {
                resolve("");
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

function getAspectRatio(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo --Inform="Video;%DisplayAspectRatio%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "\n") {
                resolve("");
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

function getDuration(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo --Inform="General;%Duration%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "\n") {
                resolve("");
            } else {
                var duration_ms = Number.parseInt(stdout);
                var min = Math.floor(duration_ms / 1000 / 60);
                var sec = Math.floor(duration_ms / 1000 % 60);
                resolve(min + " min " + sec + " s");
            }
        });
    });
}

function getAudioBitrate(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo --Inform="Audio;%BitRate%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            if (stdout == "\n") {
                resolve("");
            } else {
                var bitrate = Number.parseInt(stdout);
                bitrate = (bitrate / 1000).toString() + "kbps";
                resolve(bitrate);
            }
        });
    });
}

function getVideoProfie(filePath) {
    return new Promise(function(resolve, reject) {
        var cmd = 'mediainfo ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            var data = stdout;
            data = data.split("\n");
            var findVideo = false;
            for (var i = 0; i < data.length; i++) {
                var line = data[i].split(':');
                if (line.length == 1 && line[0] == "Video") {
                    findVideo = true;
                }
                if (line.length == 2 && line[0].trim() == "Format profile" && findVideo == true) {
                    resolve(line[1].trim());
                }
            }
        });
    });
}

module.exports = getMediaInfo;
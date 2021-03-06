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
var config = require('../../config/config');
var path = require('path');

function getAudioCodec(filePath) {
    var mediainfoCmd = getMediaInfoCmd();
    filePath = path.normalize(filePath);
    return new Promise(function(resolve, reject) {
        var cmd = mediainfoCmd + ' --Inform="Audio;%Format%," ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            stdout = stdout.split(',')[0];

            var audioCodec = stdout.trim().toLowerCase();
            switch (audioCodec) {
                case "aac":
                    audioCodec = "aac";
                    break;
                case "mpeg audio":
                    audioCodec = "mp3";
                    break;
                case "ac-3":
                    audioCodec = "mp3";
                    break;
                case "vorbis":
                    audioCodec = "vorbis";
                    break;
                default:
                    break;
            }
            resolve(audioCodec);
        });
    });
}

function getVideoCodec(filePath) {
    var mediainfoCmd = getMediaInfoCmd();
    return new Promise(function(resolve, reject) {
        var cmd = mediainfoCmd + ' --Inform="Video;%Format%" ' + '"' + filePath + '"';
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }
            var videoCodec = stdout.trim().toLowerCase();
            switch (videoCodec) {
                case "avc":
                    videoCodec = "h264";
                    break;
                case "hevc":
                    videoCodec = "h265";
                    break;
                case "mpeg video":
                    videoCodec = "mpeg2";
                    break;
                default:
                    break;
            }
            resolve(videoCodec);
        });
    });
}

function getFiletype(filePath) {
    var filename = filePath.split('/');
    filename = filename[filename.length - 1];
    var filetype = filename.split('.');
    filetype = filetype[filetype.length - 1];
    return filetype;
}

function getCodecInfo(filePath) {
    return Promise.all([getAudioCodec(filePath), getVideoCodec(filePath)])
        .then(function(allData) {
            var filetype = getFiletype(filePath);
            var obj = {
                filetype: filetype,
                audio: allData[0],
                video: allData[1]
            }
            return obj;
        })
        .catch(function(err) {
            console.log(err);
        });
}

function getMediaInfoCmd() {
    if (config.platform == "" || config.platform == null) {
        return undefined;
    } else if (config.platform == "windows") {
        mediainfoCmd = config.rootDirName + '\\MediaInfo\\mediainfo';
        return mediainfoCmd;
    } else {
        mediainfoCmd = 'mediainfo';
        return mediainfoCmd;
    }
}

module.exports = {
    getAudioCodec: getAudioCodec,
    getVideoCodec: getVideoCodec,
    getFiletype: getFiletype,
    getCodecInfo: getCodecInfo
}

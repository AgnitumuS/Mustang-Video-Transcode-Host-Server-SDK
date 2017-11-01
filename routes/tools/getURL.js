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
var config = require('../../config/config');
var cardMap = require('../../config/cardMap');
var path = require('path');

var getURL = function(outputsID, data, origianlInputPath, outputFilename, fileextension) {
    var protocol = data.protocol;
    var apiMethod = data.apiMethod;
    var cardid = data.cardid;
    var cpuid = data.cpu_cpuid;
    var inputDir = path.dirname(origianlInputPath);
    var vcodec = data.vcodec;

    var result = "";
    if (vcodec == "vp9") {
        if (apiMethod == "file2file") {
            return inputDir + "/output/" + outputFilename + "." + fileextension;
        } else {
            result = "http://" + config.externalIP + ":" + cardMap[cardid].cpu(cpuid).getIcecastPort() + "/" + outputsID;
            return result;
        }
    } else {
        if (apiMethod == "file2file") {
            return inputDir + "/output/" + outputFilename + "." + fileextension;
        } else {
            switch (protocol) {
                case 0:
                    result = "rtmp://" + config.externalIP + ":" + cardMap[cardid].cpu(cpuid).getRtmpPort() + "/live/" + outputsID;
                    break;
                case 1:
                    result = "http://" + config.externalIP + ":" + cardMap[cardid].cpu(cpuid).getHttpPort() + "/hls/" + outputsID + ".m3u8";
                    break;
                case 2:
                    result = "http://" + config.externalIP + ":" + cardMap[cardid].cpu(cpuid).getHttpPort() + "/dash/" + outputsID + ".mpd";
                    break;
                case 3:
                    result = "http://" + config.externalIP + ":" + cardMap[cardid].cpu(cpuid).getIcecastPort() + "/" + outputsID;
                    break;
                    defaulf:
                        result = "";
            }
            return result;
        }
    }
}

module.exports = getURL;
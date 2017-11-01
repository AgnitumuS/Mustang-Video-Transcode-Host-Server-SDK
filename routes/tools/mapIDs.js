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
var config = require("../../config/config");
var cardMap = require('../../config/cardMap');

var mapIDs = function(reqBody) {
    var output_vcodec = "";
    var output_profile = "";
    var output_level = "";
    var output_acodec = "";
    var output_abitrate = "";
    var outputs_resolution = [];
    var cpu_ipaddress = "";

    switch (reqBody.output.vcodecid) {
        case 1:
            output_vcodec = "h264";
            break;
        case 2:
            output_vcodec = "h265";
            break;
        case 3:
            output_vcodec = "vp8";
            break;
        case 4:
            output_vcodec = "vp9";
            break;
        case 5:
            output_vcodec = "mpeg2";
            break;
            defaulf:
                output_vcodec = "";
    }

    switch (reqBody.output.profileid) {
        case 1:
            output_profile = "main";
            break;
        case 2:
            output_profile = "high";
            break;
            defaulf:
                output_profile = "";
    }

    switch (reqBody.output.levelid) {
        case 1:
            output_level = 3.1;
            break;
        case 2:
            output_level = 3.2;
            break;
        case 3:
            output_level = 4;
            break;
        case 4:
            output_level = 4.1;
            break;
        case 5:
            output_level = 4.2;
            break;
        case 6:
            output_level = 5;
            break;
        case 7:
            output_level = 5.1;
            break;
        case 8:
            output_level = 5.2;
            break;
        case 9:
            output_level = 6;
            break;
        case 10:
            output_level = 6.1;
            break;
        case 11:
            output_level = 6.2;
            break;
            defaulf:
                output_level = null;
    }

    switch (reqBody.output.abitrateid) {
        case 1:
            output_abitrate = "64k";
            break;
        case 2:
            output_abitrate = "96k";
            break;
        case 3:
            output_abitrate = "128k";
            break;
        case 4:
            output_abitrate = "192k";
            break;
            defaulf:
                output_abitrate = null;
    }

    switch (reqBody.output.acodecid) {
        case 1:
            output_acodec = "aac";
            break;
        case 2:
            output_acodec = "mp3";
            break;
        case 3:
            output_acodec = "vorbis";
            break;
        case 4:
            output_acodec = "copy";
            break;
        case 5:
            output_acodec = "disable";
            break;
            defaulf:
                output_acodec = "";
    }

    for (var i = 0; i < reqBody.outputs.length; i++) {
        switch (reqBody.outputs[i].resolutionid) {
            case 1:
                outputs_resolution.push({
                    resolution: "3840x2160"
                });
                break;
            case 2:
                outputs_resolution.push({
                    resolution: "2560x1440"
                });
                break;
            case 3:
                outputs_resolution.push({
                    resolution: "1920x1080"
                });
                break;
            case 4:
                outputs_resolution.push({
                    resolution: "1280x720"
                });
                break;
            case 5:
                outputs_resolution.push({
                    resolution: "854x480"
                });
                break;
            case 6:
                outputs_resolution.push({
                    resolution: "640x360"
                });
                break;
            case 7:
                outputs_resolution.push({
                    resolution: "426x240"
                });
                break;
            default:
                outputs_resolution = [];
        }
    }

    var cpu_ipaddress = "";
    if (cardMap[reqBody.cardid] != undefined) {
        if (cardMap[reqBody.cardid].cpu(reqBody.cpu.cpuid) != undefined) {
            cpu_ipaddress = cardMap[reqBody.cardid].cpu(reqBody.cpu.cpuid).getIPAddr();
        }
    }

    var idMap = {
        output_vcodec: output_vcodec,
        output_profile: output_profile,
        output_level: output_level,
        output_acodec: output_acodec,
        output_abitrate: output_abitrate,
        outputs_resolution: outputs_resolution,
        cpu_ipaddress: cpu_ipaddress
    }
    return idMap;
}

module.exports = mapIDs;
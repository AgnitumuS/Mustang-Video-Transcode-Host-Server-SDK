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
var cardMap = require('../../config/cardMap');
var config = require('../../config/config');

var transformBody = function(reqBody, apiMethod) {
    var keys = Object.keys(reqBody);
    var inputKeys = [];
    var outputKeys = [];
    var outputKeys = [];
    var cpuKeys = [];
    if (reqBody.hasOwnProperty("input")) {
        inputKeys = Object.keys(reqBody.input);
    }
    if (reqBody.hasOwnProperty("output")) {
        outputKeys = Object.keys(reqBody.output);
    }
    if (reqBody.hasOwnProperty("outputs")) {
        outputsKeys = Object.keys(reqBody.outputs);
    }
    if (reqBody.hasOwnProperty("cpu")) {
        cpuKeys = Object.keys(reqBody.cpu);
    }

    var input_streamurl = "";
    if (apiMethod == "stream2stream" && reqBody.cpu.autocpu == false) {
        var ipAddr = config.externalIP;
        var port = cardMap[reqBody.cardid].cpu(reqBody.cpu.cpuid).getRtmpPort();
        input_streamurl = "rtmp://" + ipAddr + ":" + port + "/live/";
    } else {
        input_streamurl = "";
    }

    var body = {
        description: keys.indexOf("description") === -1 ? "" : reqBody.description,
        action: keys.indexOf("action") === -1 ? "" : reqBody.action,
        quickTranscodeEnable: keys.indexOf("quickTranscodeEnable") === -1 ? "" : reqBody.quickTranscodeEnable,
        input_filepath: inputKeys.indexOf("filepath") === -1 ? "" : reqBody.input.filepath,
        input_streamname: inputKeys.indexOf("streamname") === -1 ? "" : reqBody.input.streamname,
        input_streamurl: input_streamurl,
        input_vresolution: inputKeys.indexOf("vresolution") === -1 ? "" : reqBody.input.vresolution,
        input_vbitrate: inputKeys.indexOf("vbitrate") === -1 ? "" : reqBody.input.vbitrate,
        input_vcodec: inputKeys.indexOf("vcodec") === -1 ? "" : reqBody.input.vcodec,
        input_vprofile: inputKeys.indexOf("vprofile") === -1 ? "" : reqBody.input.vprofile,
        input_vlevel: inputKeys.indexOf("vlevel") === -1 ? "" : reqBody.input.vlevel,
        input_vframerate: inputKeys.indexOf("vframerate") === -1 ? "" : reqBody.input.vframerate,
        input_vaspectratio: inputKeys.indexOf("vaspectratio") === -1 ? "" : reqBody.input.vaspectratio,
        input_duration: inputKeys.indexOf("duration") === -1 ? "" : reqBody.input.duration,
        input_acodec: inputKeys.indexOf("acodec") === -1 ? "" : reqBody.input.acodec,
        input_abitrate: inputKeys.indexOf("abitrate") === -1 ? "" : reqBody.input.abitrate,
        output_vcodecid: outputKeys.indexOf("vcodecid") === -1 ? "" : reqBody.output.vcodecid,
        output_profileid: outputKeys.indexOf("profileid") === -1 ? "" : reqBody.output.profileid,
        output_levelid: outputKeys.indexOf("levelid") === -1 ? "" : reqBody.output.levelid,
        output_acodecid: outputKeys.indexOf("acodecid") === -1 ? "" : reqBody.output.acodecid,
        output_abitrate: outputKeys.indexOf("abitrate") === -1 ? "" : reqBody.output.abitrate,
        output_abitrateid: outputKeys.indexOf("abitrateid") === -1 ? "" : reqBody.output.abitrateid,
        protocol: keys.indexOf("protocol") === -1 ? "" : reqBody.protocol,
        cardid: keys.indexOf("cardid") === -1 ? "" : reqBody.cardid,
        fileextension: keys.indexOf("fileextension") === -1 ? "" : reqBody.fileextension,
        cpu_autocpu: cpuKeys.indexOf("autocpu") === -1 ? "" : reqBody.cpu.autocpu,
        cpu_cpuid: cpuKeys.indexOf("cpuid") === -1 ? "" : reqBody.cpu.cpuid,
        cpu_ipaddess: cpuKeys.indexOf("ipaddress") === -1 ? "" : reqBody.cpu.ipaddress
    }
    return body;
}

module.exports = transformBody;
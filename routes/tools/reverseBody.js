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
var db = require('../../db/dbSqlite').sqliteDB;

var reverseBody = function(data) {
    if (data.error == true) {
        data.status = "3";
        data.statusmessage = "Failed";
        db.run("UPDATE jobs SET " +
            "status = '3'," +
            "statusmessage = 'Failed'" +
            " WHERE jobid = " + data.jobid);
    }

    switch (data.apiMethod) {
        case "file2stream":
            data.apiMethod = "vod";
            break;
        case "file2file":
            data.apiMethod = "file";
            break;
        case "stream2stream":
            data.apiMethod = "live";
            break;
        default:
            break;
    }

    var obj = {
        jobId: data.jobid,
        description: data.description,
        starttime: data.starttime,
        endtime: data.endtime,
        status: data.status,
        statusmessage: data.statusmessage,
        errorlog: data.errorlog,
        error: data.error == true,
        cpercentage: data.cpercentage,
        input: {
            filepath: data.input_filepath,
            streamname: data.input_streamname,
            streamurl: data.input_streamurl,
            vresolution: data.input_vresolution,
            vbitrate: data.input_vbitrate,
            vcodec: data.input_vcodec,
            vprofile: data.input_vprofile,
            vlevel: data.input_vlevel,
            vframerate: data.input_vframerate,
            vaspectratio: data.input_vaspectratio,
            duration: data.input_duration,
            acode: data.input_acodec,
            abitrate: data.input_abitrate
        },
        output: {
            vcodec: data.output_vcodec,
            vcodecid: data.output_vcodecid,
            profile: data.output_profile,
            profileid: data.output_profileid,
            level: data.output_level,
            levelid: data.output_levelid,
            acodec: data.output_acodec,
            acodecid: data.output_acodecid,
            abitrateid: data.output_abitrateid,
            abitrate: data.output_abitrate
        },
        protocol: data.protocol,
        fileextension: data.fileextension,
        cardid: data.cardid,
        type: data.apiMethod,
        cpu: {
            autocpu: data.cpu_autocpu == 1 ? true : false,
            cpuid: data.cpu_cpuid,
            ipaddress: data.cpu_ipaddress
        }
    };

    var inputKeys = Object.keys(obj.input);
    for (var i = 0; i < inputKeys.length; i++) {
        if (obj.input[inputKeys[i]] == "" || obj.input[inputKeys[i]] == null) {
            delete obj.input[inputKeys[i]];
        }
    }
    return obj;
}

module.exports = reverseBody;
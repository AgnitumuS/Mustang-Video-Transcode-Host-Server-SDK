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
var transcodeMap = {
    file2file: ["h264", "h265", "mpeg2", "vp8", "vp9"],
    file2stream: ["h264", "h265", "vp8", "vp9"],
    stream2stream: ["h264", "vp8"]
}

var h264Map = {
    profile: ["main", "high"],
    level_main: ["3.1", "3.2", "4", "4.1", "4.2", "5", "5.1", "5.2"],
    level_high: ["3.1", "3.2", "4", "4.1", "4.2", "5", "5.1", "5.2"],
    acodec_file: ["aac", "mp3", "copy", "disable"],
    acodec_stream: ["aac", "copy", "disable"],
    abitrate: ["64k", "96k", "128k", "192k"],
    format_file: [0, 1, 2, 3, 4, 7],
    format_stream: ["flv"],
    protocol: ["0", "1", "2", "3"],
    outputs: {
        resolutionid: [1, 2, 3, 4, 5, 6, 7],
        framerate: ["25", "30", "50", "60"]
    }
};

var vp8Map = {
    acodec: ["vorbis", "disable"],
    outputs: {
        resolutionid: [1, 2, 3, 4, 5, 6, 7],
        framerate: ["25", "30", "50", "60"]
    }
};

var hevcMap = {
    profile: ["main"],
    level: ["3.1", "4", "4.1", "5", "5.1", "5.2", "6", "6.1", "6.2"],
    acodec: ["aac", "mp3", "copy", "disable"],
    abitrate: ["64k", "96k", "128k"],
    format: [0, 1, 4, 7],
    outputs: {
        resolutionid: [1, 2, 3, 4, 5, 6, 7],
        framerate: ["25", "30", "50", "60"]
    }
};

var mpeg2Map = {
    acodec: ["mp3", "copy", "disable"],
    abitrate: ["64k", "96k", "128k"],
    format: [6, 8],
    outputs: {
        resolutionid: [1, 2, 3, 4, 5, 6, 7],
        framerate: ["25", "30", "50", "60"]
    }
};


var formatValidation = function(data, apiMethod, fileextension) {
    var errorMsg = {};
    if (apiMethod == "file2file") {
        if (transcodeMap.file2file.indexOf(data.output_vcodec) > -1) {
            if (data.output_vcodec == "h264") {
                // profile
                if (h264Map.profile.indexOf(data.output_profile) == -1) {
                    errorMsg.profile = data.output_profile + " is not supported!";
                }
                // level
                if (data.output_profile == "main" && h264Map.level_main.indexOf(data.output_level) == -1) {
                    errorMsg.level = data.output_level + " is not the proper level value for profile main";
                } else if (data.output_profile == "high" && h264Map.level_high.indexOf(data.output_level) == -1) {
                    errorMsg.level = data.output_level + " is not the proper level value for profile high";
                }
                // acodec
                if (h264Map.acodec_file.indexOf(data.output_acodec) == -1) {
                    errorMsg.acodec = data.output_acodec + " is not the proper value!";
                }
                // abitrate
                if (h264Map.abitrate.indexOf(data.output_abitrate) == -1) {
                    errorMsg.abitrate = data.output_abitrate + " is not the proper abitrate value!";
                }
                // format
                if (h264Map.format_file.indexOf(data.fileextension) == -1) {
                    errorMsg.format = fileextension + " is not the proper format value!";
                }
                // protocol
                if (data.output_protocol > 3 || data.output_protocol < 0) {
                    errorMsg.protocol = "Not valid";
                }
                // outputs
                for (var i = 0; i < data.outputs.length; i++) {
                    var outputsErr = {};
                    // resolutionid
                    if (h264Map.outputs.resolutionid.indexOf(data.outputs[i].resolutionid) == -1) {
                        outputsErr.resolutionid = "Not valid!";
                    }
                    // framerate
                    if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                        outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                    }
                    // vbitrate & vquality
                    if (data.outputs[i].bitrateenable == true) {
                        var value = data.outputs[i].vbitrate.slice(0, data.outputs[i].vbitrate.length - 1);
                        value = parseInt(value);
                        if (value < 1 || value > 25) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vbitrate = "Not valid!. Valid Range : 1 ~ 25!";
                        }
                    } else if (data.outputs[i].bitrateenable == false) {
                        var value = parseInt(data.outputs[i].vquality);
                        if (value < 0 || value > 51) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vquality = "Not valid!, Valid Range : 0 ~ 51!";
                        }
                    }
                    if (Object.keys(outputsErr).length != 0) {
                        var tempName = "outputs[" + i + "]";
                        errorMsg[tempName] = outputsErr;
                    }
                }
            } else if (data.output_vcodec == "vp8") {
                // acodec
                if (vp8Map.acodec.indexOf(data.output_acodec) == -1) {
                    errorMsg.acodec = data.output_acodec + " is not the proper value!";
                }
                // outputs
                for (var i = 0; i < data.outputs.length; i++) {
                    var outputsErr = {};
                    // resolutionid
                    if (vp8Map.outputs.resolutionid.indexOf(data.outputs[i].resolutionid) == -1) {
                        outputsErr.resolutionid = "Not valid!";
                    }
                    // framerate
                    if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                        outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                    }
                    // vbitrate & vquality
                    if (data.outputs[i].bitrateenable == true) {
                        var value = data.outputs[i].vbitrate.slice(0, data.outputs[i].vbitrate.length - 1);
                        value = parseInt(value);
                        if (value < 1 || value > 25) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vbitrate = "Not valid!. Valid Range : 1 ~ 25!";
                        }
                    } else if (data.outputs[i].bitrateenable == false) {
                        var value = parseInt(data.outputs[i].vquality);
                        if (value < 20 || value > 70) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vquality = "Not valid!, Valid Range : 20 ~ 70!";
                        }
                    }
                    if (Object.keys(outputsErr).length != 0) {
                        var tempName = "outputs[" + i + "]";
                        errorMsg[tempName] = outputsErr;
                    }
                }
            } else if (data.output_vcodec == "h265") {
                // profile
                if (hevcMap.profile.indexOf(data.output_profile) == -1) {
                    errorMsg.profile = data.output_profile + " is not supported!";
                }
                // level
                if (hevcMap.level.indexOf(data.output_level) == -1) {
                    errorMsg.level = data.output_level + " is not the proper level value for profile main";
                }
                // acodec
                if (hevcMap.acodec.indexOf(data.output_acodec) == -1) {
                    errorMsg.acodec = data.output_acodec + " is not the proper value!";
                }
                // abitrate
                if (hevcMap.abitrate.indexOf(data.output_abitrate) == -1) {
                    errorMsg.abitrate = data.output_abitrate + " is not the proper abitrate value!";
                }
                // format
                if (hevcMap.format.indexOf(fileextension) == -1) {
                    errorMsg.format = fileextension + " is not the proper format value";
                } else if (fileextension == 2 || fileextension == 3) {
                    errorMsg.format = fileextension + " is not supported";
                }
                for (var i = 0; i < data.outputs.length; i++) {
                    var outputsErr = {};
                    // resolutionid
                    if (hevcMap.outputs.resolutionid.indexOf(data.outputs[i].resolutionid) == -1) {
                        outputsErr.resolutionid = "Not valid!";
                    }
                    // framerate
                    if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                        outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                    }
                    // vbitrate & vquality
                    if (data.outputs[i].bitrateenable == true) {
                        var value = data.outputs[i].vbitrate.slice(0, data.outputs[i].vbitrate.length - 1);
                        value = parseInt(value);
                        if (value < 1 || value > 25) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vbitrate = "Not valid!. Valid Range : 1 ~ 25!";
                        }
                    } else if (data.outputs[i].bitrateenable == false) {
                        var value = parseInt(data.outputs[i].vquality);
                        if (value < 0 || value > 51) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vquality = "Not valid!, Valid Range : 0 ~ 51!";
                        }
                    }
                    if (Object.keys(outputsErr).length != 0) {
                        var tempName = "outputs[" + i + "]";
                        errorMsg[tempName] = outputsErr;
                    }
                }
            } else if (data.output_vcodec == "mpeg2") {
                // acodec
                if (mpeg2Map.acodec.indexOf(data.output_acodec) == -1) {
                    errorMsg.acodec = data.output_acodec + " is not the proper value!";
                }
                // abitrate
                if (mpeg2Map.abitrate.indexOf(data.output_abitrate) == -1) {
                    errorMsg.abitrate = data.output_abitrate + " is not the proper abitrate value!";
                }
                // format
                if (mpeg2Map.format.indexOf(fileextension) == -1) {
                    errorMsg.format = fileextension + " is not the proper format value";
                }
                // outputs
                for (var i = 0; i < data.outputs.length; i++) {
                    var outputsErr = {};
                    // resolutionid
                    if (mpeg2Map.outputs.resolutionid.indexOf(data.outputs[i].resolutionid) == -1) {
                        outputsErr.resolutionid = "Not valid!";
                    }
                    // framerate
                    if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                        outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                    }
                    // vbitrate & vquality
                    if (data.outputs[i].bitrateenable == true) {
                        var value = data.outputs[i].vbitrate.slice(0, data.outputs[i].vbitrate.length - 1);
                        value = parseInt(value);
                        if (value < 1 || value > 25) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vbitrate = "Not valid!. Valid Range : 1 ~ 25!";
                        }
                    } else if (data.outputs[i].bitrateenable == false) {
                        var value = parseInt(data.outputs[i].vquality);
                        if (value < 0 || value > 30) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vquality = "Not valid!, Valid Range : 0 ~ 30!";
                        }
                    }
                    if (Object.keys(outputsErr).length != 0) {
                        var tempName = "outputs[" + i + "]";
                        errorMsg[tempName] = outputsErr;
                    }
                }
            } else if (data.output_vcodec == "vp9") {
                for (var i = 0; i < data.outputs.length; i++) {
                    var outputsErr = {};
                    if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                        outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                    }
                    // vquality
                    var value = parseInt(data.outputs[i].vquality);
                    if (value < 0 || value > 255) {
                        var tempName = "outputs[" + i + "]";
                        outputsErr.vquality = "Not valid!, Valid Range : 0 ~ 255!";
                    }
                    if (Object.keys(outputsErr).length != 0) {
                        var tempName = "outputs[" + i + "]";
                        errorMsg[tempName] = outputsErr;
                    }
                }
            }
        } else {
            errorMsg.vcodec = data.output_vcodec + " not supported in vod!";
        }
    } else if (apiMethod == "file2stream" || apiMethod == "stream2stream") {
        if (transcodeMap.file2stream.indexOf(data.output_vcodec) > -1 || transcodeMap.stream2stream.indexOf(data.output_vcodec) > -1) {
            if (data.output_vcodec == "h264") {
                // profile
                if (h264Map.profile.indexOf(data.output_profile) == -1) {
                    errorMsg.profile = data.output_profile + " is not supported!";
                }
                // level
                if (data.output_profile == "main" && h264Map.level_main.indexOf(data.output_level) == -1) {
                    errorMsg.level = data.output_level + " is not the proper level value for profile main";
                } else if (data.output_profile == "high" && h264Map.level_high.indexOf(data.output_level) == -1) {
                    errorMsg.level = data.output_level + " is not the proper level value for profile high";
                }
                // acodec
                if (h264Map.acodec_stream.indexOf(data.output_acodec) == -1) {
                    errorMsg.acodec = data.output_acodec + " is not the proper value!";
                }
                // abitrate
                if (h264Map.abitrate.indexOf(data.output_abitrate) == -1) {
                    errorMsg.abitrate = data.output_abitrate + " is not the proper abitrate value!";
                }
                // protocol
                if (data.output_protocol > 3 || data.output_protocol < 0) {
                    errorMsg.protocol = "Not valid";
                }
                // outputs
                for (var i = 0; i < data.outputs.length; i++) {
                    var outputsErr = {};
                    // resolutionid
                    if (h264Map.outputs.resolutionid.indexOf(data.outputs[i].resolutionid) == -1) {
                        outputsErr.resolutionid = "Not valid!";
                    }
                    // framerate
                    if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                        outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                    }
                    // vbitrate & vquality
                    if (data.outputs[i].bitrateenable == true) {
                        var value = data.outputs[i].vbitrate.slice(0, data.outputs[i].vbitrate.length - 1);
                        value = parseInt(value);
                        if (value < 1 || value > 25) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vbitrate = "Not valid!. Valid Range : 1 ~ 25!";
                        }
                    } else if (data.outputs[i].bitrateenable == false) {
                        var value = parseInt(data.outputs[i].vquality);
                        if (value < 0 || value > 51) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vquality = "Not valid!, Valid Range : 0 ~ 51!";
                        }
                    }
                    if (Object.keys(outputsErr).length != 0) {
                        var tempName = "outputs[" + i + "]";
                        errorMsg[tempName] = outputsErr;
                    }
                }
            } else if (data.output_vcodec == "vp8") {
                // acodec
                if (vp8Map.acodec.indexOf(data.output_acodec) == -1) {
                    errorMsg.acodec = data.output_acodec + " is not the proper value!";
                }
                // outputs
                for (var i = 0; i < data.outputs.length; i++) {
                    var outputsErr = {};
                    // resolutionid
                    if (vp8Map.outputs.resolutionid.indexOf(data.outputs[i].resolutionid) == -1) {
                        outputsErr.resolutionid = "Not valid!";
                    }
                    // framerate
                    if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                        outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                    }
                    // vbitrate & vquality
                    if (data.outputs[i].bitrateenable == true) {
                        var value = data.outputs[i].vbitrate.slice(0, data.outputs[i].vbitrate.length - 1);
                        value = parseInt(value);
                        if (value < 1 || value > 25) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vbitrate = "Not valid!. Valid Range : 1 ~ 25!";
                        }
                    } else if (data.outputs[i].bitrateenable == false) {
                        var value = parseInt(data.outputs[i].vquality);
                        if (value < 20 || value > 70) {
                            var tempName = "outputs[" + i + "]";
                            outputsErr.vquality = "Not valid!, Valid Range : 20 ~ 70!";
                        }
                    }
                    if (Object.keys(outputsErr).length != 0) {
                        var tempName = "outputs[" + i + "]";
                        errorMsg[tempName] = outputsErr;
                    }
                }
            } else if (data.output_vcodec == "vp9") {
                if (apiMethod == "file2stream") {
                    for (var i = 0; i < data.outputs.length; i++) {
                        var outputsErr = {};
                        if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                            outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                        }
                        // vquality
                        var value = parseInt(data.outputs[i].vquality);
                        if (data.outputs[i].vquality == undefined || data.outputs[i].vquality == "") {
                            outputsErr.vquality = "vquality is mandatory field!";
                        } else if (value < 0 || value > 255) {
                            outputsErr.vquality = "Not valid!, Valid Range : 0 ~ 255!";
                        }
                        if (Object.keys(outputsErr).length != 0) {
                            var tempName = "outputs[" + i + "]";
                            errorMsg[tempName] = outputsErr;
                        }
                    }
                } else {
                    errorMsg.vcodec = data.output_vcodec + "is not support for stream to stream2streamm";
                }
            } else if (data.output_vcodec == "h265") {
                if (apiMethod == "file2stream") {
                    if (data.protocol == 1 || data.protocol == 2) {
                        // profile
                        if (hevcMap.profile.indexOf(data.output_profile) == -1) {
                            errorMsg.profile = data.output_profile + " is not supported!";
                        }
                        // level
                        if (hevcMap.level.indexOf(data.output_level) == -1) {
                            errorMsg.level = data.output_level + " is not the proper level value for profile main";
                        }
                        // acodec
                        if (data.output_acodec != "mp3") {
                            errorMsg.acodec = data.output_acodec + " is not the proper value!";
                        }
                        // abitrate
                        if (hevcMap.abitrate.indexOf(data.output_abitrate) == -1) {
                            errorMsg.abitrate = data.output_abitrate + " is not the proper abitrate value!";
                        }
                        // protocol
                        if (data.protocol != 1 && data.protocol != 2) {
                            outputsErr.protocol = "H.265 is not support RTMP!";
                        }
                        // outputs
                        for (var i = 0; i < data.outputs.length; i++) {
                            var outputsErr = {};
                            // resolutionid
                            if (hevcMap.outputs.resolutionid.indexOf(data.outputs[i].resolutionid) == -1) {
                                outputsErr.resolutionid = "Not valid!";
                            }
                            // framerate
                            if (data.outputs[i].framerate < 24 || data.outputs[i].framerate > 60) {
                                outputsErr.framerate = "Not valid! Valid range : 24 ~ 60";
                            }
                            // vbitrate & vquality
                            if (data.outputs[i].bitrateenable == true) {
                                var value = data.outputs[i].vbitrate.slice(0, data.outputs[i].vbitrate.length - 1);
                                value = parseInt(value);
                                if (value < 1 || value > 25) {
                                    var tempName = "outputs[" + i + "]";
                                    outputsErr.vbitrate = "Not valid!. Valid Range : 1 ~ 25!";
                                }
                            } else if (data.outputs[i].bitrateenable == false) {
                                var value = parseInt(data.outputs[i].vquality);
                                if (value < 0 || value > 51) {
                                    var tempName = "outputs[" + i + "]";
                                    outputsErr.vquality = "Not valid!, Valid Range : 0 ~ 51!";
                                }
                            }
                            if (Object.keys(outputsErr).length != 0) {
                                var tempName = "outputs[" + i + "]";
                                errorMsg[tempName] = outputsErr;
                            }
                        }
                    } else {
                        errorMsg.vcodec = data.output_vcodec + " is not support protocol RTMP";
                    }
                } else {
                    errorMsg.vcodec = data.output_vcodec + " is not support for stream to stream2streamm";
                }
            }
        } else {
            errorMsg.vcodec = data.output_vcodec + " not supported!";
        }
    }
    // Build the return value
    if (Object.keys(errorMsg).length != 0) {
        errorMsg.message = "fail";
        return errorMsg;
    } else {
        return {
            message: "success"
        };
    }
}

module.exports = formatValidation;
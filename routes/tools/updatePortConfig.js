const readline = require('readline');
const fs = require('fs');
var exec = require('child_process').exec;
var cardMap = require('../../config/cardMap');
var config = require('../../config/config');
var getUsedPorts = require('./getUsedPorts');

function updatePortConfig(reqBody) {
    return Promise.resolve(constructUsedPortMap())
        .then(function(usedPortMap) {
            return new Promise(function(resolve, reject) {
                var content = fs.readFileSync(config.routeMapPath, "utf8").split(/\r?\n/);
                var obj = {
                    content: content,
                    body: reqBody,
                    usedPortMap: usedPortMap
                }
                resolve(obj);
            })
        })
        .then(function(dataObj) {
            var data = dataObj.content;
            return new Promise(function(resolve, reject) {
                var message = [];
                for (var i = 0; i < data.length; i++) {
                    var row = data[i].split(' ');
                    var result = null;
                    if (row.indexOf("--dport") != -1 && row.indexOf('--to-destination') != -1) {
                        result = checkAndUpdatePort(reqBody, row, dataObj.usedPortMap);
                        if (result != undefined) {
                            if (result.hit == true && result.message == "") {
                                data[i] = result.row.join(' ');
                            } else if (result.message != "") {
                                message.push(result.message);
                            }
                        }
                    }
                }
                if (message.length == 0) {
                    writeToFile(data);
                    writeToObject(dataObj.body);
                    resolve({
                        success: true
                    });
                } else {
                    resolve({
                        success: false,
                        message: message
                    });
                }
            });
        })
        .catch(function(err) {
            if (err) {
                console.log(err);
            }
        });
}

function checkAndUpdatePort(reqBody, row, usedPortMap) {
    var targetIP = cardMap[reqBody.cardid].cpu(reqBody.cpuid).getIPAddr();
    var outwardPort = row[row.indexOf('--dport') + 1];
    var inwardPort = row[row.indexOf('--to-destination') + 1].split(":")[1];
    var cpuip = row[row.indexOf('--to-destination') + 1].split(":")[0];
    var msg = "";
    var hit = false;

    if (targetIP == cpuip) {
        switch (Number.parseInt(inwardPort)) {
            case config.cardPorts.rtmp:
                if (reqBody.rtmpPort != null && reqBody.rtmpPort != "") {
                    if (usedPortMap.indexOf(reqBody.rtmpPort) == -1) {
                        row[row.indexOf('--dport') + 1] = reqBody.rtmpPort;
                        hit = true;
                    } else {
                        msg = "Selected RTMP Port is taken";
                    }
                }
                break;
            case config.cardPorts.http:
                if (reqBody.httpPort != null && reqBody.httpPort != "") {
                    if (usedPortMap.indexOf(reqBody.httpPort) == -1) {
                        row[row.indexOf('--dport') + 1] = reqBody.httpPort;
                        hit = true;
                    } else {
                        msg = "Selected HTTP Port is taken";
                    }
                }
                break;
            case config.cardPorts.qts:
                if (reqBody.qtsPort != null && reqBody.qtsPort != "") {
                    if (usedPortMap.indexOf(reqBody.qtsPort) == -1) {
                        row[row.indexOf('--dport') + 1] = reqBody.qtsPort;
                        hit = true;
                    } else {
                        msg = "Selected QTS Port is taken";
                    }
                }
                break;
            case config.cardPorts.icecast:
                if (reqBody.icecastPort != null && reqBody.icecastPort != "") {
                    if (usedPortMap.indexOf(reqBody.icecastPort) == -1) {
                        row[row.indexOf('--dport') + 1] = reqBody.icecastPort;
                        hit = true;
                    } else {
                        msg = "Selected Icecast Port is taken";
                    }
                }
                break;
            default:
                break;
        }
        return {
            message: msg,
            row: row,
            hit: hit
        };
    }
}

function constructUsedPortMap() {
    return Promise.resolve(getUsedPorts())
        .then(function(usedPorts) {
            var portMap = {
                rtmpPortArray: [],
                httpPortArray: [],
                icecastPortArray: [],
                qtsPortArray: []
            }

            for (var key in cardMap) {
                for (var i = 0; i < 2; i++) {
                    portMap.rtmpPortArray.push(cardMap[key].cpu("CPUID" + (i + 1)).getRtmpPort());
                    portMap.httpPortArray.push(cardMap[key].cpu("CPUID" + (i + 1)).getHttpPort());
                    portMap.icecastPortArray.push(cardMap[key].cpu("CPUID" + (i + 1)).getIcecastPort());
                    portMap.qtsPortArray.push(cardMap[key].cpu("CPUID" + (i + 1)).getQtsPort());
                }
            }
            return portMap.rtmpPortArray.concat(portMap.httpPortArray).concat(portMap.icecastPortArray).concat(portMap.qtsPortArray).concat(usedPorts);
        })
}

function writeToFile(data) {
    new Promise(function(resolve, reject) {
            var file = fs.createWriteStream(config.routeMapPath);
            file.on('error', function(err) {
                console.log(err);
            });

            for (var i = 0; i < data.length; i++) {
                if (i != data.length - 1) {
                    file.write(data[i] + "\n");
                } else {
                    file.write(data[i]);
                }
            }
            file.end();
            file.on('close', function(err) {
                resolve({
                    Message: "Success"
                });
            });
        })
        .then(function(data) {
            exec("bash " + config.routeMapPath, function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function writeToObject(reqBody) {
    if (reqBody.rtmpPort != null && reqBody.rtmpPort != "") {
        cardMap[reqBody.cardid].cpu(reqBody.cpuid).setRtmpPort(reqBody.rtmpPort);
    }
    if (reqBody.httpPort != null && reqBody.httpPort != "") {
        cardMap[reqBody.cardid].cpu(reqBody.cpuid).setHttpPort(reqBody.httpPort);
    }
    if (reqBody.qtsPort != null && reqBody.qtsPort != "") {
        cardMap[reqBody.cardid].cpu(reqBody.cpuid).setQtsPort(reqBody.qtsPort);
    }
    if (reqBody.icecastPort != null && reqBody.icecastPort != "") {
        cardMap[reqBody.cardid].cpu(reqBody.cpuid).setIcecastPort(reqBody.icecastPort);
    }
}

module.exports = updatePortConfig;
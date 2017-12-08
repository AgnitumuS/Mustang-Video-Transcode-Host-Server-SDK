// netsh interface portproxy add v4tov4 listenport=8081 listenaddress=10.10.70.46 connectport=8080 connectaddress=192.168.137.2
// netsh interface portproxy add v4tov4 listenport=8082 listenaddress=10.10.70.46 connectport=8080 connectaddress=192.168.137.3
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var config = require('../config/config');

function buildRoutebat (ipArray, externalIP) {
    var homePath = path.dirname(__dirname);
    var qtsPort = config.cardPorts.qts;
    var rtmpPort = config.cardPorts.rtmp;
    var icecastPort = config.cardPorts.icecast;
    var httpPort = config.cardPorts.http;
    var result = [];
    for (var i = 0; i < ipArray.length; i++) {
        curQtsPort = qtsPort + i;
        curRtmpPort = rtmpPort + i;
        curIcecastPort = icecastPort + i;
        curHttpPort = httpPort + i;
        var content = [
            "netsh interface portproxy add v4tov4 listenport=" + curQtsPort + " listenaddress=" + externalIP + " connectport=" + qtsPort + " connectaddress=" + ipArray[i],
            "netsh interface portproxy add v4tov4 listenport=" + curRtmpPort + " listenaddress=" + externalIP + " connectport=" + rtmpPort + " connectaddress=" + ipArray[i],
            "netsh interface portproxy add v4tov4 listenport=" + curIcecastPort + " listenaddress=" + externalIP + " connectport=" + icecastPort + " connectaddress=" + ipArray[i],
            "netsh interface portproxy add v4tov4 listenport=" + curHttpPort + " listenaddress=" + externalIP + " connectport=" + httpPort + " connectaddress=" + ipArray[i],
            ""
        ];
        result = result.concat(content);
    }
    writeToFile(result);
}

function writeToFile(data) {
    new Promise(function(resolve, reject) {
            var file = fs.createWriteStream(config.routeMapWindowsPath);
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
            exec("cmd.exe " + config.routeMapWindowsPath, function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = buildRoutebat;
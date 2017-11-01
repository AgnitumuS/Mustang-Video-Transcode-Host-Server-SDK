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
var Faye = require('faye');
var sqlite3 = require('sqlite3').verbose();
var db = require('../db/dbSqlite').sqliteDB;
var tools = require('../routes/tools/toolsIdx');
var config = require('../config/config');
var cardMap = require('../config/cardMap');
var unmountPath = require('../routes/tools/toolsIdx').unmountPath;
var mountRequest = require('./mountRequest');

var runfaye = function(cards) {
    for (var i = 0; i < cards.length; i++) {
        var cardid = cards[i];
        var arrayIP = cardMap[cardid].getAllIPAddr();
        for (var j = 0; j < arrayIP.length; j++) {
            var fayePort = cardMap[cardid].cpuIdx(j + 1).getFayePort();
            var targetURL = "http://" + arrayIP[j] + ":" + fayePort + "/faye";
            var cpuid = "CPUID" + (j + 1);
            faye(targetURL, arrayIP[j], cardid, cpuid);
        }
    }
}

var faye = function(targetURL, hostIP, cardid, cpuid) {
    // Create client
    var client = new Faye.Client(targetURL, {
        timeout: 1
    });
    client.disable('websocket');

    client.subscribe('/logmsg/*').withChannel(function(channel, message) {
        // console.log("In process~~~~~~~");
        // console.log("URL: " + targetURL);
        // console.log("Message:");
        // console.log(message);
        // console.log('Received in Process: ' + message.text);

        var jobID = channel.replace("/logmsg/", "");
        var msg = message.text;
        msg = msg.split('\n');
        if (msg[0] == "New:libva info: VA-API version 0.39.4") {
            msg = msg.slice(5, msg.length).join('').split("'").join("");
        } else if (msg[0] == "New:error: XDG_RUNTIME_DIR not set in the environment.") {
            msg = "";
        } else {
            msg = message.text;
        }
        // This is to take warning away from transcode to mpeg while file to file
        if (msg.indexOf("buffer underflow") != -1) {
            msg = "";
        }
        db.run("UPDATE jobs SET errorlog = '" + msg + "' WHERE jobid = " + jobID);
        if (msg != "") {
            db.serialize(function() {
                db.run("BEGIN TRANSACTION");
                db.run("UPDATE jobs SET " +
                    "endtime = " + "'" + tools.generateTimeStamp() + "', " +
                    "error = 1," +
                    "status = '3'," +
                    "statusmessage = 'Failed'" +
                    " WHERE jobid = " + jobID);
                db.run("COMMIT TRANSACTION");
            });
        }
    });

    client.subscribe('/deletemsg/*').withChannel(function(channel, message) {
        // console.log("In on Completed~~~~~");
        // console.log("URL: " + targetURL);
        // console.log("Message:");
        // console.log(message);
        // console.log('Received in on Completed: ' + message.text);

        var jobID = channel.replace("/deletemsg/", "");
        var msg = message.text;

        if (message.text != undefined) {
            db.get("SELECT * from jobs WHERE jobid = " + jobID, function(err, jobRow) {
                if (jobRow !== undefined) {
                    unmountPath(jobRow.input_filepath);
                    if (jobRow.endtime == "" && jobRow.status == 1) {
                        db.serialize(function() {
                            db.run("UPDATE jobs SET " +
                                "endtime = " + "'" + tools.generateTimeStamp() + "', " +
                                "status = '2'," +
                                "statusmessage = 'Completed'" +
                                " WHERE jobid = " + jobID);
                        });
                    }
                }
            });
        }
    });

    client.subscribe('/notification/init').withChannel(function(channel, message) {
        mountRequest.mountOneCard(targetURL, hostIP, cardid, cpuid);
        publishMessage(targetURL, "/notification/initAckClose", "Remounted");
    });
}

function publishMessage(targetURL, topic, msg) {
    var client = new Faye.Client(targetURL, {
        timeout: 1
    });
    client.disable('websocket');
    var publication = client.publish(topic, {
        text: msg
    }, {
        deadline: 0.1
    });

    publication.then(function() {
        client.disconnect();
    }, function(error) {
        console.error('There was a problem: ' + error.message);
        throw error;
    });
};

module.exports = runfaye;
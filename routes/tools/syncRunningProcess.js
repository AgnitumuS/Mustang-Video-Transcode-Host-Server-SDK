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
var request = require('request');
var cardMap = require('../../config/cardMap');
var db = require('../../db/dbSqlite').sqliteDB;
var cpuJobInfoOneCard = require('../cpujobinfo').cpuJobInfoOneCard;
var unmountPath = require('./unmountPath');
var generateTimeStamp = require('./generateTimeStamp');
var getJobByStatus = require('./getJobByStatus');

function runInterval() {
    setInterval(function() {
        syncRunningProcess();
    }, 10 * 60 * 1000);
}

function syncRunningProcess() {
    return Promise.all([getJobByStatus("1"), getCPUjobinfo()])
        .then(function(allData) {
            var jobArray = allData[0];
            var cpujobinfo = allData[1];
            return new Promise(function(resolve, reject) {
                var i = jobArray.length;
                while (i--) {
                    var result = checkJobExist(cpujobinfo, jobArray[i].jobId);
                    if (result == false) {
                        jobArray.splice(i, 1);
                    }
                }
                resolve(jobArray);
            });
        })
        .catch(function(err) {
            if (err) {
                console.log(err);
            }
        })
}

function getCPUjobinfo() {
    var cards = Object.keys(cardMap);
    if (cards == undefined || cards.length == 0) {
        return;
    } else {
        var promiseArr = [];
        for (var i = 0; i < cards.length; i++) {
            promiseArr.push(Promise.resolve(cpuJobInfoOneCard(cards[i])));
        }

        return Promise.all(promiseArr)
            .then(function(allData) {
                return new Promise(function(resolve, reject) {
                    resolve(allData);
                })
            })
            .catch(function(err) {
                console.log(err);
            });
    }
}

function checkJobExist(array, jobid) {
    if (array == undefined || jobid == undefined) {
        return false;
    }
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].cpujobinfo.length; j++) {
            for (var k = 0; k < array[i].cpujobinfo[j].jobs.length; k++) {
                if (array[i].cpujobinfo[j].jobs[k].jobId == jobid) {
                    return true;
                }
            }
        }
    }
    changeJobStatus(jobid);
    return false;
}

function changeJobStatus(jobid) {
    db.get("SELECT * from jobs WHERE jobid = " + jobid, function(err, jobRow) {
        if (jobRow !== undefined) {
            unmountPath(jobRow.input_filepath);
            if (jobRow.endtime == "" && jobRow.status == 1) {
                db.serialize(function() {
                    db.run("UPDATE jobs SET " +
                        "endtime = " + "'" + generateTimeStamp() + "', " +
                        "status = '2'," +
                        "statusmessage = 'Completed'" +
                        " WHERE jobid = " + jobid);
                });
            }
        }
    });
}

runInterval();

module.exports = syncRunningProcess;
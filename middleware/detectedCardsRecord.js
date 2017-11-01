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
var db = require('../db/dbSqlite').sqliteDB;
var config = require('../config/config');

function readFromDB() {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.run("CREATE TABLE IF NOT EXISTS detectedCards (" + 
                "led TEXT," +
                "cpu1ipConnceted INTEGER," +
                "cpu1apiConnected INTEGER," +
                "cpu1ipAddr TEXT," +
                "cpu1ipUpdated INTEGER," +
                "cpu1macAddr TEXT," +
                "cpu2ipConnceted INTEGER," +
                "cpu2apiConnected INTEGER," +
                "cpu2ipAddr TEXT," +
                "cpu2ipUpdated INTEGER," +
                "cpu2macAddr TEXT)");

            db.all("SELECT * from detectedCards", function(err, cards) {
                if (cards !== undefined) {
                    var detectedCards = {}
                    for (var i = 0; i < cards.length; i++) {
                        var obj = {
                            cpu1 : {
                                ipConnected : translateIntegerToBoolean(cards[i].cpu1ipConnceted),
                                apiConnected : false,
                                ipAddr : cards[i].cpu1ipAddr,
                                ipUpdated : translateIntegerToBoolean(cards[i].cpu1ipUpdated),
                                macAddr : cards[i].cpu1macAddr
                            },
                            cpu2 : {
                                ipConnected : translateIntegerToBoolean(cards[i].cpu2ipConnceted),
                                apiConnected : false,
                                ipAddr : cards[i].cpu2ipAddr,
                                ipUpdated : translateIntegerToBoolean(cards[i].cpu2ipUpdated),
                                macAddr : cards[i].cpu2macAddr
                            }
                        }
                        detectedCards[cards[i].led] = obj;
                    }
                    config.detectedCards = detectedCards;
                    resolve(detectedCards);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

function wirteToDB() {
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS detectedCards (" + 
            "led TEXT," +
            "cpu1ipConnceted INTEGER," +
            "cpu1apiConnected INTEGER," +
            "cpu1ipAddr TEXT," +
            "cpu1ipUpdated INTEGER," +
            "cpu1macAddr TEXT," +
            "cpu2ipConnceted INTEGER," +
            "cpu2apiConnected INTEGER," +
            "cpu2ipAddr TEXT," +
            "cpu2ipUpdated INTEGER," +
            "cpu2macAddr TEXT)");

        var detectedCards = config.detectedCards;
        for (var key in detectedCards) {
            checkUpdateOrWrite(key, detectedCards[key]);
        }      
    });
}

function checkUpdateOrWrite(key, card) {
    return new Promise(function(resolve, reject) {
        db.get("SELECT * from detectedCards WHERE led = " + key, function(err, jobRow) {
            if (jobRow == undefined) {
                resolve("write");
            } else {
                resolve("update");
            }
        });
    })
    .then(function(action) {
        if (action == "write") {
            return new Promise(function(resolve, reject) {
                db.serialize(function() {
                    var stmt = db.prepare("INSERT INTO detectedCards VALUES ( ?, ?, ?, ?, ?," + 
                                                                            "?, ?, ?, ?, ?," +
                                                                            "?)");
                    stmt.run([
                        key,
                        card.cpu1.ipConnected,
                        card.cpu1.apiConnected,
                        card.cpu1.ipAddr,
                        card.cpu1.ipUpdated,
                        card.cpu1.macAddr,
                        card.cpu2.ipConnected,
                        card.cpu2.apiConnected,
                        card.cpu2.ipAddr,
                        card.cpu2.ipUpdated,
                        card.cpu2.macAddr
                    ]);
                    stmt.finalize();
                });
            })
            .catch(function(err) {
                console.log(err);
            });           
        } else if (action == "update") {
            db.serialize(function() {
                db.run("BEGIN TRANSACTION");
                db.run("UPDATE detectedCards SET " + 
                            "cpu1ipConnceted = " + translateBooleanToInteger(card.cpu1.ipConnected) + ", " +
                            "cpu1apiConnected = " + translateBooleanToInteger(card.cpu1.apiConnected) + ", " +
                            "cpu1ipAddr = " + "'" + card.cpu1.ipAddr + "', " +
                            "cpu1ipUpdated = " + translateBooleanToInteger(card.cpu1.ipUpdated) + ", " +
                            "cpu1macAddr = " + "'" + card.cpu1.macAddr + "', " +
                            "cpu2ipConnceted = " + translateBooleanToInteger(card.cpu2.ipConnected) + ", " +
                            "cpu2apiConnected = " + translateBooleanToInteger(card.cpu2.apiConnected) + ", " +
                            "cpu2ipAddr = " + "'" + card.cpu2.ipAddr + "', " +
                            "cpu2ipUpdated = " + translateBooleanToInteger(card.cpu2.ipUpdated) + ", " +
                            "cpu2macAddr = " + "'" + card.cpu2.macAddr + "'" +
                            " WHERE led = " + key);
                db.run("COMMIT TRANSACTION");
            });
        }
    })
    .catch(function(err) {
        console.log(err);
    });
}

function translateBooleanToInteger(input) {
    return input == true ? 1 : 0;
}

function translateIntegerToBoolean(input) {
    return input == true;
}

function resetRecord() {
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS detectedCards (" + 
            "led TEXT," +
            "cpu1ipConnceted INTEGER," +
            "cpu1apiConnected INTEGER," +
            "cpu1ipAddr TEXT," +
            "cpu1ipUpdated INTEGER," +
            "cpu1macAddr TEXT," +
            "cpu2ipConnceted INTEGER," +
            "cpu2apiConnected INTEGER," +
            "cpu2ipAddr TEXT," +
            "cpu2ipUpdated INTEGER," +
            "cpu2macAddr TEXT)");
        db.run("DELETE FROM detectedCards");
    });
}

module.exports = {
    readFromDB : readFromDB,
    wirteToDB : wirteToDB,
    resetRecord : resetRecord
};
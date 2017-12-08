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
var express = require('express');
var windowsipsAPI = express.Router();
var db = require('../db/dbSqlite').sqliteDB;
var startupWindows = require('../installation/startupWindows');

windowsipsAPI.route('/')
    .get(function(req, res) {
        db.serialize(function() {
            db.run("CREATE TABLE IF NOT EXISTS windowsips (windowsip TEXT)");
            db.all("SELECT * from windowsips", function(err, rows) {
                res.json(rows);
            });
        });
    })
    .post(function(req, res) {
        var needReload = false;
        new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.run("CREATE TABLE IF NOT EXISTS windowsips (windowsip TEXT)");
                db.all("SELECT * from windowsips", function(err, rows) {
                    var result = [];
                    for (var i = 0; i < rows.length; i++) {
                        result.push(rows[i].windowsip);
                    }
                    resolve(result);
                });
            });
        })
        .then(function(ipArray) {
            db.serialize(function() {
                var stmt = db.prepare("INSERT INTO windowsips VALUES (?)");
                for (var i = 0; i < req.body.windowsips.length; i++) {
                    if (ipArray.indexOf(req.body.windowsips[i]) == -1) {
                        needReload = true;
                        stmt.run([req.body.windowsips[i]]);
                    }
                }
                stmt.finalize();
            });
            startupWindows();
            var result = {
                success : true,
                message : "New IPs Added"
            }
            res.json(result);
        })
        .catch(function(err) {
            console.log(err);
            res.json(err);
        });
    })
    .put(function(req, res) {
        return new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.run("CREATE TABLE IF NOT EXISTS windowsips (windowsip TEXT)");
                db.all("SELECT * from windowsips", function(err, rows) {
                    var result = [];
                    for (var i = 0; i < rows.length; i++) {
                        result.push(rows[i].windowsip);
                    }
                    resolve(result);
                });
            });
        })
        .then(function(result) {
            if (result.indexOf(req.body.oldIP) == -1) {
                res.json({message : req.body.oldIP + " is not in the record."});
            } else {
                if (req.body.oldIP == undefined || req.body.oldIP == "" 
                    || req.body.newIP == undefined || req.body.newIP == "") {
                    res.json({message : "Please provide required information!"});
                } else if (!validateIPaddress(req.body.oldIP) || !validateIPaddress(req.body.newIP)) {
                    res.json({message : "Please enter correct format of IP."});
                } else {
                     db.serialize(function() {
                        db.run("UPDATE windowsips SET windowsip = '" + req.body.newIP + "' WHERE windowsip = '" + req.body.oldIP + "'");
                    });
                    res.json({message : req.body.oldIP + " is updated to " + req.body.newIP});
                }
            }
            startupWindows();
        })
        .catch(function(err) {
            console.log(err);
            res.json(err);
        });
    });

windowsipsAPI.route('/:inputIP')
    .delete(function(req, res) {
        db.serialize(function() {
            db.run("CREATE TABLE IF NOT EXISTS windowsips (windowsip TEXT)");
            db.run("DELETE FROM windowsips WHERE windowsip = " + req.params.inputIP);
        });
        res.json({message : req.params.inputIP + " is deleted"});
    });

function validateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
        return true;
    }
    return false;
}

module.exports = windowsipsAPI;
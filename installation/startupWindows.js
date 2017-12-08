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
var queryingWindowsCards = require('../middleware/queryingWindowsCards');
var getExternalIP = require('../middleware/getExternalIP');
var buildRouteBat = require('../middleware/buildRouteBat');

function startupWindows(initStart) {
    return new Promise(function(resolve, reject) {
        db.serialize(function() {
            db.run("CREATE TABLE IF NOT EXISTS windowsips (windowsip TEXT)");
            db.all("SELECT * from windowsips", function(err, rows) {
                resolve(rows);
            });
        });
    })
    .then(function(ips) {
        return new Promise(function(resolve, reject) {
            console.log("Existing IPs");
            var ipArray = [];
            for (var i = 0; i < ips.length; i++) {
                console.log((i + 1) + '. ' + ips[i].windowsip);
                ipArray.push(ips[i].windowsip);
            }
            queryingWindowsCards(ipArray, true);
            callBuildRouteBat(ipArray);
            resolve({message : "MVT Server is starting up"});
        });
    })
    .catch(function(err) {
        console.log(err);
    });
}

function callBuildRouteBat(ipArray) {
    Promise.resolve(getExternalIP())
        .then(function(externalIP) {
            buildRouteBat(ipArray, externalIP.address);
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = startupWindows;
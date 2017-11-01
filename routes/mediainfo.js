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
var mediainfoAPI = express.Router();
var exec = require('child_process').exec;
var fs = require('fs');

mediainfoAPI.route('/')
    .post(function(req, res) {
        // req.body.path
        // req.body.filename
        var promise = new Promise(function(resolve, reject) {
            fs.readdir(req.body.path, function(err, filenames) {
                if (err) {
                    console.log(err);
                    return;
                }
                for (var i = 0; i < filenames.length; i++) {
                    if (filenames[i] == req.body.filename) {
                        resolve({
                            success: true
                        });
                    }
                }
                resolve({
                    success: false
                });
            });
        });

        promise.then(function(result) {
            if (result.success == false) {
                res.json({
                    Message: "No such file in the directory! Please check again!"
                });
            } else {
                var cmd = "mediainfo '" + req.body.path + "/" + req.body.filename + "'";
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return;
                    }
                    var data = `${stdout}`;
                    data = data.split("\n");
                    var obj = {};
                    var currentKey = "";
                    for (var i = 0; i < data.length; i++) {
                        var line = data[i].split(':');
                        if (line.length == 1 && line[0] != '') {;
                            currentKey = line[0];
                            obj[currentKey] = {};
                        } else if (line.length == 2) {
                            obj[currentKey][line[0].trim()] = line[1].trim();
                        }
                    }
                    res.json(obj);
                });
            }
        });
    });

module.exports = mediainfoAPI;
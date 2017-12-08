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
var listDirAPI = express.Router();
var fs = require('fs');
var path = require('path');
var os = require('os');
var exec = require('child_process').exec;
var sortFileName = require('./tools/toolsIdx').sortFileName;

listDirAPI.route('/')
    .get(function(req, res) {
        var dirPath = req.query.path[req.query.path.length - 1] == "/" ? req.query.path : req.query.path + "/";
        var videoExtension = [".mkv", ".mp4", ".flv", ".f4v", ".avi", ".webm", ".mpeg", ".mov", ".mpg", ".ms", ".mts"];
        fs.readdir(dirPath, function(err, array) {
            if (err) {
                console.log(err);
                res.json(err);
            }
            if (array == undefined) {
                res.json(undefined);
            } else {
                var promiseArr = [];
                for (var i = 0; i < array.length; i++) {
                    if (array[i][0] != ".") {
                        promiseArr.push(Promise.resolve(checkPathType(dirPath + array[i], array[i])));
                    }
                }
                Promise.all(promiseArr)
                    .then(function(allData) {
                        var directoryArray = [];
                        var videoArray = [];
                        for (var i = 0; i < allData.length; i++) {
                            if (allData[i] == undefined) {
                                continue;
                            } else if (allData[i].type === "directory") {
                                directoryArray.push(allData[i]);
                            } else if (allData[i].type === "file") {
                                if (videoExtension.indexOf(path.extname(allData[i].name).toLowerCase()) != -1) {
                                    videoArray.push(allData[i]);
                                }
                            }
                        }
                        res.json(sortFileName(directoryArray).concat(sortFileName(videoArray)));
                    })
                    .catch(function(err) {
                        console.log(err);
                        res.json("ERROR: " + err);
                    });
            }
        });
    });

listDirAPI.route('/partitions')
  .get(function(req, res) {
      return new Promise(function(resolve, reject) {
          var proc = exec("wmic logicaldisk get name\n", function(error, stdout) {
              if (error !== null) {
                  console.log('exec error: ' + error);
              }
              if (stdout == undefined) {
                resolve(undefined);
              } else {
                var reg = /\r\n|\n\r|\n|\r/g;
                data = stdout.replace(reg, "\n").split("\n");
                resolve(data);
              }
          });
      })
      .then(function(data) {
        var result = [];
        for (var i = 0; i < data.length; i++) {
          var element = data[i].trim();
          if (element.toLowerCase() != "name" && element != "") {
            result.push(element);
          }
        }
        res.json(result);
      })
      .catch(function(err) {
        console.log(err);
      });
  });

function checkPathType(inputPath, name) {
    return new Promise(function(resolve, reject) {
        fs.stat(inputPath, function(err, stats) {
            if (stats == undefined) {
                resolve(undefined);
            } else if (stats.isDirectory()) {
                var obj = {
                    type: "directory",
                    name: name
                }
                resolve(obj);
            } else if (stats.isFile()) {
                var obj = {
                    type: "file",
                    name: name
                }
                resolve(obj);
            }
            resolve(undefined);
        });
    });
}

module.exports = listDirAPI;

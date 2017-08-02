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

var fs = require('fs');
var path = require('path');
var config = require('../../config/config');
const exec = require('child_process').exec;
var db = require('../../db/dbSqlite').sqliteDB;

function mountPath(inputPath, apiMethod, callback) {
    if (!fs.existsSync(config.hostMountedDir + "/output")) {
        fs.mkdir(config.hostMountedDir + "/output", function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
    return new Promise(function(resolve, reject) {
        db.run("CREATE TABLE IF NOT EXISTS mountTable (sourceDirPath TEXT, mountedFolder TEXT)");
        var sourceDirPath = path.dirname(inputPath);
        if (sourceDirPath != config.hostMountedDir) {
            var mountCandidate = path.basename(sourceDirPath) + "_temp0";
            var filename = path.basename(inputPath);
            var targetPath = "";

            db.serialize(function() {
                db.get("SELECT * from mountTable WHERE sourceDirPath = '" + sourceDirPath + "'", function(err, data) {
                    if (data == undefined) {
                        db.get("SELECT * from mountTable WHERE mountedFolder = '" + mountCandidate + "'", function(err, dataRow) {
                            if (dataRow == undefined) {
                                targetPath = config.hostMountedDir + "/" + mountCandidate;
                            } else {
                                var temp = dataRow.mountedFolder.split("_temp");
                                mountCandidate = temp[0] + "_temp" + (Number.parseInt(temp[1]) + 1);
                                targetPath = config.hostMountedDir + "/" + mountCandidate;
                            }
                            insertRecord(sourceDirPath, mountCandidate);
                            if (!fs.existsSync(config.hostMountedDir + "/" + mountCandidate)) {
                                fs.mkdir(config.hostMountedDir + "/" + mountCandidate, function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                exec("mount -o bind " + sourceDirPath + " " + targetPath, (err, stdout, stderr) => {
                                    if (err) {
                                        console.error(err);
                                    }
                                    console.log(stdout);
                                });

                                if (apiMethod == "file2file" && !fs.existsSync(sourceDirPath + "/output")) {
                                    createOutput(sourceDirPath);
                                }
                            } else if (apiMethod == "file2file" && !fs.existsSync(sourceDirPath + "/output")) {
                                createOutput(sourceDirPath);
                            }
                        	resolve(config.hostMountedDir + "/" + mountCandidate + "/" + filename);
                        });
                    } else {
                        if (!fs.existsSync(config.hostMountedDir + "/" + data.mountedFolder)) {
                        	targetPath = config.hostMountedDir + "/" + data.mountedFolder;
							fs.mkdir(config.hostMountedDir + "/" + data.mountedFolder, function(err) {
							    if (err) {
							        console.log(err);
							    }
							});
							exec("mount -o bind " + sourceDirPath + " " + targetPath, (err, stdout, stderr) => {
							    if (err) {
							        console.error(err);
							    }
							    console.log(stdout);
							});

							if (apiMethod == "file2file" && !fs.existsSync(sourceDirPath + "/output")) {
							    createOutput(sourceDirPath);
							}
							resolve(config.hostMountedDir + "/" + data.mountedFolder + "/" + filename);
                        } else {
                        	resolve(config.hostMountedDir + "/" + data.mountedFolder + "/" + filename);
                        }
                    }
                });
            });
        } else {
        	resolve(inputPath);
        }
    });
}

function insertRecord(sourceDirPath, mountedFolder) {
    db.serialize(function() {
        var stmt = db.prepare("INSERT INTO mountTable VALUES (?, ?)");
        stmt.run([
            sourceDirPath,
            mountedFolder
        ]);
        stmt.finalize();
    });
}

function createOutput(sourceDirPath) {
    fs.mkdir(sourceDirPath + "/output", function(err) {
        if (err) {
            console.log(err);
        }
        exec("chmod 777 -R " + sourceDirPath + "/output", (err, stdout, stderr) => {
            if (err) {
                console.error(err);
            }
            console.log(stdout);
        });
    });
}

module.exports = mountPath;
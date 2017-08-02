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

function unmountPath(inputPath) {
    var sourceDirPath = path.dirname(inputPath);
	db.serialize(function() {
		db.get("SELECT * from mountTable WHERE sourceDirPath = '" + sourceDirPath + "'", function(err, data) {
			if (data != undefined && sourceDirPath != config.hostMountedDir) {
				try {
			        var mountCandidate = data.mountedFolder;
			        var targetPath = config.hostMountedDir + "/" + mountCandidate;
			        if (fs.existsSync(targetPath)) {
			            var cmd = "umount " + targetPath;
			            exec(cmd, (err, stdout, stderr) => {
			                if (err) {
			                    // console.error(err);
			                }
			                removeDorectory(targetPath)
			                if (!fs.existsSync(targetPath)) {
								db.run("DELETE from mountTable WHERE sourceDirPath = '" + sourceDirPath + "'", function(err, data) {
									if (err) {
										// console.log(err);
									}
								});
			                }
			            });
			        }
				} catch(err) {
					// console.log(err);
				};
			}
		});
	});
}

function removeDorectory(targetPath) {
    try {
	    fs.rmdir(targetPath, function(err) {
	    	if (err) {
	    		// console.log(err);
	    	}
	    });
    } catch(err) {
    	// console.log(err);
    }
}

module.exports = unmountPath;
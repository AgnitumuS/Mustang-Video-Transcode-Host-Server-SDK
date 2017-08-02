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
var selectJobAPI = express.Router();
var fs = require('fs');
var path = require('path');
var config = require('../config/config');

// body : { path : url }
selectJobAPI.route('/')
	.get(function(req, res) {
		res.json({Message : "This is API /selectJob"});
	})
	.post(function(req, res) {
		// body : { path : url }
		var sorceDirPath = path.dirname(req.body.path);
		var mountCandidate = path.basename(sorceDirPath);
		var filename = path.basename(req.body.path);
		res.json(path.basename(req.body.path));

		fs.mkdir(config.hostMountedDir, function(err) {
			if (err) {
				console.log(err);
			}
		});
	});

module.exports = selectJobAPI;
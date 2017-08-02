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
var filesAPI = express.Router();
var fs = require('fs');

// body : { path : url }
filesAPI.route('/')
	.post(function(req, res) {
		fs.readdir(req.body.path, function(err, filenames) {
			if (err) {
			  onError(err);
			  return;
			}
			var array = [];
			var i = 0;
			while (filenames[i] != undefined) {
				var element = filenames[i].split('');
				if (filenames[i] != undefined && element[0] != '.') {
					array.push(filenames[i]);
					i++;
				} else {
					i++
				}
			}
			res.json(array);
		});
	});

module.exports = filesAPI;
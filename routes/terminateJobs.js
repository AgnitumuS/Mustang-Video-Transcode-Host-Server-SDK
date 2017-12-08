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
var terminateAPI = express.Router();
var request = require('request');
var db = require('../db/dbSqlite').sqliteDB;
var config = require('../config/config');
var cardMap = require('../config/cardMap');
var terminateJob = require('./tools/toolsIdx').terminateJob;

terminateAPI.route('/')
    .get(function(req, res) {
        res.json({
            Message: "terminateAPI"
        });
    })
    .post(function(req, res) {
        var array = req.body.jobsArray;
        Promise.resolve(singleRequest(array, 0, []))
            .then(function(result) {
                res.json(result);
            })
            .catch(function(err) {
                console.log(err);
            });
    });

function singleRequest(array, index, resultArray) {
    return new Promise(function(resolve, reject) {
            if (index == array.length) {
                resolve(resultArray);
            } else {
                return Promise.resolve(terminateJob(array[index]))
                    .then(function(result) {
                        var obj = {
                            jobId: array[index],
                            message: result
                        }
                        resultArray.push(obj);
                        return Promise.resolve(singleRequest(array, index + 1, resultArray))
                            .then(function(data) {
                                resolve(data);
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    })
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = terminateAPI;
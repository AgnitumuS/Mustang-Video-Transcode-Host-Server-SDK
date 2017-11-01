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
var memUsageInfoAPI = express.Router();
var request = require('request');
var tools = require('./tools/toolsIdx');
var config = require('../config/config');
var cardMap = require('../config/cardMap');

memUsageInfoAPI.route('/')
    .get(function(req, res) {
        var cards = Object.keys(cardMap);
        var promiseArr = [];

        for (var i = 0; i < cards.length; i++) {
            promiseArr.push(Promise.resolve(memUsageInfoOneCard(cards[i])));
        }

        Promise.all(promiseArr)
            .then(function(allData) {
                res.json(allData);
            })
            .catch(function(err) {
                console.log(err);
                res.statusCode = 500;
                res.json({
                    Message: "Internal Server Error"
                });
            });
    });

memUsageInfoAPI.route('/:cardid')
    .get(function(req, res) {
        Promise.resolve(memUsageInfoOneCard(req.params.cardid))
            .then(function(data) {
                res.json(data);
            })
    });

function memUsageInfoOneCard(cardid) {
    return Promise.resolve(tools.getUsageInfo(cardid, "memoryusage"))
        .then(function(data) {
            return data;
        })
}

module.exports = memUsageInfoAPI;
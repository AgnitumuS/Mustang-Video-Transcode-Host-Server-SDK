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
var cginfoAPI = express.Router();
var request = require('request');
var tools = require('./tools/toolsIdx');
var config = require('../config/config');
var cardMap = require('../config/cardMap');

cginfoAPI.route('/')
    .get(function(req, res) {
        var cards = Object.keys(cardMap);
        var promiseArr = [];

        for (var i = 0; i < cards.length; i++) {
            promiseArr.push(Promise.resolve(cginfoOneCard(cards[i])));
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

cginfoAPI.route('/:cardid')
    .get(function(req, res) {
        if (cardMap[req.params.cardid] == undefined) {
            res.json({
                Message: "Card not found! Please check cardid"
            });
        } else {
            var array = cardMap[req.params.cardid].getAllIPAndPort();
            for (var i = 0; i < array.length; i++) {
                array[i] = "http://" + array[i];
            }

            Promise.resolve(cginfoOneCard(req.params.cardid))
                .then(function(result) {
                    res.json(result);
                })
                .catch(function(err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.json({
                        Message: "Internal Server Error"
                    });
                });
        }
    });

function cginfoOneCard(cardid) {
    var array = cardMap[cardid].getAllIPAndPort();
    for (var i = 0; i < array.length; i++) {
        array[i] = "http://" + array[i];
    }

    return Promise.resolve(tools.getCGinfo(array))
        .then(function(result) {
            return new Promise(function(resolve, reject) {
                var idArr = cardMap[cardid].getAllCPUID();
                for (var i = 0; i < result.usage.length; i++) {
                    result.usage[i].cpuId = idArr[i];
                }

                var obj = {
                    cardid: cardid,
                    cginfo: result
                }
                resolve(obj);
            });
        });
}

module.exports = cginfoAPI;
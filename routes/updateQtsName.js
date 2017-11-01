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
var updateQtsNameAPI = express.Router();
var cardMap = require('../config/cardMap');
var request = require('request');

updateQtsNameAPI.route('/')
    .get(function(req, res) {
        res.json({
            Message: "API updateQtsName"
        });
    })
    .put(function(req, res) {
        if (cardMap[req.body.cardid] != undefined) {
            var ipAddr = cardMap[req.body.cardid].cpu(req.body.cpuid).getIPAddr();
            var port = cardMap[req.body.cardid].cpu(req.body.cpuid).getPort();
            var targetURL = "http://" + ipAddr + ":" + port + "/submachine/qtsInfo";
            var data = {
                name: req.body.name
            }

            new Promise(function(resolve, reject) {
                    request({
                        url: targetURL,
                        method: 'PUT',
                        json: data,
                        timeout: 3000
                    }, function(error, response, body) {
                        if (error) {
                            console.log("Request to " + targetURL + " failed!");
                        } else {
                            if (body.message == "Success") {
                                cardMap[req.body.cardid].cpu(req.body.cpuid).setQtsName(req.body.name);
                                resolve({
                                    success: true
                                });
                            } else {
                                resolve({
                                    success: false,
                                    message: body
                                });
                            }
                        }
                    });
                })
                .then(function(data) {
                    res.json(data);
                })
                .catch(function(err) {
                    console.log(err);
                })
        } else {
            res.json({
                success: false,
                message: "CARDID does not exist!"
            });
        }
    });

module.exports = updateQtsNameAPI;
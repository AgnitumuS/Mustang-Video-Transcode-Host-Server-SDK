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
var network = require('network');
var config = require('../config/config');
var os = require('os');

function getExternalIP() {
    return new Promise(function(resolve, reject) {
            network.get_private_ip(function(err, ip) {
                resolve(ip);
            })
        })
        .then(function(externalIP) {
            if (externalIP == undefined) {
                var obj = {
                    name : "",
                    address : ""
                }
                return obj;
            }
            var result = "";
            var interfaces = os.networkInterfaces();
            for (var key in interfaces) {
                if (interfaces.hasOwnProperty(key)) {
                    for (var j = 0; j < interfaces[key].length; j++) {
                        if (interfaces[key][j].family == 'IPv4' && interfaces[key][j].address == externalIP) {
                            config.externalIP = externalIP;
                            var obj = {
                                name: key,
                                address: externalIP
                            }
                            return result = obj;
                        }
                    }
                }
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

function syncExternalIP() {
    setTimeout(function() {
        syncExternalIP();
        getExternalIP();
    }, 60 * 1000);
}

syncExternalIP();

module.exports = getExternalIP;
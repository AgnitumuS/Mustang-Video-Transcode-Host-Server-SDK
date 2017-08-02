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

var request = require('request');
var cardMap = require('../config/cardMap');

function mountRequest() {
	for (var key in cardMap) {
		var addrArray = cardMap[key].getAllIPAddr();
		var portArray = cardMap[key].getAllPort();
		for (var i = 0; i < addrArray.length; i++) {
			var targetURL = "http://" + addrArray[i] + ":" + portArray[i] + "/submachine/cardUsing";
			requestCall(targetURL, addrArray[i]);
		}
	}
}

function requestCall(targetURL, hostIP) {
	ipaddress = hostIP.split('.');
	ipaddress[3] = "1";
	ipaddress = ipaddress.join(".");

	var data = {
	    title: "mountVideo",
	    data: {
	        hostName: "mvt",
	        hostPassword: "anywaytest",
	        hostIP: ipaddress,
	        hostFolderName: "share"
	    }
	}

	request({
        url: targetURL,
        method: 'POST',
        json: data,
        timeout : 3000
    }, function(error, response, body) {
    	if (error) {
    		console.log("Request to " + targetURL + " failed!");
    	} else {
	     	// console.log(body);   		
    	}
    });	
}

module.exports = mountRequest;
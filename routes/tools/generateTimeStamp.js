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
var generateTimeStamp = function() {
    var time = new Date();
    var year = time.getFullYear().toString();
    var mounth = (time.getMonth() + 1).toString();
    var day = time.getDate().toString();
    var hour = time.getHours().toString();
    var min = time.getMinutes().toString();
    var sec = time.getSeconds().toString();
    var millisec = time.getMilliseconds().toString();

    if (mounth.length != 2) {
        mounth = "0" + mounth;
    }
    if (day.length != 2) {
        day = "0" + day;
    }
    if (hour.length != 2) {
        hour = "0" + hour;
    }
    if (min.length != 2) {
        min = "0" + min;
    }
    if (sec.length != 2) {
        sec = "0" + sec;
    }
    if (millisec.length == 1) {
        millisec = "00" + millisec;
    } else if (millisec.length == 2) {
        millisec = "0" + millisec;
    }

    var curTime = year + "-" + mounth + "-" + day + " " + hour + ":" + min + ":" + sec + "." + millisec;
    return curTime;
}

module.exports = generateTimeStamp;
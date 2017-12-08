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
var path = require('path');

module.exports = {
    externalIP: "",
    rootDirName : path.dirname(__dirname),
    hostMountedDir: path.normalize(path.dirname(__dirname) + "/mvt_video"),
    cardMountedDir: "/data",
    routeMapPath: "/usr/local/mvt_data/route.sh",
    routeMapQtsPath : path.dirname(__dirname) + "/config/route.sh",
    routeMapWindowsPath: path.normalize(path.dirname(__dirname) + "\\route.bat"),
    platform: "",
    version: "1.05",
    cardids: [],
    detectedCards: {},
    interfaceIPGroup: {},
    mustangInterfaces: [],
    cardPorts: {
        qts: 8080,
        rtmp: 1934,
        icecast: 8181,
        http: 8019,
        faye: 8300,
        container_ffmpeg: 9101,
        container_gstreamer: 9100
    }
}

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
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

var apiIndex = {
    cardinfo: require('./cardinfo'),
    cards: require('./cards'),
    cginfo: 　require('./cginfo'),
    clearTable: require('./clearTable'),
    cpujobinfo: require('./cpujobinfo').cpujobinfoAPI,
    cpuTempInfo: require('./cpuTempInfo'),
    error: require('./error'),
    errorlog: require('./errorlog'),
    file: require('./file'),
    mediainfo: require('./mediainfo'),
    memUsageInfo: require('./memUsageInfo'),
    selectJob: require('./selectJob'),
    terminate: require('./terminate.js'),
    terminateJobs: require('./terminateJobs.js'),
    getconfig: require('./getconfig'),
    getfiles: require('./getfiles'),
    getIP: require('./getIP'),
    homeDir: require('./homeDir'),
    jobs: require('./jobs'),
    listDir: require('./listDir'),
    live: require('./live'),
    trafficInfo: require('./trafficInfo'),
    updateNetworkConfig: require('./updateNetworkConfig'),
    updateQtsName: require('./updateQtsName'),
    vod: require('./vod'),
    windowsips : require('./windowsips')
}

//******************** API ROUTE ***********************//
router.use('/cardinfo', apiIndex.cardinfo);
router.use('/cards', apiIndex.cards);
router.use('/cginfo', apiIndex.cginfo);
router.use('/clearTable', apiIndex.clearTable);
router.use('/cpujobinfo', apiIndex.cpujobinfo);
router.use('/cpuTempInfo', apiIndex.cpuTempInfo);
router.use('/error', apiIndex.error);
router.use('/errorlog', apiIndex.errorlog);
router.use('/file/jobs', apiIndex.file);
router.use('/mediainfo', apiIndex.mediainfo);
router.use('/memoryUsage', apiIndex.memUsageInfo);
router.use('/selectJob', apiIndex.selectJob);
router.use('/terminate', apiIndex.terminate);
router.use('/terminateJobs', apiIndex.terminateJobs);
router.use('/getconfig', apiIndex.getconfig);
router.use('/getfiles', apiIndex.getfiles);
router.use('/getIP', apiIndex.getIP);
router.use('/homeDir', apiIndex.homeDir);
router.use('/jobs', apiIndex.jobs);
router.use('/listDir', apiIndex.listDir);
router.use('/live/jobs', apiIndex.live);
router.use('/trafficInfo', apiIndex.trafficInfo);
router.use('/updateNetworkConfig', apiIndex.updateNetworkConfig);
router.use('/updateQtsName', apiIndex.updateQtsName);
router.use('/vod/jobs', apiIndex.vod);
router.use('/windowsips', apiIndex.windowsips);

module.exports = router;
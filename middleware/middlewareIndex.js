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
var middlewareIndex = {
    buildIPTable: require('./buildIPTable'),
    cleanMountFolder: require('./cleanMountFolder'),
    cors: require('./cors'),
    detectedCardsRecord: require('./detectedCardsRecord'),
    faye: require('./faye'),
    getBridgeInterfaces: require('./getBridgeInterfaces'),
    getExternalIP: require('./getExternalIP'),
    getInactiveNetworkInterfaces: require('./getInactiveNetworkInterfaces'),
    getNasInterfacesName: require('./getNasInterfacesName'),
    getNetworkInterfaces: require('./getNetworkInterfaces'),
    getPlatform: require('./getPlatform'),
    ipMacMap: require('./ipMacMap'),
    iscDhcpInterface: require('./iscDhcpInterface'),
    loadCards: require('./loadCards'),
    loadPortInfo: require('./loadPortInfo'),
    macIPMap: require('./macIPMap'),
    mapIPAddr: require('./mapIPAddr'),
    mountRequest: require('./mountRequest'),
    needToRecover: require('./needToRecover'),
    pingMustangs: require('./pingMustangs'),
    printProgressBar: require('./printProgressBar'),
    queryingCards: require('./queryingCards'),
    queryingWindowsCards: require('./queryingWindowsCards'),
    recoverLostedInterfaces: require('./recoverLostedInterfaces'),
    sortCardMap: require('./sortCardMap'),
    wakeupInterfaces : require('./wakeupInterfaces'),
    writeToDhcpdConf: require('./writeToDhcpdConf'),
    writeToSmbConf: require('./writeToSmbConf')
}

module.exports = middlewareIndex;
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
var ping = require('ping');
var exec = require('child_process').exec;
var getInactiveNetworkInterfaces = require('./getInactiveNetworkInterfaces');
var ipMacMap = require('./ipMacMap');

function pingMustangs(bridgeName, recover, recoverInterfaceList) {
    var detectedIPs = [];
    var detectedCards = {};
    var interfaceIPGroup = {};
    var nonMunstangs = [];
    var hosts = [];
    for (var i = 0; i < 32; i++) {
        var str = "169.254.100.";
        str = str + (100 + i);
        hosts.push(str);
    }

    if (recover == true) {
        return Promise.resolve(helper(hosts, recoverInterfaceList, 0, detectedIPs, detectedCards, interfaceIPGroup, nonMunstangs, bridgeName));
    } else {
        return Promise.resolve(getInactiveNetworkInterfaces())
            .then(function(inactiveNames) {
                return Promise.resolve(helper(hosts, inactiveNames, 0, detectedIPs, detectedCards, interfaceIPGroup, nonMunstangs, bridgeName));
            })
            .catch(function(err) {
                console.log(err);
            });
    }
}

function helper(hosts, inactiveNames, index, detectedIPs, detectedCards, interfaceIPGroup, nonMunstangs, bridgeName) {
    return new Promise(function(resolve, reject) {
            if (index == inactiveNames.length) {
                var result = {
                    detectedCards: detectedCards,
                    interfaceIPGroup: interfaceIPGroup,
                    nonMunstangs: nonMunstangs
                }
                resolve(result);
            } else {
                hosts = removeDetectedIPs(hosts, detectedIPs);
                return Promise.resolve(groupNewInterface(inactiveNames[index], bridgeName))
                    .then(function(msg) {
                        console.log(msg.message);
                        return Promise.resolve(pingIP(hosts, index, bridgeName));
                    })
                    .then(function(dataObj) {
                        if (dataObj == undefined) {
                            nonMunstangs.push(inactiveNames[index]);
                            ungrounpInterfaces(inactiveNames[index], bridgeName);
                        } else {
                            var responsedIP = dataObj.address;
                            var macAddr = dataObj.macAddr;
                            var ledAndCpuNum = getLEDAndCPUNum(responsedIP);
                            detectedIPs.push(responsedIP);
                            detectedCards = buildDetectedCards(detectedCards, responsedIP, ledAndCpuNum, macAddr);
                            interfaceIPGroup = buildInterfaceIPGroup(interfaceIPGroup, responsedIP, inactiveNames[index]);
                        }
                        return Promise.resolve(helper(hosts, inactiveNames, index + 1, detectedIPs, detectedCards, interfaceIPGroup, nonMunstangs, bridgeName))
                            .then(function(result) {
                                resolve(result);
                            })
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

function pingIP(hosts, index, bridgeName) {
    var promiseArray = [];
    hosts.forEach(function(host) {
        var setting = {
            timeout: 10
        };
        var element = ping.promise.probe(host, setting);
        promiseArray.push(element);
    });

    return Promise.all(promiseArray)
        .then(function(allData) {
            return new Promise(function(resolve, reject) {
                    var result = "";
                    for (var i = 0; i < allData.length; i++) {
                        if (allData[i].alive == true) {
                            console.log("");
                            console.log("Detected alive host");
                            console.log(allData[i].host);
                            resolve(allData[i].host);
                        }
                    }
                    resolve(undefined);
                })
                .catch(function(err) {
                    console.log(err);
                });
        })
        .then(function(address) {
            if (address == undefined) {
                return undefined;
            } else {
                return Promise.resolve(ipMacMap(address, bridgeName))
                    .then(function(result) {
                        return new Promise(function(resolve, reject) {
                                var obj = {
                                    address: result.address,
                                    macAddr: result.macAddr
                                }

                                resolve(obj);
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

function getLEDAndCPUNum(ip) {
    if (ip == undefined || ip == "") {
        return ip;
    }
    var array = ip.split('.');
    var led = Number.parseInt((parseInt(array[3]) - 100) / 2);
    var cpu = ((parseInt(array[3]) - 100) % 2) + 1;
    var result = {
        led: led,
        cpu: cpu
    }
    console.log("CARD" + led + " CPUID" + cpu + " detected!");
    return result;
}

function groupNewInterface(inactiveName, bridgeName) {
    return new Promise(function(resolve, reject) {
            var proc = exec("brctl addif " + bridgeName + " " + inactiveName, function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "Interface " + inactiveName + " add to bridge group";
                resolve({
                    message: str
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function removeDetectedIPs(hosts, detectedIPs) {
    if (detectedIPs.length == 0) {
        return hosts;
    }
    for (var i = 0; i < detectedIPs.length; i++) {
        if (hosts.indexOf(detectedIPs[i]) != -1) {
            hosts.splice(hosts.indexOf(detectedIPs[i]), 1);
        }
    }
    return hosts;
}

function buildDetectedCards(detectedCards, responsedIP, ledAndCpuNum, macAddr) {
    if (detectedCards.hasOwnProperty(ledAndCpuNum.led) == true) {
        if (ledAndCpuNum.cpu == 1) {
            detectedCards[ledAndCpuNum.led].cpu1.ipConnected = true;
            detectedCards[ledAndCpuNum.led].cpu1.ipAddr = responsedIP;
            detectedCards[ledAndCpuNum.led].cpu1.macAddr = macAddr;
        } else if (ledAndCpuNum.cpu == 2) {
            detectedCards[ledAndCpuNum.led].cpu2.ipConnected = true;
            detectedCards[ledAndCpuNum.led].cpu2.ipAddr = responsedIP;
            detectedCards[ledAndCpuNum.led].cpu2.macAddr = macAddr;
        }
    } else {
        var array = responsedIP.split('.');
        if (ledAndCpuNum.cpu == 1) {
            array[3] = parseInt(array[3]) + 1;
            var partnerIP = array.join('.');
            detectedCards[ledAndCpuNum.led] = {
                cpu1: {
                    ipConnected: true,
                    apiConnected: false,
                    ipAddr: responsedIP,
                    ipUpdated: false,
                    macAddr: macAddr
                },
                cpu2: {
                    ipConnected: false,
                    apiConnected: false,
                    ipAddr: partnerIP,
                    ipUpdated: false,
                    macAddr: ""
                }
            };
        } else if (ledAndCpuNum.cpu == 2) {
            array[3] = parseInt(array[3]) - 1;
            var partnerIP = array.join('.');
            detectedCards[ledAndCpuNum.led] = {
                cpu1: {
                    ipConnected: false,
                    apiConnected: false,
                    ipAddr: partnerIP,
                    ipUpdated: false,
                    macAddr: ""
                },
                cpu2: {
                    ipConnected: true,
                    apiConnected: false,
                    ipAddr: responsedIP,
                    ipUpdated: false,
                    macAddr: macAddr
                }
            };
        }
    }
    return detectedCards;
}

function buildInterfaceIPGroup(interfaceIPGroup, responsedIP, name) {
    interfaceIPGroup[name] = responsedIP;
    return interfaceIPGroup;
}

function ungrounpInterfaces(names, bridgeName) {
    return new Promise(function(resolve, reject) {
            if (names == undefined || names == "") {
                resolve("No Interfaces need to removed");
            } else {
                var proc = exec("brctl delif " + bridgeName + " " + names, function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = names + " are removed from bridge " + bridgeName;
                    console.log(str);
                    resolve({
                        message: str
                    });
                });
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = pingMustangs;
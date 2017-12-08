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
var db = require('../db/dbSqlite').sqliteDB;
var fs = require('fs');
var config = require('../config/config');
var startupWindows = require('./startupWindows');
var install = require("./install");
var ubuntu_update = install.ubuntu_update;
var install_driver = install.install_driver;
var ubuntu_install_bridge = install.ubuntu_install_bridge;
var ubuntu_install_mediainfo = install.ubuntu_install_mediainfo;
var ubuntu_samba = install.ubuntu_samba;
var setup_bridge = install.setup_bridge;
var remove_bridge = install.remove_bridge
var iptables = install.iptables;
var exe_initRoute = install.exe_initRoute;
var ubuntu_dhcp = install.ubuntu_dhcp;
var groupNewInterface = install.groupNewInterface;
var restart_dhcp = install.restart_dhcp;
var ubuntu_dhcp_installation = install.ubuntu_dhcp_installation;
var ubuntu_samba_nas = install.ubuntu_samba_nas;
// module from middleware
var middleware = require('../middleware/middlewareIndex');
var getNetworkInterfaces = middleware.getNetworkInterfaces;
var getExternalIP = middleware.getExternalIP;
var buildIPTable = middleware.buildIPTable;
var pingMustangs = middleware.pingMustangs;
var queryingCards = middleware.queryingCards;
var detectedCardsRecord = middleware.detectedCardsRecord;
var recoverLostedInterfaces = middleware.recoverLostedInterfaces;
var needToRecover = middleware.needToRecover;
var getPlatform = middleware.getPlatform;
var wakeupInterfaces = middleware.wakeupInterfaces;
var prevInterfaceIPGroup = {};

function startup(firstRound) {
    return Promise.resolve(getPlatform())
        .then(function(platform) {
            if (platform == "linux") {
                if (fs.existsSync(config.routeMapPath) === false && firstRound) {
                    return Promise.resolve(startupUbuntu());
                } else {
                    return Promise.resolve(generalStart(false));
                }                
            } else if (platform == "qts") {
                return Promise.resolve(generalStart(false));
            } else if (platform == "windows") {
                return Promise.resolve(startupWindows());
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

function startupUbuntu() {
    return Promise.resolve(install_driver())
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(ubuntu_install_bridge());
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(ubuntu_install_mediainfo());
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(ubuntu_samba("anywaytest"));
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(setup_bridge("br_mvt0", "169.254.100.1"));
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(ubuntu_dhcp_installation());
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(generalStart(true));
        })
        .catch(function(err) {
            console.log(err);
        });
}

function startupQts() {
    if (fs.existsSync(config.routeMapQtsPath) == false) {
        fs.writeFileSync(config.routeMapQtsPath, "");
    }
    ubuntu_samba_nas();
    return Promise.resolve(wakeupInterfaces())
        .then(function(msg) {
            console.log(msg);
            return Promise.resolve(setup_bridge("br_nas", "169.254.100.1"));
        })
        .then(function(msg) {
            console.log(msg);
            return Promise.resolve(generalStart(true));
        })
        .catch(function(err) {
            console.log(err);
        });
}

function generalStart(initStart) {
    return Promise.resolve(getNetworkInterfaces())
        .then(function(networkInterfaces) {
            var array = [];
            for (var i = 0; i < networkInterfaces.length; i++) {
                array.push(networkInterfaces[i].interfaceName);
            }
            if (initStart == true) {
                return Promise.resolve("setted");
            } else if (initStart == false) {
                if (array.indexOf("br_mvt0") == -1) {
                    detectedCardsRecord.resetRecord();
                    console.log("Bridge not found, setup a new one.");
                    if (config.platform == "linux") {
                        return Promise.resolve(setup_bridge("br_mvt0", "169.254.100.1"))
                            .then(function(msg) {
                                console.log(msg.message);
                                return new Promise(function(resolve, reject) {
                                    resolve("setted");
                                    reject("Bridge Cammand Error!");
                                })
                            });
                    } else if (config.platform == "qts") {
                        return Promise.resolve(startupQts())
                            .then(function(result) {
                                console.log(result);
                                return Promise.resolve(setup_bridge("br_nas", "169.254.100.1"))
                                    .then(function(msg) {
                                        console.log(msg.message);
                                        return new Promise(function(resolve, reject) {
                                            resolve("setted");
                                            reject("Bridge Cammand Error!");
                                        })
                                    });
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    }
                } else if (array.indexOf("br_mvt0") != -1) {
                    return Promise.resolve(runAgainPath());
                }
            }
        })
        .then(function(result) {
                if (result == "setted") {
                    return Promise.resolve(commonPath());
                } else {
                    return Promise.resolve(result);
                }
            },
            function(msg) {
                console.log(msg);
            })
        .catch(function(err) {
            console.log(err);
        });
}

function commonPath() {
    var workingBridgeName = "";
    if (config.platform == "linux") {
        workingBridgeName = "br_mvt0";
    } else if (config.platform == "qts") {
        workingBridgeName = "br_nas";
    }
    return Promise.all([pingMustangs(workingBridgeName, false), getExternalIP()])
        .then(function(allData) {
            var result = allData[0];
            var externalInterface = allData[1].name;
            config.detectedCards = result.detectedCards;
            config.interfaceIPGroup = result.interfaceIPGroup;
            config.mustangInterfaces = Object.keys(result.interfaceIPGroup);
            if (Object.keys(config.interfaceIPGroup).length == 0
                || Object.keys(prevInterfaceIPGroup).length < Object.keys(config.interfaceIPGroup).length
                ) {
                prevInterfaceIPGroup = config.interfaceIPGroup;
                var str = "*************************************************************\n" +
                    "** Mustang cards are starting up. Please wait for a while. **\n" +
                    "*************************************************************\n";
                return Promise.resolve(remove_bridge(workingBridgeName))
                    .then(function(msg) {
                        console.log(msg.message);
                        var obj = {
                            message: str,
                            detectAgain: true
                        }
                        return Promise.resolve(obj);
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            } else {
                return Promise.resolve(dhcpPath());
            }
        });
}

function dhcpPath() {
    var workingBridgeName = "";
    if (config.platform == "linux") {
        workingBridgeName = "br_mvt0";
    } else if (config.platform == "qts") {
        workingBridgeName = "br_nas";
    }
    return Promise.resolve(remove_bridge(workingBridgeName))
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(setup_bridge("br_mvt0", "192.168.100.1"));
        })
        .then(function(msg) {
            console.log(msg.message);
            if (config.platform == "linux") {
                return Promise.resolve(ubuntu_dhcp());
            } else if (config.platform == "qts") {
                return Promise.resolve({message : "QTS DHCP"});
            }
        })
        .then(function(msg) {
            console.log(msg.message);
            return Promise.resolve(groupNewInterface("br_mvt0", config.mustangInterfaces));
        })
        .then(function(msg) {
            console.log(msg.message);
            if (config.platform == "linux") {
                return Promise.resolve(restart_dhcp());
            } else if (config.platform == "qts") {
                return Promise.resolve({message : "QTS DHCP done."});
            }
        })
        .then(function(msg) {
            console.log(msg.message);
            queryingCards();
            return {
                message: "Startup Process Completed!"
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

function runAgainPath() {
    return Promise.resolve(detectedCardsRecord.readFromDB())
        .then(function(detectedCards) {
            if (needToRecover() == true) {
                return Promise.resolve(recoverLostedInterfaces());
            } else {
                return Promise.resolve({
                    message: "All cards detected..."
                });
            }
        })
        .then(function(msg) {
            console.log(msg.message);
            queryingCards(true);
            return Promise.resolve({
                message: "MVT project restarting..."
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

module.exports = startup;
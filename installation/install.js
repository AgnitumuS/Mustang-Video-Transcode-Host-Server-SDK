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
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var config = require('../config/config');
var netInterface = require('../middleware/iscDhcpInterface').updateContent;
var writeToDhcpdConf = require('../middleware/writeToDhcpdConf');
var writeToSmbConf = require('../middleware/writeToSmbConf');

function ubuntu_update() {
    return new Promise(function(resolve, reject) {
            var proc = exec("apt-get update", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "*************************************************************\n" +
                    "****************** System Update Completed ******************\n" +
                    "*************************************************************\n";
                resolve({
                    message: str
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function install_driver() {
    return new Promise(function(resolve, reject) {
            var proc = exec("cd driver && make && make install", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "*************************************************************\n" +
                    "******************** Driver Installed ! *********************\n" +
                    "*************************************************************\n";
                resolve({
                    message: str
                });
            });
        })
        .then(function(msg) {
            console.log(msg.message)
            return new Promise(function(resolve, reject) {
                var proc = exec("cd driver && insmod tn40xx.ko", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "insmod executed";
                    resolve({
                        message: str
                    });
                });
            })
        })
        .catch(function(err) {
            console.log(err);
        });
}

function ubuntu_install_bridge() {
    return new Promise(function(resolve, reject) {
            var proc = exec("apt-get install bridge-utils", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "*************************************************************\n" +
                    "****************** Bridge-utils Installed *******************\n" +
                    "*************************************************************\n";
                resolve({
                    message: str
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function ubuntu_install_mediainfo() {
    return new Promise(function(resolve, reject) {
            var proc = exec("apt-get install -y mediainfo", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "*************************************************************\n" +
                    "*************** Install mediainfo Completed! ****************\n" +
                    "*************************************************************\n";
                resolve({
                    message: str
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function ubuntu_samba(password) {
    var videoPath = path.dirname(__dirname) + "/mvt_video"
    return new Promise(function(resolve, reject) {
            if (fs.existsSync("/etc/samba/smb.conf") === false) {
                var proc = exec("sudo apt-get -y install system-config-samba", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                    resolve(stdout);
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                        "********** install system-config-samba Completed! ***********\n" +
                        "*************************************************************\n";
                    resolve({
                        message: str
                    });
                });
            } else {
                var str = "*************************************************************\n" +
                    "*************** system-config-samba Installed! **************\n" +
                    "*************************************************************\n";
                resolve({
                    message: str
                });
            }
        })
        .then(function(msg) {
            console.log(msg.message);
            writeToSmbConf();
            return new Promise(function(resolve, reject) {
                // Add new username
                var proc = exec('sudo useradd mvt;sudo echo -ne "' + password + '\n' + password + '\n" | smbpasswd -a -s mvt', function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                        "************** Setup Samba password Completed! **************\n" +
                        "*************************************************************\n";
                    resolve({
                        message: str
                    });
                });
            })
        })
        .then(function(msg) {
            console.log(msg.message);
            return new Promise(function(resolve, reject) {
                var proc = exec("chown -R mvt.mvt " + videoPath, function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                        "****************** chown mvt.mvt Completed! *****************\n" +
                        "*************************************************************\n";
                    resolve({
                        message: str
                    });
                });
            });
        })
        .then(function(msg) {
            return new Promise(function(resolve, reject) {
                var proc = exec("sudo systemctl restart smbd", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                        "************* systemctl restart samba Completed! ************\n" +
                        "*************************************************************\n";
                    "*************************************************************\n" +
                    "****************** ubuntu_samba Completed! ******************\n" +
                    "*************************************************************\n";
                    resolve({
                        message: str
                    });
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function setup_bridge(bridgeName, ipAddr) {
    return new Promise(function(resolve, reject) {
            var proc = exec("brctl addbr " + bridgeName, function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "*************************************************************\n" +
                    "******************** Add Bridge " + bridgeName + " *********************\n" +
                    "*************************************************************\n";
                resolve({
                    message: str
                });
            });
        })
        .then(function(msg) {
            console.log(msg.message);
            return new Promise(function(resolve, reject) {
                    var proc = exec("ifconfig " + bridgeName + " " + ipAddr + " netmask 255.255.255.0", function(error, stdout) {
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });

                    proc.stdout.on('data', function(data) {
                        process.stdout.write(data);
                    });

                    proc.on('exit', function(code) {
                        var str = "*************************************************************\n" +
                            "********************* Bridge IP Setted **********************\n" +
                            "*************************************************************\n";
                        resolve({
                            message: str
                        });
                    });
                })
                .catch(function(err) {
                    console.log(err);
                });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function remove_bridge(bridgeName) {
    return new Promise(function(resolve, reject) {
            var proc = exec("ip link set " + bridgeName + " down", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "Bridge " + bridgeName + " down";
                resolve({
                    message: str
                });
            });
        })
        .then(function(msg) {
            console.log(msg.message);
            return new Promise(function(resolve, reject) {
                    var proc = exec("brctl delbr " + bridgeName, function(error, stdout) {
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });

                    proc.stdout.on('data', function(data) {
                        process.stdout.write(data);
                    });

                    proc.on('exit', function(code) {
                        var str = "*************************************************************\n" +
                            "******************* Remove Bridge " + bridgeName + " *******************\n" +
                            "*************************************************************\n";
                        resolve({
                            message: str
                        });
                    });
                })
                .catch(function(err) {
                    console.log(err);
                });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function iptables(outcard) {
    var homePath = "/usr/local/mvt_data";
    if (fs.existsSync(homePath + 'route.sh') === true) {
        fs.unlinkSync(homePath + 'route.sh');
    }
    fs.writeFileSync(homePath + '/route.sh', 'echo \"1\" > /proc/sys/net/ipv4/ip_forward\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -F\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -X\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -F\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -X\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -P INPUT DROP\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -P OUTPUT ACCEPT\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -P FORWARD ACCEPT\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -A INPUT -i lo -j ACCEPT\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -A OUTPUT -o lo -j ACCEPT\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -A INPUT -i ' + outcard + ' -j ACCEPT\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -A OUTPUT -o ' + outcard + ' -j ACCEPT\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n');
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A POSTROUTING -s 192.168.100.0/24 -o ' + outcard + ' -j MASQUERADE\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -A INPUT -s 192.168.100.0/24 -j ACCEPT\n')
}

function add_iptables(ip, outcard, ports) {
    var homePath = "/usr/local/mvt_data";
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.nas + ' -j DNAT --to-destination ' + ip + ':' + config.cardPorts.qts + '\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.hls + ' -j DNAT --to-destination ' + ip + ':' + config.cardPorts.http + '\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.rtmp + ' -j DNAT --to-destination ' + ip + ':' + config.cardPorts.rtmp + '\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.icecast + ' -j DNAT --to-destination ' + ip + ':' + config.cardPorts.icecast + '\n')
}

function exe_iptables() {
    var homePath = "/usr/local/mvt_data";
    return new Promise(function(resolve, reject) {
        if (fs.existsSync(homePath + "/route.sh") == false) {
            var str = "route.sh have not established";
            resolve({
                message: str
            });
        } else {
            var proc = exec("chmod +x " + homePath + "/route.sh; bash " + homePath + "/route.sh", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "route.sh updated";
                resolve({
                    message: str
                });
            });
        }
    });
}

function groupNewInterface(bridgeName, interfaces) {
    if (interfaces == undefined || interfaces.length == 0) {
        return Promise.resolve({
            message: "No mustangs interfaces available"
        });
    } else {
        return new Promise(function(resolve, reject) {
                var str = "";
                for (var i = 0; i < interfaces.length; i++) {
                    str = str + interfaces[i] + " ";
                }
                var cmd = "brctl addif " + bridgeName + " " + str;
                console.log("Command for group new interfaces while dhcp path");
                console.log(cmd);
                var proc = exec(cmd, function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "Interface " + interfaces + " add to bridge group";
                    resolve({
                        message: str
                    });
                });
            })
            .catch(function(err) {
                console.log(err);
            });
    }
}

function ubuntu_dhcp_installation() {
    if (fs.existsSync("/etc/dhcp/dhcpd.conf") === false) {
        return new Promise(function(resolve, reject) {
            var proc = exec("sudo apt-get -y install isc-dhcp-server", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "*************************************************************\n" +
                    "******* apt-get -y install isc-dhcp-server Completed! *******\n" +
                    "*************************************************************\n";
                resolve({
                    message: str
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
    } else {
        return Promise.resolve({
            message: "DHCP Installed!"
        });
    }
}

function ubuntu_dhcp() {
    return new Promise(function(resolve, reject) {
            if (fs.existsSync("/etc/dhcp/dhcpd.conf") === false) {
                var proc = exec("sudo apt-get -y install isc-dhcp-server", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                        "******* apt-get -y install isc-dhcp-server Completed! *******\n" +
                        "*************************************************************\n";
                    resolve({
                        message: str
                    });
                });
            } else {
                resolve({
                    message: "DHCP Server Installed"
                });
            }
        })
        .then(function(msg) {
            console.log(msg.message);
            return new Promise(function(resolve, reject) {
                var proc = exec("cp /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf.bak;cp /etc/default/isc-dhcp-server /etc/default/isc-dhcp-server.bak", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                        "************* cp /etc/dhcp/dhcpd.conf Completed! ************\n" +
                        "*************************************************************\n";
                    resolve({
                        message: str
                    });
                });
            })
        })
        .then(function(result) {
            console.log(result.message);
            const setName = "br_mvt0";
            netInterface(setName);
            writeToDhcpdConf();
            return Promise.resolve({
                message: "DHCP setting file Established"
            });
        })
        .catch(function(err) {
            console.log(err);
        });
}

function restart_dhcp() {
    return new Promise(function(resolve, reject) {
        console.log("*************************************************************");
        console.log("*************** Restarting isc-dhcp-server. *****************");
        console.log("*************************************************************");
        var proc = exec("sudo rm -rf /var/lib/dhcp/dhcpd.leases;sudo systemctl restart isc-dhcp-server", function(error, stdout) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });

        proc.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        proc.on('exit', function(code) {
            var str = "*************************************************************\n" +
                "************* isc-dhcp-server restart Completed! ************\n" +
                "*************************************************************\n";
            resolve({
                message: str
            });
        });
    });
}

function writeToFile(data, targetPath) {
    new Promise(function(resolve, reject) {
        var file = fs.createWriteStream(targetPath);
        file.on('error', function(err) {
            console.log(err);
        });

        for (var i = 0; i < data.length; i++) {
            if (i != data.length - 1) {
                file.write(data[i] + "\n");
            } else {
                file.write(data[i]);
            }
        }
        file.end();
        file.on('close', function(err) {
            resolve({
                Message: "Success"
            });
        });
    })
    .catch(function(err) {
        console.log(err);
    });
}

module.exports = {
    ubuntu_update: ubuntu_update,
    install_driver: install_driver,
    ubuntu_install_bridge: ubuntu_install_bridge,
    ubuntu_install_mediainfo: ubuntu_install_mediainfo,
    ubuntu_samba: ubuntu_samba,
    setup_bridge: setup_bridge,
    remove_bridge: remove_bridge,
    iptables: iptables,
    add_iptables: add_iptables,
    exe_iptables: exe_iptables,
    groupNewInterface: groupNewInterface,
    ubuntu_dhcp_installation: ubuntu_dhcp_installation,
    ubuntu_dhcp: ubuntu_dhcp,
    restart_dhcp: restart_dhcp
}
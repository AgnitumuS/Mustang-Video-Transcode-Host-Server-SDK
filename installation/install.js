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

function ubuntu_update() {
    return new Promise(function(resolve, reject) {
        exec("sudo apt-get update", function(error, stdout) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
            resolve(stdout);
        });
    })
}

function install_driver() {
    return new Promise(function(resolve, reject) {
            exec("cd driver", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
                resolve(stdout);
            });
        })
        .then(function() {
            return new Promise(function(resolve, reject) {
                exec("make", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                    resolve(stdout);
                });
            })
        })
        .then(function() {
            return new Promise(function(resolve, reject) {
                exec("make install", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                    resolve(stdout);
                });
            })
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
            resolve({message : str});
        });
    })
}

function ubuntu_dhcp(card) {
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
                resolve({message : str});
            });
        })
        .then(function(msg) {
            console.log(msg.message);
            return new Promise(function(resolve, reject) {
                // var totalcard = "";
                var proc = exec("cp /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf.bak;cp /etc/default/isc-dhcp-server /etc/default/isc-dhcp-server.bak;rm -rf /etc/default/isc-dhcp-server;cp /etc/network/interfaces /etc/network/interfaces.bak", function(error, stdout) {
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
                    resolve({message : str});
                });
            })
        })
        .then(function(result) {

            return new Promise(function(resolve, reject) {
                var totalcard = "";
                for (var i = 0; i < card.length; i++) {
                    var j = 11 + i;
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', 'subnet 192.168.' + j + '.0 netmask 255.255.255.0 {\n');
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     range                           192.168.' + j + '.2 192.168.' + j + '.2;\n');
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option subnet-mask              255.255.255.0;\n');
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option broadcast-address        192.168.' + j + '.255;\n');
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option routers                  192.168.' + j + '.1;\n');
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option domain-name              "";\n');
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option domain-name-servers      8.8.8.8;\n');
                    fs.appendFileSync('/etc/dhcp/dhcpd.conf', '   }\n');

                    fs.appendFileSync('/etc/network/interfaces', 'auto ' + card[i] + '\n');
                    fs.appendFileSync('/etc/network/interfaces', 'iface ' + card[i] + ' inet static\n');
                    fs.appendFileSync('/etc/network/interfaces', 'address 192.168.' + j + '.1\n');
                    fs.appendFileSync('/etc/network/interfaces', 'netmask 255.255.255.0\n');
                    fs.appendFileSync('/etc/network/interfaces', '   \n');
                    totalcard = totalcard + card[i] + " ";
                }
                fs.writeFileSync('/etc/default/isc-dhcp-server', 'INTERFACES="' + totalcard + '"');
                setTimeout(function() {
                    resolve({
                        message: "Success"
                    });
                }, 500);
            });
        })
        .then(function(result) {
            return new Promise(function(resolve, reject) {
                console.log("*************************************************************");
                console.log("**************** Restarting network service. ****************");
                console.log("*************************************************************");
                var proc = exec("sudo systemctl restart networking", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    setTimeout(function() {
                        var str = "*************************************************************\n" +
                                  "**************** networking restart Completed! **************\n" +
                                  "*************************************************************\n";
                        console.log(str);
                        resolve({message : str});
                    }, 6000);
                });
            });
        })
        .then(function(result) {
            return new Promise(function(resolve, reject) {
                console.log("*************************************************************");
                console.log("*************** Restarting isc-dhcp-server. *****************");
                console.log("*************************************************************");
                var proc = exec("sudo systemctl restart isc-dhcp-server", function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                              "**************** isc-dhcp-server restart Completed! *********\n" +
                              "*************************************************************\n";
                    resolve({message : str});
                });
            });
        })
    }
}

function ubuntu_samba(password,path) {
    if (fs.existsSync("/etc/samba/smb.conf") === false) {
        return new Promise(function(resolve, reject) {
            var proc = exec("mkdir " + path + "; mkdir " + path + "/output", function(error, stdout) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });

            proc.stdout.on('data', function(data) {
                process.stdout.write(data);
            });

            proc.on('exit', function(code) {
                var str = "*************************************************************\n" +
                          "***************** mkdir mvt_video Completed! ****************\n" +
                          "*************************************************************\n";
                resolve({message : str});
            });
        })
        .then(function(msg) {
            console.log(msg.message);
            return new Promise(function(resolve, reject) {
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
                    resolve({message : str});
                });
            })
        })
        .then(function(msg) {
            console.log(msg.message);
            fs.appendFileSync('/etc/samba/smb.conf', '[share]\n');
            fs.appendFileSync('/etc/samba/smb.conf', 'browseable = yes\n');
            fs.appendFileSync('/etc/samba/smb.conf', 'path = ' + path + '\n');
            fs.appendFileSync('/etc/samba/smb.conf', 'guest ok = no\n');
            fs.appendFileSync('/etc/samba/smb.conf', 'writable = yes\n');

            return new Promise(function(resolve, reject) {
                 //新增帳號
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
                    resolve({message : str});
                });
            })
        })
        .then(function(msg) {
            console.log(msg.message);
            return new Promise(function(resolve, reject) {
                var proc = exec("chown -R mvt.mvt "+path, function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                              "**************** chown mvt.mvt Completed! ***************\n" +
                              "*************************************************************\n";
                    resolve({message : str});
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
                              "**************** systemctl restart Completed! ***************\n" +
                              "*************************************************************\n";
                              "*************************************************************\n" +
                              "****************** ubuntu_samba Completed! ******************\n" +
                              "*************************************************************\n";
                    resolve({message : str});
                });
            });
        })
        .catch(function(err) {
            console.log(err);
        });
    }
}

function iptables(card, outcard) {
    fs.writeFileSync('/home/route.sh', 'echo \"1\" > /proc/sys/net/ipv4/ip_forward\n');
    fs.appendFileSync('/home/route.sh', 'iptables -F\n');
    fs.appendFileSync('/home/route.sh', 'iptables -X\n');
    fs.appendFileSync('/home/route.sh', 'iptables -t nat -F\n');
    fs.appendFileSync('/home/route.sh', 'iptables -t nat -X\n');
    fs.appendFileSync('/home/route.sh', 'iptables -P INPUT DROP\n');
    fs.appendFileSync('/home/route.sh', 'iptables -P OUTPUT ACCEPT\n');
    fs.appendFileSync('/home/route.sh', 'iptables -P FORWARD ACCEPT\n');
    fs.appendFileSync('/home/route.sh', 'iptables -A INPUT -i lo -j ACCEPT\n');
    fs.appendFileSync('/home/route.sh', 'iptables -A OUTPUT -o lo -j ACCEPT\n');
    fs.appendFileSync('/home/route.sh', 'iptables -A INPUT -i ' + outcard + ' -j ACCEPT\n');
    fs.appendFileSync('/home/route.sh', 'iptables -A OUTPUT -o ' + outcard + ' -j ACCEPT\n');
    fs.appendFileSync('/home/route.sh', 'iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n');
    for (var i = 0; i < card.length; i++) {
        var j = 11 + i;
        var k = 8081 + i;
        var l = 8000 + i;
        var m = 1935 + i;
        var n = 8100 + i;
        fs.appendFileSync('/home/route.sh', 'iptables -t nat -A POSTROUTING -s 192.168.' + j + '.0/24 -o ' + outcard + ' -j MASQUERADE\n')
        fs.appendFileSync('/home/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + k + ' -j DNAT --to-destination 192.168.' + j + '.2:8080\n')
        fs.appendFileSync('/home/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + l + ' -j DNAT --to-destination 192.168.' + j + '.2:8000\n')
        fs.appendFileSync('/home/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + m + ' -j DNAT --to-destination 192.168.' + j + '.2:1935\n')
        fs.appendFileSync('/home/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + n + ' -j DNAT --to-destination 192.168.' + j + '.2:8100\n')
        fs.appendFileSync('/home/route.sh', 'iptables -A INPUT -s 192.168.' + j + '.0/24 -j ACCEPT\n')
    }

   // fs.appendFileSync('/home/route.sh', 'ufw disable\n');
    return new Promise(function(resolve, reject) {
        var proc = exec("chmod +x /home/route.sh; bash /home/route.sh", function(error, stdout) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });

        proc.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        proc.on('exit', function(code) {
            var str = "*************************************************************\n" +
                      "******************** iptables Completed! ********************\n" +
                      "*************************************************************\n";
            resolve({message : str});
        });
    });
}

function ubuntu_auto_start() {
    if (fs.existsSync("/etc/systemd/system/rc-local.service") === false) {
            fs.writeFileSync('/etc/systemd/system/rc-local.service', '[Unit]\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'Description=/etc/rc.local Compatibility\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'ConditionPathExists=/etc/rc.local\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', '[Service]\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'Type=forking\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'ExecStart=/etc/rc.local start\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'TimeoutSec=0\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'StandardOutput=tty\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'RemainAfterExit=yes\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'SysVStartPriority=99\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', '[Install]\n');
            fs.appendFileSync('/etc/systemd/system/rc-local.service', 'WantedBy=multi-user.target\n');

            fs.writeFileSync('/etc/rc.local', '#!/bin/sh -e\n');
            fs.appendFileSync('/etc/rc.local', '/home/route.sh\n');
            fs.appendFileSync('/etc/rc.local', 'exit 0\n');

            return new Promise(function(resolve, reject) {
                var proc = exec("chmod +x /etc/rc.local;systemctl enable rc-local.service", function(error) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                }); 

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                              "**************** ubuntu_auto_start Completed! ***************\n" +
                              "*************************************************************\n";
                    resolve({message : str});
                });
            });
    }
}

function ubuntu_dhcp_recover(card) {
    var totalcard = "";
    new Promise(function(resolve, reject) {
        var proc = exec("rm -rf /etc/dhcp/dhcpd.conf /etc/default/isc-dhcp-server /etc/network/interfaces /home/route.sh;cp /etc/dhcp/dhcpd.conf.bak /etc/dhcp/dhcpd.conf;cp /etc/network/interfaces.bak /etc/network/interfaces", function(error) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });

        proc.stdout.on('data', function(data) {
            process.stdout.write(data);
        });

        proc.on('exit', function(code) {
            var str = "*************************************************************\n" +
                      "******************** iptables Completed! ********************\n" +
                      "*************************************************************\n";
            resolve({message : str});
        });
    })
    .then(function() {
         for (var i = 0; i < card.length; i++) {
            var j = 11 + i;

            fs.appendFileSync('/etc/dhcp/dhcpd.conf', 'subnet 192.168.' + j + '.0 netmask 255.255.255.0 {\n');
            fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     range                           192.168.' + j + '.2 192.168.' + j + '.2;\n');
            fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option subnet-mask              255.255.255.0;\n');
            fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option broadcast-address        192.168.' + j + '.255;\n');
            fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option routers                  192.168.' + j + '.1;\n');
            fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option domain-name              "";\n');
            fs.appendFileSync('/etc/dhcp/dhcpd.conf', '     option domain-name-servers      8.8.8.8;\n');
            fs.appendFileSync('/etc/dhcp/dhcpd.conf', '   }\n');
            fs.appendFileSync('/etc/network/interfaces', 'auto ' + card[i] + '\n');
            fs.appendFileSync('/etc/network/interfaces', 'iface ' + card[i] + ' inet static\n');
            fs.appendFileSync('/etc/network/interfaces', 'address 192.168.' + j + '.1\n');
            fs.appendFileSync('/etc/network/interfaces', 'netmask 255.255.255.0\n');
            fs.appendFileSync('/etc/network/interfaces', '   \n');
            totalcard = totalcard + card[i] + " ";
        }

        fs.writeFileSync('/etc/default/isc-dhcp-server', 'INTERFACES="' + totalcard + '"');

        exec("sudo rm -rf /home/routh.sh; sudo systemctl restart networking;sudo systemctl restart isc-dhcp-server", function(error) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    })
    .catch(function(err) {
        if (err) {
            console.log(err);
        }
    })
}

module.exports = {
    ubuntu_update: ubuntu_update,
    ubuntu_install_mediainfo: ubuntu_install_mediainfo,
    ubuntu_dhcp: ubuntu_dhcp,
    iptables: iptables,
    ubuntu_samba: ubuntu_samba,
    ubuntu_auto_start: ubuntu_auto_start,
    ubuntu_dhcp_recover: ubuntu_dhcp_recover,
    install_driver: install_driver
}
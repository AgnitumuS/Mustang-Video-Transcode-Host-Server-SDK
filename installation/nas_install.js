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
var path = require('path');
var exec = require('child_process').exec;


function ubuntu_samba(password, path) {
    if (fs.existsSync("/etc/config/smb.conf") === true) {
        return new Promise(function(resolve, reject) {
                var proc = exec("chown -R mvt.administrators " + path, function(error, stdout) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });

                proc.stdout.on('data', function(data) {
                    process.stdout.write(data);
                });

                proc.on('exit', function(code) {
                    var str = "*************************************************************\n" +
                        "************* chown mvt.administrators Completed! ***********\n" +
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
}

function iptables(outcard) {
    var homePath = "/usr/local/mvt_data";
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
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A POSTROUTING -s 169.254.100.0/24 -o ' + outcard + ' -j MASQUERADE\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -A INPUT -s 169.254.100.0/24 -j ACCEPT\n')
}

function add_iptables(ip, outcard, ports) {

    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.nas + ' -j DNAT --to-destination ' + ip + ':8080\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.hls + ' -j DNAT --to-destination ' + ip + ':8000\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.rtmp + ' -j DNAT --to-destination ' + ip + ':1935\n')
    fs.appendFileSync(homePath + '/route.sh', 'iptables -t nat -A PREROUTING -p tcp -i ' + outcard + ' --dport ' + ports.icecast + ' -j DNAT --to-destination ' + ip + ':8100\n')
}

function exe_iptables() {
    return new Promise(function(resolve, reject) {
        var proc = exec("chmod +x " + homePath + "/route.sh; bash " + homePath + "/route.sh", function(error, stdout) {
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
            resolve({
                message: str
            });
        });
    });
}

function checkUsedPortsAndIncrementIdx(portNum, usedPorts, newOccupiedPorts) {
    while (usedPorts.indexOf(portNum) != -1 || newOccupiedPorts.indexOf(portNum) != -1) {
        portNum++;
    }
    var result = {
        portNum: portNum,
        newOccupiedPorts: newOccupiedPorts
    }
    return result;
}

module.exports = {
    iptables: iptables,
    add_iptables: add_iptables,
    exe_iptables: exe_iptables,
    ubuntu_samba: ubuntu_samba
}
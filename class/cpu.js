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

class CPU {
	constructor(id) {
		this.id = id;
		this.ipAddr = "";
		this.port = "9000";
		this.hostSideIPaddress = "";
		this.rtmpPort = "";
		this.httpPort = "";
		this.icecastPort = "";
		this.gstreamerPort = "9100";
		this.fayePort = "8300";
		this.qtsPort = "";
		this.processor = "";
		this.memory = "";
		this.mac = "";
		this.gpu = "";
	}

	cpuID() {
		return this.id;
	}

	setIPAddr(data) {
		this.ipAddr = data;
	}

	setPort(data) {
		this.port = data;
	}

	setHostSideIPaddress(data) {
		this.hostSideIPaddress = data;
	}

	setRtmpPort(data) {
		this.rtmpPort = data;
	}

	setHttpPort(data) {
		this.httpPort = data;
	}

	setIcecastPort(data) {
		this.icecastPort = data;
	}

	setGstreamerPort(data) {
		this.gstreamerPort = data;
	}

	setFayePort(data) {
		this.fayePort = data;
	}

	setQtsPort(data) {
		this.qtsPort = data;
	}

	setProcessor(data) {
		this.processor = data;
	}

	setMemory(data) {
		this.memory = data;
	}

	setMac(data) {
		this.mac = data;
	}

	setGPU(data) {
		this.gpu = data;
	}

	setConfig(obj) {
		this.ipAddr = obj.ipaddress == undefined ? this.ipAddr : obj.ipaddress;
		this.port = obj.port == undefined ? this.port : obj.port;
		this.hostSideIPaddress = obj.hostSideIPaddress == undefined ? this.hostSideIPaddress : obj.hostSideIPaddress;
		this.rtmpPort = obj.rtmpPort == undefined ? this.rtmpPort : obj.rtmpPort;
		this.httpPort = obj.httpPort == undefined ? this.httpPort : obj.httpPort;
		this.icecastPort = obj.icecastPort == undefined ? this.icecastPort : obj.icecastPort;
		this.gstreamerPort = obj.gstreamerPort == undefined ? this.gstreamerPort : obj.gstreamerPort;
		this.fayePort = obj.fayePort == undefined ? this.fayePort : obj.fayePort;
		this.processor = obj.processor == undefined ? this.processor : obj.processor;
		this.memory = obj.memory == undefined ? this.memory : obj.memory;
		this.mac = obj.mac == undefined ? this.mac : obj.mac;
		this.gpu = obj.gpu == undefined ? this.gpu : obj.gpu;
		this.qtsPort = obj.qtsPort == undefined ? this.qtsPort : obj.qtsPort;
	}

	getIPAddr() {
		return this.ipAddr;
	}

	getPort() {
		return this.port;
	}

	getHostSideIPaddress() {
		return this.hostSideIPaddress;
	}

	getRtmpPort() {
		return this.rtmpPort;
	}

	getHttpPort() {
		return this.httpPort;
	}

	getIcecastPort() {
		return this.icecastPort;
	}

	getGstreamerPort() {
		return this.gstreamerPort;
	}

	getFayePort() {
		return this.fayePort;
	}

	getQtsPort() {
		return this.qtsPort;
	}

	getProcessor() {
		return this.processor;
	}

	getMemory() {
		return this.memory;
	}

	getMac() {
		return this.mac;
	}

	getGPU() {
		return this.gpu;
	}
}

module.exports = CPU;
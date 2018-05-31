const dgram = require('dgram');
const DeviceHelper = require('./DeviceHelper');
const GatewayHelper = require('./GatewayHelper');
const DeviceMapsHelper = require('./DeviceMapsHelper');
const DeviceParser = require('./DeviceParser');
const utils = require('./utils');

const defaultConfig = {
    iv: Buffer.from([0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58, 0x56, 0x2e]),
    multicastAddress: '224.0.0.50',
    multicastPort: 4321,
    serverPort: 9898,
    bindAddress: '' // needs to be set when the device has multiple networks
};

class MiAqara {

    /**
     * @param gateways Gateway list, support for arrays or objects
     * @param opts Service configuration information
     * */
    constructor (gateways, opts) {
        // Service configuration information
        opts = opts ? Object.assign({}, defaultConfig, opts) : defaultConfig;
        this.multicastAddress = opts.multicastAddress;
        this.multicastPort = opts.multicastPort;
        this.serverPort = opts.serverPort;
        this.bindAddress = opts.bindAddress;
        this.debug = opts.debug ? opts.debug : false;

        // Reading device count
        this.readCount = 0;

        // Events
        this.onReady = opts.onReady;
        this.onMessage = opts.onMessage;

        this.deviceMapsHelper = new DeviceMapsHelper();
        this.gatewayHelper = new GatewayHelper(this);
        this.deviceHelper = new DeviceHelper(this);
        this.parser = DeviceParser;

        if (Array.isArray(gateways)) {
            for (let i=0; i<gateways.length; i++) {
                this.gatewayHelper.addOrUpdate({
                    iv: gateways[i].iv || defaultConfig.iv,
                    sid: gateways[i].sid,
                    password: gateways[i].password
                });
            }
        } else if (utils.isObject(gateways)) {
            this.gatewayHelper.addOrUpdate({
                iv: gateways.iv || defaultConfig.iv,
                sid: gateways.sid,
                password: gateways.password
            });
        } else {
            throw new Error('Param error');
        }
    }

    start () {
        // Initialize the SDK
        this.createSocket();
        this.initServerSocket();
        this.sendWhoisCommand();
    }

    stop () {
        this.serverSocket.close();
    }

    createSocket () {
        this.serverSocket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });
    }

    initServerSocket () {
        let serverSocket = this.serverSocket;
        let that = this;

        serverSocket.on('error', function(err){
            if (this.debug) {
                console.error('error, msg - %s, stack - %s\n', err.message, err.stack);
            }
        });

        serverSocket.on('listening', function(){
            if (this.debug) {
                console.info(`server is listening on port ${that.serverPort}.`);
            }
            if (!that.bindAddress) {
                serverSocket.addMembership(that.multicastAddress);
            } else {
                serverSocket.setMulticastInterface(that.bindAddress);
                serverSocket.addMembership(that.multicastAddress, that.bindAddress);
            }
        });
        serverSocket.on('message', this.parseMessage.bind(this));

        serverSocket.bind(this.serverPort);
    }

    parseMessage (msg, rinfo) {
        let data;
        try {
            data = JSON.parse(msg); // msg is a Buffer
            if (data.hasOwnProperty('data')) {
                data.data = JSON.parse(data.data);
            }
        } catch (e) {
            if (this.debug) {
                console.error('Bad message: %s', msg);
            }
            return;
        }
        let cmd = data['cmd'];

        if (this.debug) {
            console.log('[Message] cmd: %s, msg: ', cmd, msg.toString());
        }

        if (cmd === 'iam') { // whois callback
            this.gatewayHelper.uploadBySid(data.sid, data);
            this.gatewayHelper.getIdList(data.sid); // Update child device list
        } else if(cmd === 'get_id_list_ack') { // get_id_list callback
            this.gatewayHelper.uploadBySid(data.sid, data);
            this.deviceMapsHelper.addOrUpdate(data.sid, data.data); // Update the mapping relationship between the gateway and child devices
            this.deviceHelper.readAll(data.data); // Batch reading sub device details
            this.readCount += data.data.length;
        } else if (cmd === 'report') { // Equipment status report
            this._addOrUpdate(data);
        } else if (cmd === 'read_ack') { // read callback
            this._addOrUpdate(data);
            this.readCount--;
            if (this.readCount === 0) { // Read all devices, trigger onRead event
                this.onReady && this.onReady(data);
            }
        } else if (cmd === 'write_ack') { // write callback
            this._addOrUpdate(data);
        } else if(cmd === 'server_ack') { // Gateway common reply, such as sending message JSON parsing error, will reply this event
            // todo
        } else if (cmd === 'heartbeat') {  // Heartbeat package
            /**
             * The gateway sends every 10 seconds, mainly updating the gateway token
             * Heartbeat of the child device. The plug-in device sends it once every 10 minutes and once every other hour.
             * */
            this._addOrUpdate(data);
        }

        this.onMessage && this.onMessage(data);
    }

    _addOrUpdate (data) {
        if (!data) {
           return;
        }
        if (data['model'] === 'gateway') { // Gateway
            this.gatewayHelper.uploadBySid(data.sid, data);
        } else { // Child equipment
            this.deviceHelper.addOrUpdate(data);
        }
    }

    /**
     * Send message
     * @param {String} ip
     * @param {String} port
     * @param {Object} msg Message object
     * */
    send (ip, port, msg) {
        if (!ip || !port || !msg) {
            throw new Error('Param error');
        }
        let msgStr = utils.messageFormat(msg);
        if (this.debug) {
            console.log("[Send] msg: %s", msgStr);
        }
        this.serverSocket.send(msgStr, 0, msgStr.length, port, ip);
    }

    /**
     * Gateway device discovery (device discovery is not encrypted)
     * Multicast mode
     * */
    sendWhoisCommand () {
        this.send(this.multicastAddress, this.multicastPort, {
            cmd: 'whois'
        });
    }
}

module.exports = MiAqara;
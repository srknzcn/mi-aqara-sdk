/**
 * Gateway assistance class
 * Manage multiple gateways
 */
const Gateway = require('./Gateway');
const utils = require('./utils');

class GatewayHelper {
    constructor (platform) {
        if (!platform) {
            throw new Error('[GatewayHelper:constructor] Param error');
        }
        this.gateways = {}; // Gateway list, sid->Gateway
        this.platform = platform;
    }

    /**
     * Add to
     * */
    add (gateway) {
        if (!gateway || !gateway.sid || this.gateways.hasOwnProperty(gateway.sid)) {
            return;
        }
        this.gateways[gateway.sid] = gateway;
    }

    addOrUpdate (data) {
        let sid = data.sid;
        if (this.gateways.hasOwnProperty(sid)) {
            let gateway = this.gateways[sid];
            gateway.update(data);
        } else {
            this.gateways[sid] = new Gateway(data);
        }
    }

    /**
     * Remove
     * */
    remove (sid) {
        delete this.gateways[sid];
    }

    /**
     * Find gateways based on sid
     **/
    getBySid (sid) {
        return this.gateways[sid];
    }

    /**
     * Update the properties of the gateway based on the sid
     * */
    uploadBySid (sid, data) {
        if (this.gateways.hasOwnProperty(sid)) {
            let gateway = this.gateways[sid];
            gateway.update(data);
        }
    }

    /**
     * Get an array of gateway lists
     * */
    getGatewayList () {
        let list = [];
        for (let key in this.gateways) {
            let value = this.gateways[key];
            list.push(value);
        }
        return list;
    }

    getAll () {
        return this.gateways;
    }

    /**
     * Query sub device id list
     * */
    getIdList (sid) {
        console.log('[GatewayHelper:getIdList] sid:%s', sid);
        let gateway = this.getBySid(sid);
        if (gateway) {
            this.platform.send(gateway.ip, gateway.port, {
                cmd: 'get_id_list'
            });
        } else {
            console.error('[GatewayHelper:getIdList] sid:%s is not exit', sid);
        }
    }

    /**
     * Reading equipment
     *
     * @param {String} sid Gateway device ID
     * */
    read (sid) {
        console.log('[GatewayHelper:read] sid=%s', sid);
        let gateway = this.getBySid(sid);
        if (gateway) {
            this.platform.send(gateway.ip, gateway.port, {
                cmd: 'read',
                sid: sid
            });
        } else {
            console.error('[GatewayHelper:read] sid:%s can not find gateway', sid);
        }
    }

    /**
     * Write device
     *
     * @param {String} sid Gateway device ID
     * @param {Object} data Write data to the gateway
     * */
    write (sid, data) {
        console.log('[GatewayHelper:write] sid=%s', sid);
        let gateway = this.getBySid(sid);
        if (gateway) {
            let msg = {
                cmd: 'write',
                model: 'gateway',
                sid: gateway.sid,
                data: Object.assign({}, data)
            };
            // Encrypted string
            msg.data.key = utils.cipher(gateway.token, gateway.password, gateway.iv);
            this.platform.send(gateway.ip, gateway.port, msg);
        } else {
            console.error('[GatewayHelper:read] sid:%s can not find', sid);
        }
    }

    /**
     * Control gateway lantern
     * HSB color mode
     * @param sid Gateway device ID
     * @param {Boolean} power switch
     * @param hue Hue
     * @param saturation Saturation
     * @param brightness Brightness
     * */
    controlLight({sid, power, hue, saturation, brightness}) {
        let prepValue = 0;
        if(power) {
            if(!hue) {
                hue = 0;
            }
            if(!saturation) {
                saturation = 0 * 100;
            }
            if(!brightness) {
                brightness = 50;
            }
            let rgb = utils.hsb2rgb([hue, saturation/100, 1]);
            prepValue = parseInt(utils.dec2hex(brightness, 2) + utils.dec2hex(rgb[0], 2) + utils.dec2hex(rgb[1], 2) + utils.dec2hex(rgb[2], 2), 16);
        }
        this.write(sid, {rgb: prepValue});
    }
}

module.exports = GatewayHelper;
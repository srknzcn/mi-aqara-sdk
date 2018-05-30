/**
 * Sub-devices & Sensors
 * */
class Device {
    constructor ({model, sid, short_id, data}) {
        this.model = model; // Equipment model
        this.sid = sid; // Device ID
        this.short_id = short_id; // Short id of zigbee device
        this.data = data; // 设备信息，状态，电量等等
    }

    /**
     * Quickly update current object properties
     * */
    update (data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) { // Can only update already defined properties
                this[key] = data[key];
            }
        }
    }
}

module.exports = Device;
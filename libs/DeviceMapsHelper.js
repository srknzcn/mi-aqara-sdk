/**
 * Gateway and Child Device Mapping Management
 */
class DeviceMapsHelper {
    constructor () {
        this.deviceMaps = {}; // Gateway and child device mappings, gatewaySid->[sid,sid2...]
    }

    addOrUpdate (gatewaySid, deviceSids) {
        this.deviceMaps[gatewaySid] = deviceSids;
    }

    remove (gatewaySid) {
        delete this.deviceMaps[gatewaySid];
    }

    /**
     * Find Device ID List Based on Gateway ID
     * @return {Array}
     * */
    getDeviceSids (gatewaySid) {
        return this.deviceMaps[gatewaySid];
    }

    /**
     * Finding the gateway ID based on the device ID
     * */
    getGatewaySidByDeviceSid (deviceSid) {
        for (let gatewaySid in this.deviceMaps) {
            let deviceIds = this.deviceMaps[gatewaySid];
            for (let i=0; i<deviceIds.length; i++) {
                if (deviceIds[i] === deviceSid) {
                    return gatewaySid;
                }
            }
        }
        return null;
    }

    getAll () {
        return this.deviceMaps;
    }
}

module.exports = DeviceMapsHelper;
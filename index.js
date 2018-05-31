const MiAqara = require('mi-aqara2-sdk/libs/MiAqara');

let miAqaraSDK = {
    _miAqara: null,
    _start: false,
    create (gateways, opts) {
        this._miAqara = new MiAqara(gateways, opts);
        this.extend();
    },
    start () {
        this._miAqara.start();
        this._start = true;
    },
    stop () {
        this._miAqara.stop();
        this._start = false;
    },
    extend () {
        let miAqara = this._miAqara;
        let gatewayHelper = miAqara.gatewayHelper;
        let deviceHelper = miAqara.deviceHelper;
        
        this.parser = miAqara.parser;
        this.getGatewayBySid = gatewayHelper.getBySid.bind(gatewayHelper);
        this.getGatewayList = gatewayHelper.getGatewayList.bind(gatewayHelper);
        this.controlLight = gatewayHelper.controlLight.bind(gatewayHelper);
        this.write = gatewayHelper.write.bind(gatewayHelper);
        this.getDeviceBySid = deviceHelper.getBySid.bind(deviceHelper);
        this.getDevicesByGatewaySid = deviceHelper.getDevicesByGatewaySid.bind(deviceHelper);
        this.getDevicesByGatewaySidAndModel = deviceHelper.getDevicesByGatewaySidAndModel.bind(deviceHelper);
        this.getDevicesByModel = deviceHelper.getDevicesByModel.bind(deviceHelper);
        this.getDeviceList = deviceHelper.getDeviceList.bind(deviceHelper);
        this.change = deviceHelper.change.bind(deviceHelper);
        this.playTone = gatewayHelper.playTone.bind(gatewayHelper);
    }
};

module.exports = miAqaraSDK;
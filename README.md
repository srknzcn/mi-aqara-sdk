# mi-aqara2-sdk

This repo forked from zzyss86/mi-aqara-sdk

Thanks to jsonzhou


## Background
`mi-aqara-sdk` communicates only in the LAN. The protocols or mechanisms used are: udp protocol, multicast, AES encryption and decryption.


## Usage

### Installation

	npm install --save-dev mi-aqara2-sdk
	
### Usage

	const MiAqara = require('mi-aqara2-sdk');
	MiAqara.create(gateways, opts); // Create
	MiAqara.start(); // Start

## Interface

### create(gateways, opts) Create SDK Service

- gateways
	- sid: gateway device ID (see the end of the document for how to obtain it)
	- password: gateway password (acquisition method see the end of the text)
	- iv: [Optional] Encrypt the initial vector with default values
- opts Options
	- multicastAddress: Multicast IP, default：224.0.0.50
	- multicastPort: multicast port, default: 4321
	- serverPort: service listening port, default: 9898
	- bindAddress 
	- onReady: gateway and child devices are ready, multiple gateways may be called multiple times
	- onMessage: all message callbacks

#### Examples

		MiAqara.create([{
		    sid: '7811dcb28bde',
		    password: '**A68343AD********'
		}], {
		    onReady (msg) { // gateway and child devices have been found
		        // console.log('onReady', msg);
		    },
		    onMessage (msg) { message(s) received
		        // console.log('onMessage', msg);
		    }
		});
		
#### Event`onReady`,`msg` structure example in `onMessage`

	{
		"cmd": "read_ack",
		"model": "switch",
		"sid": "158d0001bf542b",
		"short_id": 2124,
		"data": "{\"voltage\":3012}"
	}
	
#### `cmd` Enumeration list (message type)

- iam: Gateway response packet
- get_id_list_ack: message response when gateway looks up child device list
- report: automatically when the status of gateways and sub-devices changes
- read_ack: message response when reading device
- write_ack: message response when writing device
- heartbeat: heartbeat packets, which are sent by the gateway every 10 seconds, mainly to update the gateway token. Heartbeat of the child device. The plug-in device sends it once every 10 minutes and once every other hour.
- server_ack common reply, such as JSON parsing of the sent message, will reply this event
		
### start() Start, normally start immediately after creation

	MiAqara.start();

### getGatewayBySid(sid) Find gateway object based on gateway device ID

	MiAqara.getGatewayBySid('7811dcb28bde')
	
### getGatewayList() Get an array of all the gateways

	MiAqara.getGatewayList();
	
### controlLight(opts) Controls the gateway light

- opts.sid: Gateway device ID
- opts.power: Power state
- opts.hue: HUE
- opts.saturation: SATURATION
- opts.brightness BRIGHTNESS

### playTone(opts) Plays tone on gateway

- opts.sid: Gateway device ID
- opts.mid: Tone OD
- opts.vol: Tone volume

* Available tones:
     * 0 - Police car 1
     * 1 - Police car 2
     * 2 - Accident
     * 3 - Countdown
     * 4 - Ghost
     * 5 - Sniper rifle
     * 6 - Battle
     * 7 - Air raid
     * 8 - Bark
     * 9 - None
     * 10 - Doorbell
     * 11 - Knock at a door
     * 12 - Amuse
     * 13 - Alarm clock
     * 14 - None
     * 15 - None
     * 16 - None
     * 17 - None
     * 18 - None
     * 19 - None
     * 20 - MiMix
     * 21 - Enthusiastic
     * 22 - GuitarClassic
     * 23 - IceWorldPiano
     * 24 - LeisureTime
     * 25 - ChildHood
     * 26 - MorningStreamLiet
     * 27 - MusicBox
     * 28 - Orange
     * 29 - Thinker
     * 10000 - MUTE
     * 10001 - Alarm Sound 3
     * 10002 - Beep 2x
     * 10003 - Time beep 3x
     * 10004 - Alarm Sound 1
     * 10005 - Alarm Sound 2
     * 10006 - Time beeps long

#### Turn off the light
	MiAqara.controlLight({sid:'7811dcb28bde',power:false});

#### Turn on the light
	MiAqara.controlLight({sid:'7811dcb28bde',power:true});
	
### getDeviceBySid(sid) Get an array of all child devices (sensors)

	MiAqara.getDeviceBySid('158d0001b8849f');
	
### getDevicesByGatewaySid(gatewaySid) Finds the child device list based on the gateway ID

	MiAqara.getDevicesByGatewaySid('7811dcb28bde')；
	
### getDevicesByGatewaySidAndModel(gatewaySid, model) Finds the child device list based on the gateway ID and child device model

#### Get all switching devices under the gateway

	MiAqara.getDevicesByGatewaySidAndModel('7811dcb28bde', 'switch');
	
#### Sub-device model and Chinese-English name comparison

The following key is model (model)

	const DEVICE_MAP = {
	    'gateway': {name:'Gateway', name_cn:'网关'},
	    'magnet': {name:'ContactSensor', name_cn:'门窗磁传感器'},
	    'motion': {name:'MotionSensor', name_cn:'人体感应'},
	    'switch': {name:'Button', name_cn:'按钮'},
	    'sensor_ht': {name:'TemperatureAndHumiditySensor', name_cn:'温度湿度传感器'},
	    'ctrl_neutral1': {name:'SingleSwitch', name_cn:'单按钮墙壁开关'},
	    'ctrl_neutral2': {name:'DuplexSwitch', name_cn:'双按钮墙壁开关'},
	    'ctrl_ln1': {name:'SingleSwitchLN', name_cn:'单按钮墙壁开关零火版'},
	    'ctrl_ln2': {name:'DuplexSwitchLN', name_cn:'双按钮墙壁开关零火版'},
	    '86sw1': {name:'SingleButton86', name_cn:'86型无线单按钮开关'},
	    '86sw2': {name:'DuplexButton86', name_cn:'86型无线双按钮开关'},
	    'plug': {name:'PlugBase', name_cn:'插座'},
	    '86plug': {name:'PlugBase86', name_cn:'86型墙壁插座'},
	    'cube': {name:'MagicSquare', name_cn:'魔方'},
	    'smoke': {name:'SmokeDetector', name_cn:'烟雾警报器'},
	    'natgas': {name:'NatgasDetector', name_cn:'天然气警报器'},
	    'curtain': {name:'ElectricCurtain', name_cn:'电动窗帘'},
	    'sensor_magnet.aq2': {name:'ContactSensor2', name_cn:'门磁感应 第二代'},
	    'sensor_motion.aq2': {name:'MotionSensor2', name_cn:'人体感应 第二代'},
	    'sensor_switch.aq2': {name:'Button2', name_cn:'按钮 第二代'},
	    'weather.v1': {name:'TemperatureAndHumiditySensor2', name_cn:'温度湿度传感器 第二代'},
	    'sensor_wleak.aq1': {name:'WaterDetector', name_cn:'水浸传感器'}
	};

### getDevicesByModel(model) Get all corresponding child devices based on model

#### All switch devices, including upper child devices mounted on different gateways

	MiAqara.getDevicesByModel('switch')
	
### getDeviceList() Get all child device list data

	MiAqara.getDeviceList()
	
### change ({sid, gatewaySid, model, data}) Child Device Status Change

- change({sid,data}) changes the state of the specified device (child device ID: sid)
- change({gatewaySid, model, data}) Change the state of sub-devices of the specified model mounted under the specified gateway
- change({model, data}) Change the status of all specified model sub-devices

## Other instructions

### First, the device state `data` structure description (part)
	
#### Door and Window Magnetic Sensor (model: magnet)
	{
		"status": "close" //close:关闭; open:打开
	}

#### Body Sensor (model: motion)

	{
		"status": "motion" // motion: someone moved
	}
	// Or
	{
		"no_motion" "120" // 120 seconds nobody moves
	}
	
#### Switch / Button (model: switch)

	{
		"status": "click"  //click:click; double_click:double click
	}

#### Temperature and Humidity Sensor (model: sensor_ht)

	{
		"temperature": "1741",
		"humidity": "7593"
	}

#### One Button Wall Switch (model: ctrl_neutral1)

	{
		"channel_0": "on"
	}

#### Two Button Wall Switch (model: ctrl_neutral2)

	{
		"channel_0": "on",
		"channel_1": "off"
	}

#### Single Button Wall Switch Zero Fire Version (model: ctrl_ln1)

	{
		"channel_0": "on"
	}

#### Two Button Wall Switch Zero Fire Version (model: ctrl_ln2)

	{
		"channel_0": "on",
		"channel_1": "off"
	}

#### Type 86 Wireless Single Button Switch (model: 86sw1)

	{
		"channel_0": "click" //click:click; double_click:double click
	}

#### Model 86 wireless two-button switch (model: 86sw2)

	{
		"channel_0": "click" //click:click; double_click:double click
		"channel_1": "click" //click:click; double_click:double click
	}

#### Socket (model: plug)

	{
		"status": "on" 
	}

#### Socket (model: 86plug)

	{
		"status": "on"
	}

#### Cube (model: cube)

	{
		"status": ""
	}

Status Values:
- move
- flip180
- tap_twice
- shake_air
- flip90

#### Smoke sensor (model: smoke)

	{
		"alarm": "0" // 0，1，2
	}

#### Gas sensor (model: natgas)

	{
		"alarm": "0" // 0，1，2
	}

#### Curtain (model: curtain)

	{
		"curtain_level": ""
	}

#### Magnetic induction second generation (model: sensor_magnet.aq2)

	{
		"status": "close"
	}

#### Human Sensor Second Generation (model: sensor_motion.aq2)

	{
		"status": "motion" //Motion: someone moves
	}
	// 或
	{
		"no_motion" "120" //120 seconds nobody moved
	}

#### Button/Switch Second Generation (model: sensor_switch.aq2)

	{
		"status": "click" //click:click; double_click:double_click
	}

#### Temperature and humidity sensor Second generation (model: weather.v1)

	{
		"temperature": "1741",
		"humidity": "7593"
	}

#### Water Sensor (model: sensor_wleak.aq1)

	{
		"status": "leak" //leak:Flooding; no_leak:No flooding
	}
	
### Get the gateway sid and password

#### 1. Open Mijia APP - Click Multifunction Gateway - Click '...' in the upper right corner to enter settings - About

![](https://raw.githubusercontent.com/zzyss86/mi-aqara-sdk/master/images/1.jpeg)
![](https://raw.githubusercontent.com/zzyss86/mi-aqara-sdk/master/images/2.jpeg)
![](https://raw.githubusercontent.com/zzyss86/mi-aqara-sdk/master/images/3.jpeg)

#### 2. Click quickly in the space below the page until the hidden menu appears

![](https://raw.githubusercontent.com/zzyss86/mi-aqara-sdk/master/images/4.jpeg)
![](https://raw.githubusercontent.com/zzyss86/mi-aqara-sdk/master/images/5.jpeg)


#### 3. Click - LAN communication protocol, open and copy randomly generated password

![](https://raw.githubusercontent.com/zzyss86/mi-aqara-sdk/master/images/6.jpeg)

#### 4. Click-gateway information

![](https://raw.githubusercontent.com/zzyss86/mi-aqara-sdk/master/images/7.jpeg)

The string behind mac= is the gateway's SID. Remove the ":" and convert it to lowercase.



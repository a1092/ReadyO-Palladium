var PalladiumClient = require('palladium'); 
var gpio = require('rpi-gpio');
var config = require('./config.json');


var palladium = new PalladiumClient(config.palladium, config.spotify.palladium);
palladium.connect();



for(var key in config.pi.outputs) {
	
    channel = outputs[key];
    gpio.setup(channel, gpio.DIR_OUT);
}


palladium.on("fr/readyo/palladium/output/open", function(data) {

	self = this;

	if(config.pi.outputs.hasOwnProperty(data.channel)) {

		channel = config.pi.outputs[data.channel];

		gpio.write(channel, true, function(err) {
	        if (err) {
	        	
				palladium.send("fr/readyo/palladium/system/error", {
					"message": err
				});

	        	console.log('[ERROR] Failed to open a channel '+channel+':'+err);
	        	return;
	        }

        	palladium.send("fr/readyo/palladium/system/info", {
				"message": 'The channel '+channel+' was successful opened.'
			});

	        console.log('[INFO] The channel '+channel+' was successful opened.');

	    });
	}
});

palladium.on("fr/readyo/palladium/output/close", function(data) {
	
	self = this;

	if(config.pi.outputs.hasOwnProperty(data.channel)) {

		channel = config.pi.outputs[data.channel];

		gpio.write(channel, false, function(err) {
	        if (err) {
	        	
				palladium.send("fr/readyo/palladium/system/error", {
					"message": err
				});

	        	console.log('[ERROR] Failed to close a channel '+channel+':'+err);
	        	return;
	        }

        	palladium.send("fr/readyo/palladium/system/info", {
				"message": 'The channel '+channel+' was successful closed.'
			});

	        console.log('[INFO] The channel '+channel+' was successful closed.');

	    });
	}
});

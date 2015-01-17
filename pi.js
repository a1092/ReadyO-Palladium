var PalladiumClient = require('palladium'); 
var logger = require('logger');
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

				logger.error("Failed to open a channel "+channel+" : "+err, { app: "pi" });

	        	return;
	        }

        	palladium.send("fr/readyo/palladium/system/info", {
				"message": 'The channel '+channel+' was successful opened.'
			});

        	logger.info("The channel "+channel+" was successful opened.", { app: "pi" });

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

				logger.error("Failed to close a channel "+channel+" : "+err, { app: "pi" });
	        	return;
	        }

        	palladium.send("fr/readyo/palladium/system/info", {
				"message": 'The channel '+channel+' was successful closed.'
			});

        	logger.info("The channel "+channel+" was successful closed.", { app: "pi" });

	    });
	}
});

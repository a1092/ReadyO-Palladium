var PalladiumClient = require('palladium'); 
var logger = require('logger');
var gpio = require('rpi-gpio');
var config = require('./config.json');


var palladium = new PalladiumClient(config.pi.palladium);
palladium.connect(config.palladium);


for(var key in config.pi.outputs) {
	
    channel = config.pi.outputs[key];
    gpio.setup(channel, gpio.DIR_OUT);
}



/*
*	Export GPIO to control Outputs
*/
gpio.on('export', function(channel) {

	setTimeout(function() {

		gpio.write(channel, true, function(err) {
			if(err) {
				palladium.send("fr/readyo/palladium/system/error", { "message": err });
				logger.error('Failed to close a channel '+channel+':'+err, { app: "pi" });
			} else {
				palladium.send("fr/readyo/palladium/system/info", { "message": 'The channel '+channel+' was successful closed.' });
				logger.info('The channel '+channel+' was successful closed.', { app: "pi" });
			}
		});

	}, 1000);
});



palladium.on("fr/readyo/palladium/output/open", function(raw) {

	self = this;

	if(config.pi.outputs.hasOwnProperty(raw.data.channel)) {

		channel = config.pi.outputs[raw.data.channel];

		gpio.write(channel, false, function(err) {
	        if (err) {
				palladium.send("fr/readyo/palladium/system/error", { "message": err });
				logger.error('Failed to open the channel '+channel+':'+err, { app: "pi" });
	        } else  {
	        	palladium.send("fr/readyo/palladium/system/info", { "message": 'The channel '+channel+' was successful opened.' });
	        	logger.info('The channel '+channel+' was successful opened.', { app: "pi" });
		    }
	    });
	}
});




palladium.on("fr/readyo/palladium/output/close", function(raw) {
	
	self = this;

	if(config.pi.outputs.hasOwnProperty(raw.data.channel)) {

		channel = config.pi.outputs[raw.data.channel];

		gpio.write(channel, true, function(err) {
	        if (err) {
				palladium.send("fr/readyo/palladium/system/error", { "message": err });
				logger.error('Failed to close a channel '+channel+':'+err, { app: "pi" });
	        } else {
	        	palladium.send("fr/readyo/palladium/system/info", { "message": 'The channel '+channel+' was successful closed.' });
				logger.info('The channel '+channel+' was successful closed', { app: "pi" });
	        }
	    });
	}
});
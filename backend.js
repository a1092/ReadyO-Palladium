var PalladiumClient = require('palladium'); 
var logger = require('logger');
var config = require('./config.json');
var unirest = require("unirest");


var palladium = new PalladiumClient(config.backend.palladium);
palladium.connect(config.palladium, function() {
	
	setTimeout(checkSchedule, 3000);
});



palladium.on("fr/readyo/palladium/live/authenticate/check", function(raw) {


	var data = raw.data;
	var reference = raw.data;

	backend("/live/authenticate/check", {
		userAgent: data.userAgent,
		token: data.token,
		ip: data.ip
	}, function(response){

		if(response.code == 200) {
			palladium.send("fr/readyo/palladium/live/authenticate/success", { 
				"userid": response.body.userid,
				"username": response.body.username,
				"firstname": response.body.firstname,
				"lastname": response.body.lastname,
				"picture": response.body.picture
			}, raw.reference);
		} else if(response.code == 401) {

			palladium.send("fr/readyo/palladium/live/authenticate/fail", {}, raw.reference);
		} else {
			logger.error(response.body, { app: "backend" });
		}
	});
});


palladium.on("fr/readyo/palladium/music/playing", function(raw) {

	if(raw.data.playing == true) {

		backend("/music/playing", {
			track: raw.data.media.track.name,
			track_spotify: raw.data.media.track.spotify,
			artist: raw.data.media.artist.spotify,
			artist_spotify: raw.data.media.artist.spotify,
			album: raw.data.media.album.spotify,
			album_spotify: raw.data.media.album.spotify
		}, function(response){
			if(response.code != 200)
				console.log(response.body);
		});
	}
});


palladium.on("fr/readyo/palladium/live/message/emit", function(raw) {

	backend("/live/message/receive", {
		userid: raw.data.userid,
		message: raw.data.message
	}, function(response){
		if(response.code == 200)
			palladium.send("fr/readyo/palladium/live/message/receive", response.body, raw.reference);
		else
			console.log(response.body);
	});

});

function checkSchedule() {
	console.log("checkSchedule");
	backend("/schedule/status", {
	}, function(response){
		
		if(response.code != 200) {
			console.log(response.body);	
		} else {
			
			if(response.body.action == "starting") {
				
				palladium.send("fr/readyo/palladium/webradio/schedule/begining", response.body.schedule);

				for(channelid in response.body.channels) {
					palladium.send("fr/readyo/palladium/output/open", response.body.channels[channelid]);
				}

				if(response.body.spotify != "") 
					palladium.send("fr/readyo/palladium/music/play", {"spotify" : response.body.spotify });

			} else {

				palladium.send("fr/readyo/palladium/webradio/schedule/ending", response.body.schedule);

				for(channelid in response.body.channels) {
					palladium.send("fr/readyo/palladium/output/close", response.body.channels[channelid]);
				}

				if(response.body.spotify != "") 
					palladium.send("fr/readyo/palladium/music/stop", {});
			}
		}

		setTimeout(checkSchedule, 60000);
	});


	
}


function backend(path, data, cb) {
	
	unirest
		.post(config.general.backend.protocol+'://'+config.general.backend.host+'/api/palladium'+path)
		.send(data)
		.end(cb)
	;
}
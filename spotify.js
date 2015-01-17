var PalladiumClient = require('palladium');
var SpotifyClient = require('spotify'); 
var config = require('./config.json');



var palladium = new PalladiumClient(config.palladium, config.spotify.palladium);
palladium.connect();

var spotify = new SpotifyClient(config.spotify.desktop, config.general);
spotify.connect();


palladium.on("fr/readyo/palladium/music/play", function(data) {
	spotify.emit("com/spotify/remote/play", data.spotify);
});

palladium.on("fr/readyo/palladium/music/pause", function(data) {
	spotify.emit("com/spotify/remote/pause", true);
});

palladium.on("fr/readyo/palladium/music/unpause", function(data) {
	spotify.emit("com/spotify/remote/pause", false);
});

palladium.on("fr/readyo/palladium/music/next", function(data) {
	spotify.emit("com/spotify/remote/next");
});

palladium.on("fr/readyo/palladium/music/previous", function(data) {
	spotify.emit("com/spotify/remote/previous");
});

spotify.on("com/spotify/player/status", function(data) {
	palladium.send("fr/readyo/palladium/music/playing", data);
});
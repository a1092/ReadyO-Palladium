var PalladiumClient = require('palladium');
var SpotifyClient = require('spotify'); 
var config = require('./config.json');



var palladium = new PalladiumClient(config.spotify.palladium);
palladium.connect(config.palladium);

var spotify = new SpotifyClient(config.spotify.desktop, config.general);
spotify.connect();


palladium.on("fr/readyo/palladium/music/play", function(raw) {
	spotify.emit("com/spotify/remote/play", raw.data.spotify);
});

palladium.on("fr/readyo/palladium/music/pause", function(raw) {
	spotify.emit("com/spotify/remote/pause", true);
});

palladium.on("fr/readyo/palladium/music/stop", function(raw) {
	spotify.emit("com/spotify/remote/pause", true);
});

palladium.on("fr/readyo/palladium/music/unpause", function(raw) {
	spotify.emit("com/spotify/remote/pause", false);
});

palladium.on("fr/readyo/palladium/music/next", function(raw) {
	spotify.emit("com/spotify/remote/next");
});

palladium.on("fr/readyo/palladium/music/previous", function(raw) {
	spotify.emit("com/spotify/remote/previous");
});

palladium.on("fr/readyo/palladium/music/volume/set", function(raw) {
	exec('amixer -q sset Master '+raw.data.volume+'%');
});

spotify.on("com/spotify/player/status", function(data) {
	palladium.send("fr/readyo/palladium/music/playing", data);
});
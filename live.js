var PalladiumClient = require('palladium');
var config = require('./config.json');
var http = require('http');
var url = require('url');
var fs = require('fs');
var logger = require('logger');


var palladium = new PalladiumClient(config.live.palladium);
palladium.connect(config.palladium); 

var clients = new Array();
var schedule = null;
var music = null;

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    
    var path = url.parse(req.url).pathname; 

    res.writeHead(200, {
		"Access-Control-Allow-Origin": "*",
    	"Content-Type": "text/html",
    });

    if(path == "/onair") {
    	fs.readFile("LiveTemplate/OnAir.html", 'utf-8', function(error, content) {
	        res.end(content);
	    });
    } else {
	    fs.readFile("index.html", 'utf-8', function(error, content) {
	        res.end(content);
	    });
	}
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

/*******************************************************************************************************
*											Authentication
********************************************************************************************************/
io.sockets.on('connection', function (socket) {
	
	/* Authentication */
	clients[socket.id] = {
		authenticated: false
	};

	if(!("token" in socket.handshake.query)) {
		console.log("No token");
		return;
	}

	if(!("user-agent" in socket.request.headers)) {
		console.log("No user-agent");
		return;
	}

	palladium.send("fr/readyo/palladium/live/authenticate/check", {
		"token": socket.handshake.query["token"],
		"userAgent": socket.request.headers["user-agent"],
		"ip": socket.handshake.address
	}, socket.id);

	socket.on('disconnect', function() {

    	if(!(socket.id in clients && clients[socket.id].authenticated == true)) return; 
  
    	broadcast('fr/readyo/palladium/live/users/disconnect', clients[socket.id].user);

    	delete clients[socket.id]; 
	});


	socket.on('fr/readyo/palladium/live/echo', function (data) {
		broadcast('fr/readyo/palladium/live/echo', data);
    });

    socket.on('fr/readyo/palladium/live/message/emit', function (data) {

    	if(!(socket.id in clients && clients[socket.id].authenticated == true)) return; 
    	
    	
		palladium.send("fr/readyo/palladium/live/message/emit", {
			"userid": clients[socket.id].user.id,
			"message": data.message
		});
    });

    socket.on('fr/readyo/palladium/live/message/receive', function (data) {
		broadcast('fr/readyo/palladium/live/message/', data);
    });
});



palladium.on("fr/readyo/palladium/live/authenticate/success", function(raw) {
	
	userid = raw.data.userid;
	socketid = raw.reference;

	io.to(socketid).emit("fr/readyo/palladium/live/authenticate/success");
	
	clients[socketid] = {
		authenticated: true,
		user: {
			id: raw.data.userid,
			username: raw.data.username,
		//	firstname: data.firstname,
		//	lastname: data.lastname,
			picture: raw.data.picture
		}
	};

	io.to(socketid).emit("fr/readyo/palladium/live/users/list", getUserList());
	io.to(socketid).emit("fr/readyo/palladium/webradio/schedule", schedule);
	io.to(socketid).emit("fr/readyo/palladium/music/playing", music);

	broadcast('fr/readyo/palladium/live/users/connect', clients[socketid].user);
});

palladium.on("fr/readyo/palladium/live/authenticate/fail", function(raw) {
	
	socketid = raw.reference;

	io.to(socketid).emit("fr/readyo/palladium/live/authenticate/fail", {
		message: "Bad credentials"
	});

	clients[socketid] = {
		authenticated: false
	};
});


palladium.on("fr/readyo/palladium/live/message/receive", function(raw) {
	
	broadcast('fr/readyo/palladium/live/message/receive', raw.data);
});


palladium.on("fr/readyo/palladium/webradio/schedule/begining", function(raw) {
	
	schedule = raw.data;
	broadcast('fr/readyo/palladium/webradio/schedule', raw.data);
});

palladium.on("fr/readyo/palladium/webradio/schedule/ending", function(raw) {
	
	schedule = null;
	music = null;

	broadcast('fr/readyo/palladium/webradio/schedule', schedule);
	broadcast('fr/readyo/palladium/music/playing', music);
});

palladium.on("fr/readyo/palladium/music/playing", function(raw) {

	if(schedule) {
		if(raw.data.playing) {
			music = raw.data.media;
		} else {
			music = {};
		}

		broadcast('fr/readyo/palladium/music/playing', music);
	}
});





function getUserList() {

	user_list = {};

	for (var socketid in clients) {
		if(clients[socketid].authenticated)
			user_list[clients[socketid].user.id] = clients[socketid].user;
	}

	return user_list;
}

function broadcast(topic, data) {
	for (var socketid in clients) {
		if(clients[socketid].authenticated) {
			io.to(socketid).emit(topic, data);
		}
	}
}

server.listen(config.live.port);

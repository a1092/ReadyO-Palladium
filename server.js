var http = require("http");
var unirest = require("unirest");
var config = require('./config.json');


var topics = {
	path: [],
	log: []
};

// Création du serveur WEB
var server = http.createServer(function(req, res) {
	res.writeHead(200, {
		"Access-Control-Allow-Origin": "*",
		"Content-Type": "text/html",
	});

	res.end("Running");
}).listen(8888);


/*
*	Reinitialisation du Palladium coté Backend
*/
backend("/restart", {}, function(response){
	console.log("Palladium System restart.");


	if(response.code == 200) {

		console.log("Palladium restart success.");

		for(tindex in response.body.topics) {
			var topic = response.body.topics[tindex];

			topics.path.push(topic.path);

			if(topic.log)
				topics.log.push(topic.path);
		}

		var io = require('socket.io').listen(server);

		io.sockets.on('connection', function (socket) {

			socket.authenticated = false;

			var onevent = socket.onevent;
			socket.onevent = function(packet) {

				var args = packet.data || [];

				if (null != packet.id) args.push(socket.ack(packet.id));

				var topic = args[0];
				var data = args[1];
				
				console.log(data);

				if(socket.palladium && socket.palladium.authenticated) {
					console.log("[Broadcast]", topic, JSON.stringify(data));

					io.to(topic).emit(topic, data);

					if(topics.log.indexOf(topic)) {
			
						backend("/log", { 
							topic: topic,
							data: JSON.stringify(data.data),
							reference: JSON.stringify(data.reference),
							application: socket.palladium.application.id
						}, function(response){
							//console.log(response.body);
						});
					
					}
				}

				onevent.apply(socket, arguments);
			};


			socket.on("fr/readyo/palladium/register", function(raw) {
				console.log("fr/readyo/palladium/register");
				
				if(raw.data.privateKey) {
					backend("/application/connect", { "privateKey" : raw.data.privateKey }, function(response){

						if(response.code == 200) {
							console.log("Authentication success");

							socket.palladium = {
								authenticated: true,
								application: response.body,
								subscribtions: raw.data.subscribtions
							};

							for(sindex in raw.data.subscribtions) {
								var subscribtion = raw.data.subscribtions[sindex];
								var pattern = new RegExp(subscribtion);
								
								for(tindex in topics.path) {
									
									var topic = topics.path[tindex];

									if(topic.match(pattern)) {
										
										console.log(socket.palladium.application.name+" : Souscription pour : "+topic);
										socket.join(topic);
									}
								}
							}

						} else {
							console.log(response.body.message);
						}
						

					});
				} else {
					console.log("Bad private key");
				}
			});

			socket.on('disconnect', function() {
				if(socket.palladium && socket.palladium.application) {
					backend("/application/disconnect", { "appId" : socket.palladium.application.id }, function(response){
						console.log(socket.palladium.application.name+" was disconnected.")
					});
				}
			});
		});




		
	} else {

		console.log("Palladium restart failed.");
		console.log(response.body);
		console.log(response.code);
	}

});







function backend(path, data, cb) {
	
	unirest
		.post(config.general.backend.protocol+'://'+config.general.backend.host+'/api/palladium'+path)
		.send(data)
		.end(cb)
	;
}
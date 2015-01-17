ReadyO - Bus Palladium
========================

Bienvenue dans les clients du Bus Palladium de l'association Ready'O Efrei.

1) Installation de la solution
----------------------------------

Afin de pouvoir utiliser les clients, vous devez au préalable installer les composants NPM nécessaires.

### Général

    npm install ws


### Raspberry PI

	npm install rpi-gpio


### Musique

	npm install unirest

3) Fichier de configuration
----------------------------------

	{
		"general": {
			"proxy": ""
		},
		"palladium": {
			"host": "localhost",
			"port": "8000", 
			"channel": "palladium"
		},
		"spotify": {
			"palladium": {
				"privateKey": "",
				"subscribtions": [
					"^fr/readyo/palladium/music"
				]
			},
			"desktop": {
				"protocol": "http",
				"host": "localhost",
				"port": "4381"
			}
		},
		"pi": {
			"palladium": {
				"privateKey": "",
				"subscribtions": [
					"^fr/readyo/palladium/output"
				]
			},
			"outputs": {
				"2": "7",
				"3": "11",
				"XX": "13",
				"YY": "15"
			}
		},
		"icecast": {
			"palladium": {
				"privateKey": "",
				"subscribtions": [
				]
			}
		}
	}


2) Lancement des clients
----------------------------------

### Raspberry PI
	nodejs pi.js


### Musique
	nodejs spotify.js
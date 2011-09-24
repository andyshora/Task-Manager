var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function(request, response){
  
  
  var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './webroot/index.html';
		
	var extname = path.extname(filePath);
	var contentType = 'text/html';

	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	
	path.exists(filePath, function(exists) {
  		if (exists) {
  		
	  		fs.readFile(filePath, function(error, content){
	    		if (error) {
						response.writeHead(500);
						response.end();
					}
					else {
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					}
	    	});
    	} else {
			response.writeHead(404);
			response.end();
		}
    
	
  		
  
  });
  
});
server.listen(8080);



var nowjs = require("now");
var everyone = nowjs.initialize(server, {socketio: {transports: ['xhr-polling', 'jsonp-polling', 'htmlfile']}});


nowjs.on('connect', function(){
  this.now.room = "Room 1";
  //nowjs.getGroup(this.now.room).addUser(this.user.clientId);
  console.log(this.now.username + " joined with color " + this.now.color);
  // notify all other users that a new person has joined the room
  everyone.now.CreateUser(this.now.username, this.now.color);
  // get other users to send this user a beacon
  everyone.now.SendBeacon(this.now.username);

});


nowjs.on('disconnect', function(){
  console.log("Left: " + this.now.username);
  everyone.now.RemoveUser(this.now.username);
});
/*
everyone.now.changeRoom = function(newRoom){
  nowjs.getGroup(this.now.room).removeUser(this.user.clientId);
  nowjs.getGroup(newRoom).addUser(this.user.clientId);
  this.now.room = newRoom;
  this.now.receiveMessage("SERVER", "You're now in " + this.now.room);
};
*/
everyone.now.sv_CreateUser = function(username, color){
	console.log("Broadcasting user:" + username + " with color:" + color);
  	//nowjs.getGroup(this.now.room).now.CreateUser(username, color);
  	everyone.now.CreateUser(username, color);
};

everyone.now.sv_RequestBeacons = function(username){
	console.log(username + " has joined, requesting beacons from other users.");
  	everyone.now.SendBeacon(username);
};

everyone.now.sv_SendBeacon = function(new_username, username, color){
	console.log(username + " is sending a beacon to " + new_username);
  	everyone.now.ReceiveBeacon(new_username, username, color);
};

everyone.now.sv_ChangeColor = function(username, color){
	console.log(username + " is changing their to " + color);
  	everyone.now.ChangeColor(username, color);
};




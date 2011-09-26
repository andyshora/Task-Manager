var http = require('http');
var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');

var app = http.createServer(function(request, response){
  
  	var filePath = '.' + request.url,	
  	contentType = 'text/html',
	extname = path.extname(filePath);
  
  	// default document
	if (filePath == './')
		filePath = './webroot/index.html';
		
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	
	// serve up a static file
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
  /*
  	// check for list url
	if (filePath.match(/.\/[a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9][a-zA-Z0-9](\/|$)/)){
		// we've matched a URL with 7 alphanumeric characters which is a list URL
		console.log("list URL matched: " + filePath);

		// todo
		
		fs.readFile("templates/list.html", function(error, content){
	    		if (error) {
						response.writeHead(500);
						response.end();
					}
					else {
						// need to do a lookup here and populate a template file with the stored items
						// content = populateTemplate(content, filePath);
						
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					}
	    	});
	}
*/
  
  
  
});
app.listen(8080);

// define instance of mongoDB
var mdb = new mongo.Db('lists', new mongo.Server("127.0.0.1", 27017, {}));
// open db connection
mdb.open(function(err, p_client){});



var nowjs = require("now");
var everyone = nowjs.initialize(app);


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

everyone.now.functionname = function(str){

};

everyone.now.addToList = function(code, str, position, username){
	// insert new item into a list
	itm = { url:code, itm:str, pos:position, usr:username, date:new Date() };
	db.list.save(j);

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

everyone.now.sv_AddToList = function(text, username){
	console.log(username + " is adding task: " + text);
  	everyone.now.AddToList(text, username);
};

/*
LIST
{
	_id: 0,
	nam: '',
	cre: new Date(),
	ip: '',
	src: '',
	url: '',
	ron: ''
}
ITEM
{
	_id: 0,
	itm: '',
	cre: '',
	url: '',
	pos: 0,
	own: '',
	com: [{
		usr: '',
		com: '',
		cre: new Date(),
	}],
	cre: new Date(),
	pri: 'normal',
	due: new Date(),
	sta: 'open'
}


*/


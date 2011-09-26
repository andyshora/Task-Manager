var express = require('express');
var ItemProvider = require('./itemprovider-mongodb').ItemProvider;
var nowjs = require("now");
var http = require('http');
var fs = require('fs');
var path = require('path');

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/webroot'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//var itemProvider= new ItemProvider();
var itemProvider = new ItemProvider('localhost', 27017);

app.get('/', function(req, res){

	var filePath = '.' + req.url,	
  	contentType = 'text/html',
	extname = path.extname(filePath);

    // default document
	if (filePath == './')
		filePath = './webroot/list.html';
		
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
						res.writeHead(500);
						res.end();
					}
					else {
						res.writeHead(200, { 'Content-Type': contentType });
						res.end(content, 'utf-8');
					}
	    	});
    	} else {
			res.writeHead(404);
			res.end();
		}

  	});

});

app.get('/items', function(req, res){

    itemProvider.findAll(function(error,docs){
        res.render('items.jade', { locals: {
            title: 'Items',
            items:docs
            }
        });
    });
    
});

app.get('/items/new', function(req, res) {
    res.render('item_new.jade', { locals: {
        title: 'New Item'
    }
    });
});

app.post('/items/new_form', function(req, res){
    itemProvider.save({
        itm: req.param('item'),
        usr: req.param('username')
    }, function(error, docs) {
        res.redirect('/items');
    });
});

app.post('/items/new', function(req, res){
    itemProvider.save({
        itm: req.param('item'),
        usr: req.param('username')
    }, function(error, docs) {
    	var content = {status:true};
        res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(content, 'utf-8');
    });
});



app.post('/upload', function(req, res){
    upload_file(req, res);
});

app.listen(8080);


var everyone = nowjs.initialize(app);

/*
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
*/
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



function upload_file(req, res) {
  req.setBodyEncoding('binary');

  var stream = new multipart.Stream(req);
  stream.addListener('part', function(part) {
    part.addListener('body', function(chunk) {
      var progress = (stream.bytesReceived / stream.bytesTotal * 100).toFixed(2);
      var mb = (stream.bytesTotal / 1024 / 1024).toFixed(1);

      sys.print("Uploading "+mb+"mb ("+progress+"%)\015");

      // chunk could be appended to a file if the uploaded file needs to be saved
    });
  });
  stream.addListener('complete', function() {
    res.sendHeader(200, {'Content-Type': 'text/plain'});
    res.sendBody('Thanks for playing!');
    res.finish();
    sys.puts("\n=> Done");
  });
}
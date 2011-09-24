//include our modules
var sys   = require('sys');
var http  = require('http');
var url   = require('url');
var path = require( "path" );
var fileSystem = require( "fs" );
 
//require custom dispatcher
var dispatcher = require('./lib/dispatcher.js');
 
console.log('Starting server @ http://127.0.0.1:1337/');
 
var server = http.createServer(function (req, res) {
  //wrap calls in a try catch
  //or the node js server will crash upon any code errors
  try {
    //pipe some details to the node console
    console.log('Incoming Request from: ' +
                 req.connection.remoteAddress +
                ' for href: ' + url.parse(req.url).href
    );
    
 
    //dispatch our request
    dispatcher.dispatch(req, res); 
 
  } catch (err) {
    //handle errors gracefully
    sys.puts(err);
    res.writeHead(500);
    res.end('Internal Server Error: ' + err);
  }  
 
});

server.listen(1337, "127.0.0.1", function() {
  //runs when our server is created
  console.log('Server running at http://127.0.0.1:1337/');
});


// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
 
 
// Create a local memory space for further now-configuration.
(function(){
 
// Now that we have our HTTP server initialized, let's configure
// our NowJS connector.
var nowjs = require( "now" );
 
 
// After we have set up our HTTP server to serve up "Static"
// files, we pass it off to the NowJS connector to have it
// augment the server object. This will prepare it to serve up
// the NowJS client module (including the appropriate port
// number and server name) and basically wire everything together
// for us.
//
// Everyone contains an object called "now" (ie. everyone.now) -
// this allows variables and functions to be shared between the
// server and the client.
var everyone = nowjs.initialize( server );
 
 
// Create primary key to keep track of all the clients that
// connect. Each one will be assigned a unique ID.
var primaryKey = 0;
 
 
// When a client has connected, assign it a UUID. In the
// context of this callback, "this" refers to the specific client
// that is communicating with the server.
//
// NOTE: This "uuid" value is NOT synced to the client; however,
// when the client connects to the server, this UUID will be
// available in the calling context.
everyone.connected(
function(){
this.now.uuid = ++primaryKey;
}
);
 
 
// Add a broadcast function to *every* client that they can call
// when they want to sync the position of the draggable target.
// In the context of this callback, "this" refers to the
// specific client that is communicating with the server.
everyone.now.syncPosition = function( position ){
 
// Now that we have the new position, we want to broadcast
// this back to every client except the one that sent it in
// the first place! As such, we want to perform a server-side
// filtering of the clients. To do this, we will use a filter
// method which filters on the UUID we assigned at connection
// time.
everyone.now.filterUpdateBroadcast( this.now.uuid, position );
 
};
 
 
// We want the "update" messages to go to every client except
// the one that announced it (as it is taking care of that on
// its own site). As such, we need a way to filter our update
// broadcasts. By defining this filter method on the server, it
// allows us to cut down on some server-client communication.
everyone.now.filterUpdateBroadcast = function( masterUUID, position ){
 
// Make sure this client is NOT the same client as the one
// that sent the original position broadcast.
if (this.now.uuid == masterUUID){
 
// Return out of guard statement - we don't want to
// send an update message back to the sender.
return;
 
}
 
// If we've made it this far, then this client is a slave
// client, not a master client.
everyone.now.updatePosition( position );
 
};
 
})();
 
 
// ---------------------------------------------------------- //
// ---------------------------------------------------------- //
#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('chatApp:server');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var events = require('events');
var eventEmitter = new events.EventEmitter();
app.get('/user/change', function(req, res){
  res.sendFile(__dirname + '../views/user.hjs');
});
/* GET users listing. */
io.on('connection', function (socket) {
  console.log("Socket connection is done");
  socket.on('user',function(data){

    console.log(data + " came online");

    io.emit('chat message', data +" came online");
  
    socket.user = data; // Allocating a socket variable.


});
	  //Emits which User is typing
	  socket.on('is typing', function (data) {
  
		  socket.emit('chat message', data + " is typing");
    console.log(data+" is typing");
	  });
  
	  //Emits the message of a particular user with identity
	  socket.on('chat message', function (msg) {
  
  
		 socket.emit('chat message', socket.user + ' : ' + msg);
	  console.log("this is the message log");
  
	  });
  
	  //Emits notifications whenever user leaves the chat with the information who left.
	  socket.on('disconnect', function () {
  
		  console.log("some user left the chat");
  
		  socket.emit('chat message', socket.user + " left the chat");
  
	  }); //end socket disconnected.
  
  });//end of io connection.

/**
 * Get port from environment and store in Express.
 */
  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(3000);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

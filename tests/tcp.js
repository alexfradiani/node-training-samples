/**
 * Prueba de TCP server
 * little chat server
 */

var tcp = require('net');

var server = tcp.createServer(serverControl);

var sockets = [];

server.listen(3000);

function serverControl(socket) {
	sockets.push(socket);

	socket.write('hello there!!\n');
	socket.write('this is a simple TCP chat made in Node.js\n');

	socket.on('data', function(data) {
		//send chat response to everybody connected
		for(var i = 0; i < sockets.length; i++) {
			if(sockets[i] == socket)  //Dont write to myself...
				continue;	
			sockets[i].write(data);
		};
	});

	socket.on('end', function() {
		var i = sockets.indexOf(socket);
		sockets.splice(i, 1);
	});
}
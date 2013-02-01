/**
 * FIRST TEST
 * this is a simple web server
 */

//Require the webserver library
var http = require('http');

var server = http.createServer(function(req, res) {
	res.writeHead(200, { 'content-type' : 'text-plain' });
	res.write('Testing-probando\n');

	//Asynchronous behavior
	setTimeout(function() {
		res.end('Async!\n');
	}, 2000);
});

server.listen(3000);
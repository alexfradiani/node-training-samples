/**
 * Demonstration of multi tasking capabilities
 */

var http = require('http');

///One loop
setInterval(function() {
	console.log('Hello');
}, 2000);

//Another loop
setInterval(function() {
	console.log('Getting data from my site');

	http.get({host: 'www.fradiani.com'}, function(res) {
		console.log(res.headers);
	});
}, 3000);

//Now a super complex webserver
var server = http.createServer(function(req, res) {
	res.writeHead(200);
	setTimeout(function() {
		res.end('Sending async data via console - Webserver also working\n');
	}, 1000);
});

server.listen(3000);

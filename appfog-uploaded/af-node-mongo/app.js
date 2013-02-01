/**
 * CONEX and http server
 */
var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var http = require('http');

/**
 * SERVER--------------------------------------------------------------------------------------------------------------
 */

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('Here we will use node and mongodb for testing stuff...\n\n');

    print_visits(req, res);

    //connecting with mongodb
    recordVisit(req, res);

    res.write('Node server running over AF\n');
}).listen(port, host);
/**
 * --------------------------------------------------------------------------------------------------------------------
 */

/**
 * DETERMINAR ENVIRONMENT
 * WE CAN BE LOCALLY OR IN APPFOG 
 * 
 */
if(process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else {
    var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"visit-tracker-db"
    }
}
var generate_mongo_url = function(obj) {
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password) {
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else {
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}
var MONGO_URL = generate_mongo_url(mongo);


/**
 *  GRABAR LAS VISITAS EN MONGODB
 */
function recordVisit(req, res) {
	var mongodb = require('mongodb');

	console.log('RES 1' + res);
	mongodb.connect(MONGO_URL, function(err, conn) { onDbConnected(req, res, err, conn); } );
}

/**
 * CALLBACK de conexion a bd
 */
function onDbConnected(req, res, err, conn) {
	conn.collection('ips', function(err, coll) {
        /* Simple object to insert: ip address and date */
        var object_to_insert = { 'ip': req.connection.remoteAddress, 'ts': new Date() };
       
        /* Insert the object then print in response */
        /* Note the _id has been created */
        coll.insert(object_to_insert, {safe:true}, function(err) {
	        res.write('SAVED OBJ: ' + JSON.stringify(object_to_insert));
	        res.end('\n');
        });
    });
}

var print_visits = function(req, res) {
    /* Connect to the DB and auth */
    require('mongodb').connect(MONGO_URL, function(err, conn) {
        conn.collection('ips', function(err, coll) {
            coll.find({}, {limit:10, sort:[['_id','desc']]}, function(err, cursor) {
                cursor.toArray(function(err, items) {
                    res.write('Latest Visits:\n');
                    for(i=0; i < items.length; i++) {
                        printRow(res, JSON.stringify(items[i]));
                    }
                });
            });
        });
    });
}

//DAR ALGO DE FORMATO
function printRow(res, str) {
    var html =
        '<div style="background-color:#fff; padding:15px;">'+
            str +
        '</div>';

    res.write(html);
}


module.exports = function(app, log) {
	
	var graph = require('fbgraph');
	var mongodb = require('mongodb');

	//set of data going to the render
	var viewData = {};

	/**
	 * GET STUFF FROM THE USER...
	 */
	app.get('/dashboard', function(req, res) {
        //console.log('ACCCESS TOKEN (FROM DASHBOARD):' + req.session.user.access_token);
        
        graph.setAccessToken(req.session.user.access_token);  //Habilitar graph con el access token
        
        //ME stuff first
        graph.get("me", function(err, data) { meCallBack(req, res, err, data); });
    });

    function meCallBack(req, res, err, data) {
        console.log(data.name); //respuesta obtenida
        
		viewData.username = data.name;
		viewData.forMongo = 'user: ' + data.id + ', ' + data.name + ', ' + data.link;

        //My picture now
        graph.get("me/picture", function(err, data) { picCallBack(req, res, err, data); });
    }

    function picCallBack(req, res, err, data) {
    	viewData.user_pic = data.location;
    	//console.log(err);
    	//console.log(data);
    	graph.get("me/friends", function(err, data) { friendsCallBack(req, res, err, data); });
    }

	function friendsCallBack(req, res, err, data) {
		//console.log(data);

		viewData.friends = data.data;

		//MONGO test
	    mongoserver = new mongodb.Server('localhost', '27017'),
	    db_connector = new mongodb.Db('fb-test', mongoserver);

		db_connector.open(function(err, conn) {
			console.log(conn);
			db_connector.collection('userdata', function(err, coll) {
				var obj = {udata: viewData.forMongo};

				coll.insert(obj, {safe:true}, function(err) {
				    console.log(err);
				    console.log('saved!');

				    res.render('dashboard', { viewData: viewData, storedUser: viewData.forMongo });
		        });
			});
		});
	}

	/**
	 * POST STATUS TO USER WALL
	 */
	app.post('/postStatus', function(req, res) {
		console.log('post status called');
		console.log(req);

		graph.post("me/feed", {message: req.body.str}, function(err, data) { onPostStatus(err, data, req, res); });
	});

	function onPostStatus(err, data, req, res) {
		console.log('msg posted callback');
		res.end('response');
	}

	/**
	 * SEARCH PAGES FOR A STRING
	 */
	 app.get('/searchPages', function(req, res) {
	 	console.log(req);
	 	graph.get("search", {type: 'page', q:req.query.str}, function(err, data) { onPagesResult(err, data, req, res); });
	 });

	 function onPagesResult(err, data, req, res) {
	 	console.log('search results callback');
	 	console.log(data);

		res.json(200, data.data);
	 }
}
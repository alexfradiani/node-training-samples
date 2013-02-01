/**
 * APP PARA PROBAR CONEX CON
 * FACEBOOK API DESDE NODE
 */

var fb = require('facebook-js');  //I'm using this one only for authentication
var graph = require('fbgraph');   //And this one for api calls,  i should merge that...

var jade = require('jade');

var express = require('express');
var app = express();

var store = new express.session.MemoryStore;  /*Session por memoria, esto debe ser ajustado*/

/*
	VARIABLES DEPENDIENTES DEL ENTORNO
 */
var REDIRECT_URI = 'http://localhost:8080/auth/fb';
var CLIENT_ID = '416233508452639';
var APP_SECRET = '2a36f6805cb198023b2f631099c44260';


/**  CONFIG------------------------------------------------------------------------------------------------------------------------
*/
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
	secret: 'fb-miniapp', 
	store: store 
}));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//Incluir el dashboard
require('./dashboard')(app);

// routing
app.get('/', function (req, res) {	
	res.sendfile(__dirname + '/index.html');
});

/**
 * Login page
 */
app.get('/login', function(req, res) {
    //console.log('trying to login:' + new Date());
    res.redirect(fb.getAuthorizeUrl({
        client_id: CLIENT_ID, //put the client id
        redirect_uri: REDIRECT_URI, //cambiar si es necesario
        scope: 'offline_access,publish_stream,read_stream,user_photos'
    }));
});

/**
 * Luego de recibida la respuesta
 */
app.get('/auth/fb', function(req, res) {
    //console.log('response from fb: ' + new Date());

    fb.getAccessToken(CLIENT_ID, //clientid
        APP_SECRET, //app secret
        req.param('code'),
        'http://localhost:8080/auth/fb', //cambiar si es necesario
        function (error, access_token, refresh_token) {
            if(error) {
                log.debug('error getting access token:' + error);
                throw new Error('Error getting the acccess token');
            }
            console.log('trying to get the tokens:' + new Date());
            req.session.user = {};
            req.session.user.access_token = access_token;
            req.session.user.access_token_secret = refresh_token;
            
            //console.log('ACCCESS TOKEN:' + req.session.user.access_token);

            res.redirect('/dashboard');
            /**
             * LLAMADA AL API
             */
            // graph.setAccessToken(access_token);
            // graph.get("me/picture", function(err, data) {
            //     console.log(data); // { id: '4', name: 'Mark Zuckerberg'... }

            //     res.end('the wheel is moving');
            // });
        }
    );
});

app.listen(8080);
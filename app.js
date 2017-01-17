var express = require('express'), http = require('http');
var app = express();
var path = require('path');
var fs = require('fs');
var config = require('./config'); // should look into making this work
//var routes = require('./routes');
var session = require('express-session');

var db;

var cloudant;

var bodyParser = require('body-parser');

// all environments
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); // true doesn't/does (I forgot) support nested data structures
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public/style'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(session({
	secret: 'bunny buddy',
	resave: true,
	saveUninitialized: false,
	//store: , // default is MemoryStore instance which is not for production
	//rolling: true, // set cookie on every response. expiration set to original maxAge
	cookie: {
		maxAge: 60000 // 60000 is one minute
	}
}));

//app.use('/', routes);

function initDBConnection() {
	
	if(process.env.VCAP_SERVICES && false) {
		// instanceName is required if I have more than one Cloudant service
		var cloudant = require('cloudant')({vcapServices: JSON.parse(process.env.VCAP_SERVICES)}, function(err, cloudant) {
			if( err)
				return console.log('Failed to initialize Cloudant: ' + err);

			// check if DB exists if not create
			cloudant.db.create(config.dbCredentials.dbName, function(err, res) {
				if (err) console.log( err.message);
			});

			db = cloudant.use(config.dbCredentials.dbName);
		});

		// Pattern match to find the first instance of a Cloudant service in
		// VCAP_SERVICES. If you know your service key, you can access the
		// service credentials directly by using the vcapServices object.
		// for(var vcapService in vcapServices){
		//  if(vcapService.match(/cloudant/i)){
		// 		dbCredentials.host = vcapServices[vcapService][0].credentials.host;
		// 		//etc.
		// 	}
		// }

		if(db===null) { //strict equality
			console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
		}
	} else{
		console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
		// For running this app locally you can get your Cloudant credentials 
		// from Bluemix (VCAP_SERVICES in "cf env" output or the Environment 
		// Variables section for an app in the Bluemix console dashboard).
		// Alternately you could point to a local database here instead of a 
		// Bluemix service.

		cloudant = require('cloudant')(config.dbCredentials.url);
		
		//check if DB exists if not create
        cloudant.db.create(config.dbCredentials.dbName, function (err, res) {
        	if (err) { console.log( err.message); }
         	else {
           		var obj = { //need to check if missing params
					"_id": "asdf",
					"username": "asdf",
					"email": "asdf@asdf.asdf",
					"password": "asdf",
					"admin": true,
					"timecreated": new Date().toUTCString()
				};
				db.insert(obj);
			}
		});
            
        db = cloudant.use(config.dbCredentials.dbName);
	}
}

initDBConnection();

requireLogin = function (req, res, next) { // login middleware
	if (!req.session || !req.session.user) {
		res.redirect('/login');
	} else {
		next();
	}
};

requireAdmin = function( req, res, next) {
	if(!req.session.admin)
		res.redirect('/dashboard');
	else
		next();
};

app.get('/session', function(req,res) {
	res.send(req.session);
});

app.get('/', function (req, res) {
	console.log("Got a GET request for the homepage");
	res.render('main');
	//res.send('There\'s nothing here');
});

app.get('/login', function(req, res) {
	console.log("Got a GET request for the loginpage");
	res.render('login');
});

app.get('/logout', function(req, res) {
	console.log("Got a GET request for the LOGOUT");
	req.session.destroy(function(err) {
		if(err) console.log("LOGOUT error");
		res.redirect('/login');
	});
});

app.get('/register', requireLogin, requireAdmin, function(req, res) {
	console.log("Got a GET request for the registerpage");
	res.render('register');
});

app.get('/dashboard', requireLogin, function(req, res) {
	console.log("Got a GET request for the /dashboard");
	if( req.session.admin)
		res.render('adminboard');
	else
		res.send("Dashboard here for non-admins");
});

app.get('/profile', requireLogin, function(req, res) {
	console.log("Got a GET request for the profilepage");
	res.send('PROFILE PAGE HERE LMAOOOOOOO');
});

app.get('/dbinit', function (req, res) {
	console.log("Got a GET request for the notpage");

	 db.insert({username:"bunny", email:"example@example.com", password:"buddy"}, "bugs", function(err, data) {
  	if (!err)
     	console.log(data);
	});

	db.list(function(err,body){
		if(!err) {
			body.rows.forEach(function(doc) {
      			console.log(doc);
    		});
		}
	});

	//db.get("bunny", function(err,body) {
 	//if (!err)
    //	console.log(body.last);
	//});

	// db.list(function(err, allDbs) {
 // 		res.send('All my databases: %s', allDbs.join(', '));
	// });

	// var docs = db.allDocs(function(err, res) {
	// })

	// db.index(function(er, result) {
 //  		if (er) {
 //   			throw er;
 // 		}
 		
	// res.send('The database has ' + result.indexes.length + ' indexes');
 // 	});
 

});

// This responds a POST request for the loginpage
app.post('/login', function (req, res) {
	console.log("Got a POST request for the loginpage");
	//console.log(req.body);

	validate( req.body.username, req.body.password, function(err,message) {
		if( err) res.status(err).send(message); // will need an error handler
		else {
			//var longmessage = req.body.username + ' has logged in successfully <a href="login">Login</a>';
			//longmessage = longmessage + '</br></br>account created: ' + message;
			//res.redirect('/login');

			req.session.user = req.body.username;
			req.session.admin = message;

			//console.log('did I send headers?' + res.headersSent); // false
			res.redirect('/dashboard');
			//res.status(200).send(token);

		}
	});

 	//res.status(401).send('<h1>failed login</h1><a href="login">try again</a>');
	// }

	//res.json(req.body);
});

app.post('/register', requireLogin, requireAdmin, function (req, res) {
	console.log("Got a POST request for the registerpage");

	usertaken( req.body.username, function(err, message) {
		if( err) {
			res.status(err).send(message);
		} else {
			var obj = { //need to check if missing params
				"_id": req.body.username,
				"username": req.body.username,
				"email": req.body.email,
				"password": req.body.password,
				"admin": false,
				"timecreated": new Date().toUTCString()
			};

			db.insert(obj, function(err, body){
				if(err) {
					res.status(500).send("cannot insert document into database"); // will need an error handler
				} else {
					console.log(req.body.username + ' account created');
					res.status(200).send(req.body.username + ' has been created<a href="login">Login</a>');
				}
			});	
		}

	});

});

function validate( user, pass, callback) {
	db.list(function(err, data) { //list ids of documents in db
  		if (err)
  			return callback(500, "cannot list documents in database");
  		else{
  			console.log(data.rows[0]);
  			db.get(user,function(err,doc){ //get the document
      			if(err)
      				return callback(401, "username doesn't exist");
      			else {
  					if( doc.password == pass) {
  						console.log("User login success");
  						return callback(null, doc.admin);
  					} else {
  						console.log("User's password is wrong");
  						return callback(401,"password is wrong");
  					}  
       			}
      		});
  		}
  	});
}

function usertaken( user, callback) {
	db.list(function(err, data) { //list ids of documents in db
  		if (err)
  			callback(500, "cannot list documents in database");
  		else{
      		db.get(user,function(err,body){ //get the document
      			if(err)
      				callback(null);
      			else
      				callback(401,"username already taken");
      		});
    	}
  	
	});
}

app.listen(config.port);
console.log('Express server listening on port ' + config.port);

// http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
// 	console.log('Express server listening on port ' + app.get('port'));
// });
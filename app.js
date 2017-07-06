var express = require('express'), app = express(), http = require('http');
var path = require('path'), fs = require('fs');

var config = require('./config/config.js'); // I think this is how a config file should work
var db = require('./database');


// Configure jade as template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static content from "public" directory
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname + 'views'))); // to serve any file in this folder


// middleware
var bodyParser = require('body-parser'); // needed to touch body
var session = require('express-session');
var CloudantStore = require('connect-cloudant-store')(session);
var store = new CloudantStore({
	url: config.dbURL
});
var passport = require('passport');
require('./config/auth.js'); // initialize

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // populates object with key-value pairs. value can be string or array when extended: false, or any type when extended: true.
app.use(session({
	store: store,
	secret: 'bunny buddy',
	resave: true,
	saveUninitialized: false,
	//store: , // default is MemoryStore instance which is not for production
	//rolling: true, // set cookie on every response. expiration set to original maxAge
	cookie: {
		maxAge: 100 * 60 * 1000 // 5 minute
	}
}));
app.use(passport.initialize());
app.use(passport.session());

store.on('connect', function() {
	console.log('why are the stories never finished');
});


var routes = require('./routes');
app.use('/', routes);

app.get('/session', function(req,res) {
	res.send(req.session);
});

app.get('/test', function(req,res) {
	db.list({include_docs: true},function(err, body) {
		var myarr = body.rows.map(function(ele) {
			return {
				username: ele.doc.username,
				email: ele.doc.email,
				role: ele.doc.role,
				timeCreated: ele.doc.timeCreated
			};
		});
		res.render('userlist', {data:myarr});
	});

});

app.get('/dbinit', function (req, res) {
	console.log("GET request for /dbinit");

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

});

// this is somehow producing an "Error: Can't set headers after they are sent."
app.use('*', function(req,res){
	console.log("404 /* =>", req.originalUrl);
	res.status(404).send('404 page not found');
});

// error-handling middleware
app.use(function(err, req, res, next) {
	if (err) {
		switch (err.code) {
			case 'LIMIT_FILE_SIZE':
				res.send('File size too large');
			break;
			default:
				res.sendStatus(500);
				//next(err);
		}
	} else {
		next();
	}
});

app.listen(config.port, function() {
	console.log('Express server listening on port ' + config.port);
});
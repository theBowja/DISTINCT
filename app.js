var express = require('express'), app = express(), http = require('http'), session = require('express-session');
var path = require('path'), fs = require('fs');

var config = require('./config'); // I think this is how a config file should work
var routes = require('./routes');

var db = require('./database');

// Warning: http://andrewkelley.me/post/do-not-use-bodyparser-with-express-js.html
var bodyParser = require('body-parser'); // needed to touch body
app.use(bodyParser.urlencoded({ extended: true })); // populates object with key-value pairs. value can be string or array when extended: false, or any type when extended: true.
app.use(bodyParser.json());

// using express-session
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

// Configure jade as template engine
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/views'));//temp

// Serve static content from "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public/style'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use('/', routes);

app.get('/session', function(req,res) {
	res.send(req.session);
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

	//db.get("bunny", function(err,body) {
 	//if (!err)
    //	console.log(body.last);
	//});

	// db.list(function(err, allDbs) {
 // 		res.send('All my databases: %s', allDbs.join(', '));
	// });

	// var docs =s db.allDocs(function(err, res) {
	// })

	// db.index(function(er, result) {
 //  		if (er) {
 //   			throw er;
 // 		}
 		
	// res.send('The database has ' + result.indexes.length + ' indexes');
 // 	});
 

});

app.use('*', function(req,res){
	res.status(404).send('404 page not found');
});

app.listen(config.port);
console.log('Express server listening on port ' + config.port);

// http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
// 	console.log('Express server listening on port ' + app.get('port'));
// });
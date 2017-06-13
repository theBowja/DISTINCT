var routes = require('express').Router();
var user = require('./user');

var db = require('../database');


var passport = require('passport');
var pt = require('../config/passport.js');
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;

// passport.use(new LocalStrategy( function(username, password, done) {
// 		User.findOne({ username: username }, function(err, user) {
// 			if (err) { return done(err); }
// 			if (!user) {
// 				return done(null, false, { message: 'Incorrect username.' });
// 			}
// 			if (!user.validPassword(password)) {
// 				return done(null, false, { message: 'Incorrect password.' });
// 			}
// 			return done(null, user);
// 		});
// 	}
// ));


routes.use('/user', user);

routes.get('/', function(req, res) {
	console.log("GET request for /");

	var d3 = require('d3');



	res.render('main');
	//res.send('There\'s nothing here');
});

routes.get('/login', function(req, res) {
	console.log("GET request for /login");
	res.render('login');
});

// This responds a POST request for the loginpage
// with passport.js middleware
routes.post('/login', passport.authenticate('local-login', { failureRedirect: '/login'}), function (req, res) {

	res.redirect('/user/dashboard');

});

function validate( user, pass, callback) {
	db.list(function(err, data) { //list ids of documents in db
		if (err) return callback(500, "cannot list documents in database");

		console.log(data.rows[0]);
		db.get(user, function(err,doc) { //get the document
			if(err) return callback(401, "username doesn't exist");

			if( doc.password == pass) {
				console.log("User login success");
				return callback(null, doc.admin);
			} else {
				console.log("User's password is wrong");
				return callback(401,"password is wrong");  
			}
		});
	});
}

module.exports = routes;
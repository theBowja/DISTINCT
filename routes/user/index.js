var user = require('express').Router();
var userAdmin = require('./admin');


// middleware
// user must be logged in
user.use(function(req,res,next) {
	if (!req.session || !req.session.user) {
		res.redirect('/login');
	} else {
		next();
	}
});

user.use('/', userAdmin);

user.get('/', function(req,res) {
	res.redirect('dashboard');
});

// user/dashboard
user.get('/dashboard', function(req, res) {
	console.log("GET request for /user/dashboard");
	if( req.session.admin)
		res.render('adminboard');
	else
		res.send("Dashboard here for non-admins");
});

user .get('/profile', function(req, res) {
	console.log("GET request for /user/profile");
	res.send('PROFILE PAGE HERE LMAOOOOOOO');
});

user.get('/logout', function(req, res) {
	console.log("GET request for /logout");
	req.session.destroy(function(err) {
		if(err) console.log("LOGOUT error");
		res.redirect('/login');
	});
});

module.exports = user;
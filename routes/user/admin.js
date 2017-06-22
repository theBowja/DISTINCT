var userAdmin = require('express').Router();
var db = require('../../database');

var passport = require('passport');

// middleware
// user must be admin
userAdmin.use(function(req,res,next) {
	console.log("DB QUERY - admin restricted");
	db.find({selector:{username:req.user}}, function(err, result) {
		if (err) { console.log("erroring in database finding"); }

		var user = result.docs[0];
		if (user && user.role === "admin")
			next();
		else
			res.redirect('dashboard');
	});
});

// Outputs a table of users
// Queries the database for the list of users and maps the relevant data into
//   an object that will be passed into the pug template.
userAdmin.get('/list', function(req,res) {
	console.log("DB QUERY - list users");
	db.list({ include_docs: true }, function(err, body) {
		// maps the docs into their respective objects with the desired data
		var myarr = body.rows.map(function(ele) {
			return { // preformatted data to display
				username: ele.doc.username,
				email: ele.doc.email,
				role: ele.doc.role,
				timeCreated: new Date(ele.doc.timeCreated).toUTCString(),
				lastLogin: new Date(ele.doc.lastLogin).toUTCString()
			};
		});
		res.render('userlist', { data: myarr } );
	});
});

userAdmin.get('/register', function(req, res) {
	res.render('register');
});

userAdmin.post('/register', function (req, res, next) {
	console.log("POST request for /register");

	// manually handle callbacks
	passport.authenticate('local-signup', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) {
			if (info.message === "Username already exists") {
				// pass in options that repopulate the form
				return res.render('register', { taken: req.body.username, email: req.body.email, role: req.body.role} );
			}
			return res.redirect('/login');
		}
		// successful account creation
		return res.send("successful account creation of " + user.role + " " + user.username);
	})(req, res, next);

});


module.exports = userAdmin; 
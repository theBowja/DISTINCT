var userAdmin = require('express').Router();
var db = require('../../database');

var passport = require('passport');

// middleware
// user must be admin
userAdmin.use(function(req,res,next) {
	if (req.user.role == "admin")
		next();
	else
		res.redirect('/dashboard');
});

userAdmin.get('/list', function(req,res) {
	console.log("GET request for /list");

	db.list( {include_docs: true}, function(err, body) {
  		if (!err) {
			//res.send(body.rows[0].value);
			console.log(body);
			res.send(body);

   		}
    });
	
	//res.end();//res.rend('userlist');
});

userAdmin.get('/register', function(req, res) {
	console.log("GET request for /register");
	res.render('register');
});

userAdmin.post('/register', function (req, res, next) {
	console.log("POST request for /register");

	passport.authenticate('local-signup', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) {
			if (info.message === "Username already exists") {
				// pass in options that repopulate the form
				return res.render('register', { username: req.body.username, email: req.body.email, role: req.body.role} );
			}
			return res.redirect('/login');
		}
		// successful account creation
		return res.send("successful account creation");
		//return res.redirect("/dashboard");
	})(req, res, next);

});


module.exports = userAdmin; 
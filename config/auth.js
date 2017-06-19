var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var config = require('./config.js');
var db = require('../database');

var cloudant = require('cloudant');


/// used to serialize the user for the session
passport.serializeUser(function(user, done) {
	console.log("serializing");
    done(null, user.username);
});

// used to deserialize the user
passport.deserializeUser(function(username, done) {
	console.log("deserializing");
	console.log("DB QUERY");
	db.find({selector:{username:username}}, function(err, result) {
		if (err) { console.log("erroring in database finding"); }

		var user = result.docs[0];
		return done(null, { username: username, role: user.role} );
	});

    //return done(null, username);
});

passport.use('local-login', new LocalStrategy( function(username, password, done) {
	// Cloudant query
	db.find({selector:{username:username}}, function(err, result) {
		if (err) {
			console.log(""+ err);
			return done(null, false, { message: "There was an error connecting to the database" } );
		} else if (result.docs.length === 0) {
			console.log("Username not found");
			return done(null, false, { message: "Username not found" } );
		}
		// assume now that <username> is found and usernames are unique
		var user = result.docs[0];

		bcrypt.compare(password, user.password, function(err, res) {
			if (err) {
				console.log("Error in bcrypt compare:" + err);
				return done(null, false, { message: "Server-side error"} );
			}

			if (res === true) {
				console.log("Password matches");
				return done(null, user);
			} else {
				console.log("Incorrect password");
				return done(null, false, { message: "Password is incorrect"} );
			}
		});
	});
}));

passport.use('local-signup', new LocalStrategy({passReqToCallback:true}, function(req, username, password, done) {
	var body = req.body;

	db.find({selector:{username:username}}, function(err, result) {
		if (err) {
			console.log("Error find:" + err);
			return done(null, false, { message: "There was an error connecting to the databse"} );
		} else if (result.docs.length > 0) {
			console.log("Username found");
			return done(null, false, { message: "Username already exists"} );
		}

		// create a new user
		bcrypt.hash(password, 10, function(err, hash) {
			var user = { // TODO: make a schema/validator for user
				username: username,
				password: hash,
				role: (body.role || "user").toLowerCase(), // admin or user
				email: body.email || "no@email",
				timeCreated: new Date().toUTCString()
			};

			db.insert(user, function(err, body) {
				if (err) {
					console.log("Cannot insert document into database");
					return done(null, false, { message: "Problem with registering user into Cloudant"} );
				} else {
					console.log("Success registering " + username);
					return done(null, user);
				}
			});
		});
	});
}));
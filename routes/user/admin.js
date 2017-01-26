var userAdmin = require('express').Router();
var database = require('../../database');

// middleware
// user must be admin
userAdmin.use(function(req,res,next) {
	if(!req.session.admin) // TODO: change to check if admin within database
		res.redirect('/dashboard');
	else
		next();
});

userAdmin.get('/list', function(req,res) {
	console.log("GET request for /list");

	database.db.list( {include_docs: true}, function(err, body) {
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

userAdmin.post('/register', function (req, res) {
	console.log("POST request for /register");

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

			database.db.insert(obj, function(err, body){
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

function usertaken( user, callback) {
	database.db.list(function(err, data) { //list ids of documents in db
  		if (err)
  			callback(500, "cannot list documents in database");
  		else{
      		database.db.get(user,function(err,body){ //get the document
      			if(err)
      				callback(null);
      			else
      				callback(401,"username already taken");
      		});
    	}
  	
	});
}

module.exports = userAdmin; 
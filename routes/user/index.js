var user = require('express').Router();

// middleware for handling multipart/form-data (which is used for uploading files)
var multer = require('multer');
// middleware for reaping uploaded files saved to disk by multer. removes upon response end or close
var autoReap = require('multer-autoreap');
var upload = multer({ dest: 'public/uploads/' });

var fs = require('fs');
var db = require('../../database');

// Middleware
// Requires that user must be logged in (authenticated)
//   in order to access the paths below
user.use(function(req,res,next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/login');
	}
});

user.get('/', function(req,res) {
	console.log("GET request for /u/ homepage");
	res.redirect('dashboard');
});

// Queries the database for the user's role and passes it as an option
//   to the pug template. The pug file will determine what will be displayed
//   based on the role.
// Admins will have more options available to them on the dashboard.
user.get('/dashboard', function(req, res) {
	console.log("DB QUERY - dashboard role");
	db.find({selector:{username:req.user}}, function(err, result) {
		if (err) { console.log("erroring in database finding"); }

		var user = result.docs[0];
		if (user)
			return res.render('dashboard', { role: user.role} );
		else
			return res.send("error displaying dashboard");
	});
});

// user.get('/search', function(req, res) {
// 	console.log("DB QUERY - search");
// 	db.find({selector:{username:req.query.username}}, function(err, result) {
// 		if (result.docs.length === 0) {
// 			return res.sendStatus(200);
// 		} else {
// 			res.writeHead(400, "Username already exists");
// 			return res.send();
// 			//return res.sendStatus(400);
// 		}
// 	});
// });

user.get('/profile', function(req, res) {
	res.send('PROFILE PAGE HERE LMAOOOOOOO');
});

user.get('/upload', function(req, res) {
	res.render('fileupload');
});

user.post('/upload', upload.single('fileToUpload'), autoReap, function(req, res) {
	console.log("PUT request for upload");


	console.log("Upload File Invoked..");
	// TODO: makes sure file name is unique
	console.log(req.body); // values from the form
	console.log(req.file); // this is it.
	// saves to disk first before uploading as attachment to database
	// the following is untested

	// db.get(req.session.user, function(err, existingdoc) {	
	// // check err. if doesn't exist, then throw tantrum	

	// 	fs.readFile(req.file.path, function(err, data) {
	// 		// check err
	// 		db.attachment.insert( req.session.user, req.file.originalname, data, req.file.mimetype, {rev: existingdoc._rev}, function(err, document) {
	// 			// check err
	// 			console.log('Attachment saved succesfully... hopefully');
	// 			// db.get(document.id, function(err, doc) {
	// 		});

	// 	});

	// });
	res.on('autoreap', function(reapedFile) {
		console.log("reaped file");
	});

	
	res.render('fileupload');
});

user.get('/logout', function(req, res) {
	console.log("GET request for /logout");

	req.logout();
	res.redirect('/login');

	// req.session.destroy(function(err) {
	// 	if(err) console.log("LOGOUT error");
	// 	res.redirect('/login');
	// });
});

// middleware definition applies only to the routes that comes after it.
// putting this at the bottom prevents the middleware in userAdmin
//   from being called for the above paths
var userAdmin = require('./admin');
user.use('/', userAdmin);

module.exports = user;
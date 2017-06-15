var user = require('express').Router();
var multer = require('multer'); // middleware for handling multipart/form-data (which is used for uploading files)
var upload = multer({ dest: 'public/uploads/' });

var fs = require('fs');
var db = require('../../database');

var userAdmin = require('./admin');


// middleware
// user must be logged in
user.use(function(req,res,next) {
	console.log('checking cookie');
	// passport restores session data in req.user

	if (req.isAuthenticated()) {
		console.log('next');
		next();
	} else {
		console.log('not logged in');
		next();
		//res.redirect('/login');
	}


	//if (!req.user) {
	// 	console.log('not logged in')
	// 	res.redirect('/login');
	// } else {
	// 	console.log('next');
	// 	next();
	// }
});

//user.use('/', userAdmin);

user.get('/', function(req,res) {
	console.log("GET request for /user homepage");
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

user.get('/profile', function(req, res) {
	console.log("GET request for /user/profile");
	res.send('PROFILE PAGE HERE LMAOOOOOOO');
});

user.get('/attachmentupload', function(req, res) {
	console.log("GET request for /user/upload");
	res.render('fileupload');
});

user.post('/attachmentupload', upload.single('fileToUpload'), function(req, res) {
	console.log("PUT request for /user/upload");

	console.log("Upload File Invoked..");
	// TODO: makes sure file name is unique
	//console.log(req.body); // values from the form
	//console.log(req.file); // this is it.
	//console.log(req.files);
	// saves to disk first before uploading as attachment to database
	// the following is untested
	db.get(req.session.user, function(err, existingdoc) {	
	// check err. if doesn't exist, then throw tantrum	

		fs.readFile(req.file.path, function(err, data) {
			// check err
			db.attachment.insert( req.session.user, req.file.originalname, data, req.file.mimetype, {rev: existingdoc._rev}, function(err, document) {
				// check err
				console.log('Attachment saved succesfully... hopefully');
				// db.get(document.id, function(err, doc) {
			});

		});

	});

	
	res.render('fileupload');
});

user.get('/logout', function(req, res) {
	console.log("GET request for /logout");
	req.session.destroy(function(err) {
		if(err) console.log("LOGOUT error");
		res.redirect('/login');
	});
});

module.exports = user;
/*
This route handles whenever the user is not logged in
*/
var routes = require('express').Router();
var user = require('./user/index.js');

var db = require('../database');

var passport = require('passport');

routes.use('/user', user);


routes.get('/', function(req, res) {
	res.redirect('/login');

	//res.render('main');
});

routes.get('/login', function(req, res) {
	console.log("GET request for /login");
	res.render('login');
});

routes.post('/login', passport.authenticate('local-login', { successRedirect:'/user/dashboard', failureRedirect: '/login'}), function (req, res) {
	console.log("login success");
	//res.redirect('/user/dashboard');
});


module.exports = routes;
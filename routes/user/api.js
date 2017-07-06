// not entirely sure what api means but it seems like these things go here
var api = require('express').Router();

var db = require('../../database');


api.get('/file/:fileName', function(req, res) {
	console.log("DB LOOKUP - " + req.params.fileName);
	db.attachment.get(req.user._id, req.params.fileName, function(err, body) {
		if (err) {
			console.log("file probably not found");
			return res.send("Error: file probably not found");
		}

		res.send(""+body);
		//return res.render('viewfile', { contents: body} );
	});
});

// TODO: fix unnecessary lookup. The script in the pug file refreshes the page so you have
//       LOOKUP - deserializing - deserializing - attachments
//       can probably remove one 'deserializing' if I send updated attachments from here
api.delete('/file/:fileName', function(req, res) {
	console.log("DB WRITE - destroy attachment");
	db.attachment.destroy(req.user._id, req.params.fileName, {rev: req.user._rev}, function(err, body) {
		if (err) {
			console.log("Error: in destroying attachment");
			return res.sendStatus(500);
		}
		return res.sendStatus(200); // equivalent to res.status(200).send('OK')
	});
});

api.post('/upload/:fileName', function(req, res) {
	// test if it is a json file, otherwise don't accept
	try {
		JSON.parse(req.body.jsonfile);
	} catch (e) {
		return res.sendStatus(400); // not in json format
	}

	console.log("DB WRITE - write file");
	db.attachment.insert(req.user._id, req.params.fileName, req.body.jsonfile, "application/octet-stream", {rev: req.user._rev}, function(err, body) {
		if (err) {
			console.log("database attachment insert error");
			return res.send("an error has occured");
		}
		return res.sendStatus(200);
	});


});

api.get('/listattachments', function(req, res) {
	console.log("DB LOOKUP - attachments");
	db.get(req.user._id, function(err, body) {
	 	if (err) {
	 		console.log("erroring in database lookup");
	 		return res.sendStatus(500);
	 	}

		return res.send(body._attachments);
	});
});




module.exports = api;
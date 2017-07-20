// not entirely sure what api means but it seems like these things go here
var api = require('express').Router();

var db = require('../../database');


api.get('/file/:fileName', function(req, res) {
	console.log("DB LOOKUP - " + req.params.fileName);
	db.profiles.attachment.get(req.user._id, req.params.fileName, function(err, body) {
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
	db.profiles.attachment.destroy(req.user._id, req.params.fileName, {rev: req.user._rev}, function(err, body) {
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
	db.profiles.attachment.insert(req.user._id, req.params.fileName, req.body.jsonfile, "application/octet-stream", {rev: req.user._rev}, function(err, body) {
		if (err) {
			console.log("database attachment insert error");
			return res.send("an error has occured");
		}
		return res.sendStatus(200);
	});


});

api.get('/listattachments', function(req, res) {
	console.log("DB LOOKUP - attachments");
	db.profiles.get(req.user._id, function(err, body) {
	 	if (err) {
	 		console.log("erroring in database lookup");
	 		return res.sendStatus(500);
	 	}

		return res.send(body._attachments);
	});
});

api.get('/events', function(req, res) {
	console.log("DB QUERY - events");
	db.schedule.find({selector:{scheduler:true}}, function(err, result) {
		if (result.docs.length === 0) {
			console.log("DB WRITE - init event doc");
			db.schedule.insert({ scheduler: true, events: [] }, function(err, body) {
				return res.send([]);
			});
		} else {
			return res.send(result.docs[0].events);
		}
	});
});

api.post('/events', function(req, res) {
	var event = req.body.newevent;
	// check if 'event' is a valid event
	if (typeof event !== 'object' ||
		!event.hasOwnProperty('title') ||
		!event.hasOwnProperty('start') ||
		!event.hasOwnProperty('end')) {
		return res.sendStatus(400);
	}

	// 'sanitize' by mapping
	var newEvent = {
		title: event.title,
		group: req.user._id,
		allDay: false,
		start: event.start,
		end: event.end
	};

	console.log('DB QUERY - events');
	db.schedule.find({selector:{scheduler:true}}, function(err, result) {
		var schedule;
		if (result.docs.length === 0) 
			schedule = { scheduler: true, events: [] };
		else 
			schedule = result.docs[0];
		
		schedule.events.push(newEvent);
		console.log('DB WRITE - add event');
		db.schedule.insert(schedule, function(err, body) {
			return res.sendStatus(200);
		});
	});
});


module.exports = api;
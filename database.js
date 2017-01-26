var config = require('./config');

var db;

initDBConnection = function() {
	if(process.env.VCAP_SERVICES && false) {
		// instanceName is required if I have more than one Cloudant service
		var cloudant = require('cloudant')({vcapServices: JSON.parse(process.env.VCAP_SERVICES)}, function(err, cloudant) {
			if( err)
				return console.log('Failed to initialize Cloudant: ' + err);

			// check if DB exists if not create
			cloudant.db.create(config.dbCredentials.dbName, function(err, res) {
				if (err) console.log( err.message);
			});

			db = cloudant.use(config.dbCredentials.dbName);
		});

		// Pattern match to find the first instance of a Cloudant service in
		// VCAP_SERVICES. If you know your service key, you can access the
		// service credentials directly by using the vcapServices object.
		// for(var vcapService in vcapServices){
		//  if(vcapService.match(/cloudant/i)){
		// 		dbCredentials.host = vcapServices[vcapService][0].credentials.host;
		// 		//etc.
		// 	}
		// }

		if(db===null) { //strict equality
			console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
		}
	} else{
		console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
		// For running this app locally you can get your Cloudant credentials 
		// from Bluemix (VCAP_SERVICES in "cf env" output or the Environment 
		// Variables section for an app in the Bluemix console dashboard).
		// Alternately you could point to a local database here instead of a 
		// Bluemix service.

		var cloudant = require('cloudant')(config.dbCredentials.url);
		
		// check if DB exists if not create
        cloudant.db.create(config.dbCredentials.dbName, function (err, res) {
        	if (err) { console.log( err.message); }
         	else {
           		var obj = { // need to check if missing params
					"_id": "asdf",
					"username": "asdf",
					"email": "asdf@asdf.asdf",
					"password": "asdf",
					"admin": true,
					"timecreated": new Date().toUTCString()
				};
				db.insert(obj);
			}
		});
            
        db = cloudant.use(config.dbCredentials.dbName);
	}
};

initDBConnection();

module.exports = db;
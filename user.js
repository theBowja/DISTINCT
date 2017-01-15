// Private variables
var name = "";
var password = "";

// Constructor
function User(name) {
	// always initialize all instance properties
	this.name = name;
	this.password = password;
}

// class methods
User.prototype.fooBar = function() {

};

// export the class
module.exports = User;




// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({ 
    name: String, 
    password: String, 
    admin: Boolean 
}));
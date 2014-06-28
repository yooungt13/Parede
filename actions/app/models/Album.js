var mongodb = require('./mongodb.js');
var Schema = mongodb.mongoose.Schema;

var UserSchema = new Schema({
	_id: String,
	password: String,
	info: {
		tel: String,
		email: String,
		sex: Boolean,
		head: String
	},
	albums: []
});

var User = mongodb.mongoose.model("User", UserSchema);

var ModelDAO = function() {};

ModelDAO.prototype = {
	save: function(obj, callback) {
		var instance = new User(obj);
		instance.save(function(err) {
			callback(err);
		});
	},
	findByLoginId: function(loginId, callback) {
		User.findOne({
			_id: loginId
		}, function(err, obj) {
			callback(err, obj);
		});
	}
};

module.exports = new ModelDAO();
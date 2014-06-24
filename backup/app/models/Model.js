var mongodb = require('./mongodb.js');
var Schema = mongodb.mongoose.Schema;

var schema = new Schema({
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

var Model = mongodb.mongoose.model("Model", schema);

var ModelDAO = function() {};

ModelDAO.prototype = {
	save: function(obj, callback) {
		var instance = new Model(obj);
		instance.save(function(err) {
			callback(err);
		});
	},
	findByLoginId: function(loginId, callback) {
		Model.findOne({
			_id: loginId
		}, function(err, obj) {
			callback(err, obj);
		});
	}
};

module.exports = new ModelDAO();
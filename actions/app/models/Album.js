var mongodb = require('./mongodb.js');
var Schema = mongodb.mongoose.Schema;

var AlbumSchema = new Schema({
	_id: String,
	userid: String,
	photos: []
});

var Album = mongodb.mongoose.model("Album", AlbumSchema);

var AlbumlDAO = function() {};

AlbumlDAO.prototype = {
	save: function(obj, callback) {
		var instance = new Album(obj);
		console.log(instance);
		instance.save(function(err) {
			callback(err);
		});
	},
	findById: function(id, callback) {
		Album.findOne({
			_id: id
		}, function(err, obj) {
			callback(err, obj);
		});
	},
	update: function(obj, callback) {
		Album.update({
			_id: obj._id
		}, {
			$set: {
				photos: obj.photos
			}
		}, function(err) {
			callback(err);
		})
	}
};

module.exports = new AlbumlDAO();
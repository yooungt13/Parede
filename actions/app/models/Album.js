var mongodb = require('./mongodb.js');
var Schema = mongodb.mongoose.Schema;

var AlbumSchema = new Schema({
	_id: String,
	userid: String,
	time: Date,
	cover: {
		type: String,
		default: "./img/cover.gif"
	},
	photos: []
});

var Album = mongodb.mongoose.model("Album", AlbumSchema);

var AlbumlDAO = function() {};

AlbumlDAO.prototype = {
	save: function(obj, callback) {
		var instance = new Album(obj);
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
	findAll: function(callback) {
		Album.find({}, null, {
				sort: {
					time: -1
				}
			},
			function(err, docs) {
				callback(err, docs);
			});
	},
	findTop: function(callback) {
		Album.find({}, '_id', 
			{
				sort: {
					photos: -1
				},
				limit: 5
			},
			function(err, docs) {
				callback(err, docs);
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
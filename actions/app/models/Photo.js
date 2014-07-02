var mongodb = require('./mongodb.js');
var Schema = mongodb.mongoose.Schema;

var PhotoSchema = new Schema({
	_id: Number,
	userid: String,
	url: String,
	tags: []
});

var CounterSchema = new Schema({
	_id: String,
	seq: Number
});

CounterSchema.statics.findAndModify = function(query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
};

var Photo = mongodb.mongoose.model("Photo", PhotoSchema),
	Counter = mongodb.mongoose.model("Counter", CounterSchema);

var PhotoDAO = function() {};

PhotoDAO.prototype = {
	save: function(obj, callback) {
		var instance = new Photo(obj);
		this.getNextSequence("photoid", function(err, counter) {
			var id = counter.seq;
			instance._id = id;
			instance.save(function(err) {
				callback(err, id);
			});
		});
	},
	findById: function(id, callback) {
		Photo.findOne({
			seq: id
		}, function(err, obj) {
			callback(err, obj);
		});
	},
	getNextSequence: function(name, callback) {
		var ret = Counter.findAndModify({
			_id: name
		}, [], {
			$inc: {
				seq: 1
			}
		}, {
			'new': true
		}, function(err, obj) {
			callback(err, obj);
		});
	}
};

module.exports = new PhotoDAO();
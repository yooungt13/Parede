var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/parede');
exports.mongoose = mongoose;
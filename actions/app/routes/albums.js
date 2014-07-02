var express = require('express');
var router = express.Router();

var albumDao = require('../models/Album.js'),
	photoDao = require('../models/Photo.js');

/* Distribute photos. */
router.post('/distribute', function(req, res) {
	console.log('Distribute\'ve been called');
	console.log(req.body);

	var photos = req.body;
	for( var i = 0, len = photos.length; i < len; i++ ){
		photos[i].userid = 1;
		photoDao.save(photos[i]);
	}

	res.json('ok');
});

module.exports = router;

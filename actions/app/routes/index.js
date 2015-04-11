var express = require('express'),
	router = express.Router();

var fs = require('fs'),
	path = require('path'),
	multipart = require('connect-multiparty');

var albumDao = require('../models/Album.js'),
	photoDao = require('../models/Photo.js');

// GET login page. 
router.get('/', function(req, res) {
	res.render('index', {
		title: 'Welcome to Parede.'
	});
});

// GET home page. 
router.get('/home', function(req, res) {
	res.render('home', {
		title: 'Welcome, Tian'
	});
});

router.post('/upload', multipart(), function(req, res) {
	console.log('Upload\'ve been called.');

	// var filePath = req.files.image.path;
	// var newPath = __dirname + "/" + path.basename(filePath);

	//把图片从临时文件夹复制到目的文件夹，当然最好删除临时文件
	// fs.readFile(filePath, function(err, data) {
	// 	if (err) {
	// 		res.send(err);
	// 		return;
	// 	}

	// 	fs.writeFile(newPath, data, function(err) {
	// 		if (!err) {
	// 			res.redirect('/home');
	// 		} else {
	// 			res.send(err);
	// 		}
	// 	});
	// });

	var one_data = [{
		tUrl: '../data/thumb/10.jpg',
		oUrl: '../data/origin/10.jpg',
		tags: ['bike', 'tree', 'women', 'sunrise'],
		descrip: 'Do not, for one repulse, forgo the purpose that you resolved to effort.',
		date: new Date().toLocaleString()
	}];

	// var one_data = [{
	// 	tUrl: '../data/thumb/0.jpg',
	// 	oUrl: '../data/origin/0.jpg',
	// 	tags: ['moutain', 'lake', 'women'],
	// 	descrip: 'Do not, for one repulse, forgo the purpose that you resolved to effort.',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/1.jpg',
	// 	oUrl: '../data/origin/1.jpg',
	// 	tags: ['sunrise', 'outdoor', 'women'],
	// 	descrip: 'The man who has made up his mind to win will never say " Impossible".( Napoleon )',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/2.jpg',
	// 	oUrl: '../data/origin/2.jpg',
	// 	tags: ['bus', 'street'],
	// 	descrip: 'Miracles sometimes occur, but one has to work terribly for them. ( C. Weizmann )',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/3.jpg',
	// 	oUrl: '../data/origin/3.jpg',
	// 	tags: ['sunrise', 'tree', 'women'],
	// 	descrip: '',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/4.jpg',
	// 	oUrl: '../data/origin/4.jpg',
	// 	tags: ['flag', 'church'],
	// 	descrip: 'There is no such thing as darkness; only a failure to see. ( Muggeridge )',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/5.jpg',
	// 	oUrl: '../data/origin/5.jpg',
	// 	tags: ['flower', 'tree', 'women'],
	// 	descrip: 'Time is a bird for ever on the wing. ( T. W. Robertson )',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/6.jpg',
	// 	oUrl: '../data/origin/6.jpg',
	// 	tags: ['moutain', 'food', 'women'],
	// 	descrip: 'The unexamined life is not worth living. --Socrates ',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/7.jpg',
	// 	oUrl: '../data/origin/7.jpg',
	// 	tags: ['ice', 'outdoor', 'women'],
	// 	descrip: 'Achievement provides the only real pleasure in life .',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/8.jpg',
	// 	oUrl: '../data/origin/8.jpg',
	// 	tags: ['bike', 'bag'],
	// 	descrip: 'Man errs as long as he strives.',
	// 	date: new Date().toLocaleString()
	// }, {
	// 	tUrl: '../data/thumb/9.jpg',
	// 	oUrl: '../data/origin/9.jpg',
	// 	tags: ['light', 'bag', 'women'],
	// 	descrip: 'Energy and persistence conquer all things.',
	// 	date: new Date().toLocaleString()
	// }];

	// var data = [];
	// for( var i = 0; i < 25; i++ ){
	// 	data = data.concat(one_data);
	// }

	res.json(one_data);
});

var photoDao = require('../models/Photo.js');

router.post('/distribute', function(req, res) {
	var photos = req.body;
	for (var i = 0, plen = photos.length; i < plen; i++) {
		photos[i].userid = 1;

		// 将图片信息存入数据库，并返回索引
		(function(photo) {
			photoDao.save(photo, function(err, photoid) {
				if (err) throw err;
				console.log("photoid: " + photoid);

				var tags = photo.tags;
				// 将图片插入相册 
				for (var j = 0, tlen = tags.length; j < tlen; j++) {
					(function(tag) {
						console.log(tag);
						albumDao.findById(tag, function(err, album) {
							if (!album) {
								console.log(tag + " isn't exited.");
								// save
								albumDao.save({
									_id: tag,
									userid: 1,
									photos: [photoid],
									time: new Date(),
									cover: photo.tUrl
								}, function(err) {
									if (err) throw err;
								});
							} else {
								console.log(tag + " is exited.");
								album.photos.push(photoid);

								// update
								albumDao.update(album, function(err) {
									console.log("Update success.")
									if (err) throw err;
								});
							}
						});
					})(tags[j]);
				};
			});
		})(photos[i]);
	}
});


router.get("/albums", function(req, res) {
	albumDao.findAll(function(err, albums) {
		if (err) throw err;
		res.json(albums);
	});
});

router.get("/album", function(req, res) {
	console.log(req.query.tag);
	res.render('album', {
		title: 'Welcome, Tian',
		id: req.query.tag
	});
});

router.get("/photos", function(req, res) {
	console.log(req.query.tag);
	if (!!req.query.tag) {
		photoDao.findByTag(req.query.tag, function(err, photos) {
			if (err) throw err;
			res.json(photos);
		});
	} else if (!!req.query.img) {
		photoDao.findByImg(function(err, photos) {
			if (err) throw err;
			res.json(photos);
		});
	} else {
		photoDao.findAll(function(err, photos) {
			if (err) throw err;
			res.json(photos);
		});
	}

});

router.get("/tagsearch", function(req, res) {
	console.log(req.query.tag);
	photoDao.findByTag(req.query.tag, function(err, photos) {
		if (err) throw err;
		res.json(photos);
	});
});

router.get("/classify", function(req, res) {
	res.render('classify', {
		title: 'Welcome to Parede.'
	});
});

module.exports = router;
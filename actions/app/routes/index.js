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

	res.json([{
			url: '../0.png',
			tags: ['moutain', 'lake', 'women']
		}, {
			url: '../1.png',
			tags: ['sunrise', 'outdoor', 'men']
		},

	]);
});

router.post('/distribute', function(req, res) {
	console.log('Distribute\'ve been called');

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
								albumDao.save({
									_id: tag,
									userid: 1,
									photos: [photoid]
								}, function(err) {
									if (err) throw err;
								});
							} else {
								console.log(tag + " is exited.");
								album.photos.push(photoid);
								albumDao.update(album, function(err) {
									if (err) throw err;
								});
							}
						});
					})(tags[j]);
				};
			});
		})(photos[i]);
	}

	res.json('ok');
});

module.exports = router;
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

	// var data = [{
	// 	url: "./data/thumb/0.jpg",
	// 	tags: [
	// 		"ice",
	// 		"people",
	// 		"outdoor"
	// 	]
	// }, {
	// 	url: "./data/thumb/1.jpg",
	// 	tags: [
	// 		"party",
	// 		"people",
	// 		"indoor"
	// 	]
	// }, {
	// 	url: "./data/thumb/2.jpg",
	// 	tags: [
	// 		"bus",
	// 		"outdoor"
	// 	]
	// }, {
	// 	url: "./data/thumb/3.jpg",
	// 	tags: [
	// 		"sunset",
	// 		"tree"
	// 	]
	// }, {
	// 	url: "./data/thumb/4.jpg",
	// 	tags: [
	// 		"building"
	// 	]
	// }, {
	// 	url: "./data/thumb/5.jpg",
	// 	tags: [
	// 		"people",
	// 		"outdoor"
	// 	]
	// }, {
	// 	url: "./data/thumb/6.jpg",
	// 	tags: [
	// 		"food",
	// 		"people",
	// 		"outdoor"
	// 	]
	// }, {
	// 	url: "./data/thumb/7.jpg",
	// 	tags: [
	// 		"ice",
	// 		"people",
	// 		"outdoor"
	// 	]
	// }, {
	// 	url: "./data/thumb/8.jpg",
	// 	tags: [
	// 		"people",
	// 		"outdoor"
	// 	]
	// }, {
	// 	url: "./data/thumb/9.jpg",
	// 	tags: [
	// 		"people",
	// 		"outdoor"
	// 	]
	// }];
	//res.json(data);
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
				// 建立一个缓冲区
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
									time: new Date()
								}, function(err) {
									if (err) throw err;
								});
							} else {
								console.log(tag + " is exited.");
								album.photos.push(photoid);
								// update
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

	res.json('Distribute success.');
});


router.get("/albums", function(req, res) {
	albumDao.findAll(function(err, albums) {
		if (err) throw err;
		res.json(albums);
	});
});

router.get("/album", function(req, res) {
	console.log(req.body);
});

module.exports = router;
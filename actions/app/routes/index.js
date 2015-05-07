var express = require('express'),
	router = express.Router();

var fs = require('fs'),
	gm = require('gm'),
	path = require('path'),
	multipart = require('connect-multiparty'),
	w2v = require('word2vec');

var albumDao = require('../models/Album.js'),
	photoDao = require('../models/Photo.js'),
	descrip = require('../models/Descrip.js');

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

	var imageMagick = gm.subClass({
		imageMagick: true
	});

	var filePath = req.files.photo.path,
		fileName = path.basename(filePath),
		oPath = "./public/data/origin/" + fileName,
		tPath = "./public/data/thumb/" + fileName,
		size = req.files.photo.size;

	var tagStr = req.body.tags,
		tags = !!tagStr ? tagStr.split(',') : ['default'],
		hash = req.body.hash;

	if (size > 2 * 1024 * 1024) {
		fs.unlink(path, function() { //fs.unlink 删除用户上传的文件
			res.json({
				ret: 201
			});
		});
	} else if (req.files.photo.type.split('/')[0] != 'image') {
		fs.unlink(filePath, function() {
			res.json({
				ret: 202
			});
		});
	} else {
		// Write Original Photo
		imageMagick(filePath)
			.autoOrient()
			.write(oPath, function(err) {
				if (err) {
					console.log(err);
					res.json({
						ret: 203
					});
				} else {
					// GET image.width & image.height
					imageMagick(filePath).size(function(err, size) {
						if (err) {
							res.json({
								ret: 204
							});
						}

						// Resize the size
						var width = 200,
							height = ~~(200 * (size.height / size.width));

						// Write Thumbnails
						imageMagick(filePath)
							.resize(width, height, '!') //加('!')强行把图片缩放
							.autoOrient()
							.write(tPath, function(err) {
								if (err) {
									console.log(err);
									res.json({
										ret: 205
									});
								} else {
									// 将图片信息存入数据库，并返回索引
									var photo = {
										tUrl: '../data/thumb/' + fileName,
										oUrl: '../data/origin/' + fileName,
										tags: tags,
										descrip: descrip.data[~~(Math.random() * descrip.data.length)],
										hash: hash,
										date: new Date().toLocaleString()
									};

									photoDao.save(photo, function(err, photoid) {
										if (err) throw err;
										// 将图片插入相册 
										for (var j = 0, tlen = tags.length; j < tlen; j++) {
											(function(tag) {
												albumDao.findById(tag, function(err, album) {
													if (!album) {
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
														album.time = new Date();
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

									res.json({
										ret: 1
									});
								}
								fs.unlink(filePath, function() {
									return res.json({
										ret: 203
									});
								});
							});
					});
				}
			});
	}
});

router.get('/generate', function(req, res) {

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
	// 	tags: ['mountain', 'lake', 'women'],
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
	// 	tags: ['mountain', 'food', 'women'],
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

router.get("/tags", function(req, res) {
	albumDao.findTop(function(err, tags) {
		if (err) throw err;
		res.json(tags);
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

	var tag = req.query.tag;
	photoDao.findByTag(tag, function(err, photos) {
		if (err) throw err;

		if (!!photos.length) {
			res.json(photos);
		} else {
			w2v.loadModel("./public/data/word2vec/vectors.txt", function(err, model) {
				res.json(model.getNearestWords(model.getVector(tag)));
			});	
		}
	});
});

router.get("/imgsearch", function(req, res) {

	photoDao.findAll(function(err, photos) {
		if (err) throw err;

		var ret = [];
		for (var i = 0, len = photos.length; i < len; i++) {
			var dis = 64;

			if (!!photos[i].hash) {
				dis = getDis(photos[i].hash, req.query.hash);
			}

			// 阈值设定，如果距离小于15，则被认为相近
			if (dis <= 15) {
				photos[i].dis = dis;
				ret.push(photos[i]);
			}
		}

		// 按距离排序
		ret.sort(function(p1, p2) {
			return p1.dis > p2.dis ? 1 : -1;
		});

		res.json(ret);
	});

	function getDis(h1, h2) {
		var dis = 0;
		for (var i = 0; i < 64; i++) {
			if (h1[i] != h2[i]) dis++;
		}
		return dis;
	}
});

router.get("/classify", function(req, res) {
	res.render('classify', {
		title: 'Welcome to Parede.'
	});
});

router.get("/word2vec", function(req, res) {
	var model = w2v.loadModel("./public/data/word2vec/vectors.txt", function(err, model) {
		try{
			var ret = model.getNearestWords(model.getVector(req.query.tag), 10);
			res.json(ret);
		}catch(e){
			res.json([]);
		}
		
	});
});

module.exports = router;
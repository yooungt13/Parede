var express = require('express'),
	router = express.Router();

var fs = require('fs'),
	path = require('path'),
	multipart = require('connect-multiparty');

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
	console.log(req.body);

	res.json('ok');
});

module.exports = router;
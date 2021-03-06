var express = require('express'),
	router = express.Router();

var user = require('../models/User.js'),
	code = require('../models/Code.js');

router.post('/login', function(req, res) {
	console.log("Login've called");
	console.log('Login Info: ' + req.body.email + "/" + req.body.password);

	var loginCode = code.LoginCode;

	user.findByLoginId(req.body.email, function(err, obj) {
		if (obj) {
			if (req.body.email === obj._id && req.body.password === obj.password) {
				console.log(loginCode[0].description);
				res.json(loginCode[0]);
			} else {
				console.log(loginCode[1].description);
				res.json(loginCode[1]);
			}
		} else {
			console.log(loginCode[2].description);
			res.json(loginCode[2]);
		}
	});
});

router.get('/doRegist', function(req, res) {
	console.log("Regist've called");
	var newer = {
		_id: 'titan',
		password: '123',
		info: {
			tel: '18620667350',
			email: 'xxoo@qq.com',
			sex: true,
			head: 'man.png'
		}
	};
	user.save(newer, function(err) {
		if (err) {
			console.log('Regist false.');
			res.redirect('/');
		} else {
			console.log('Regist success.');
			res.redirect('/home');
		}
	});

	// var login = Login.findByLoginId(req.body.loginid, function(err, obj) {
	// 	if (obj) {
	// 		console.log('ID is existed.');
	// 		res.redirect('/');
	// 	} else {
	// 		Login.save(login, function(err) {
	// 			if (err) {
	// 				console.log('Regist false.');
	// 			} else {
	// 				res.redirect('/');
	// 			}
	// 		});
	// 	}
	// });
});

router.get('/logout', function(req, resp) {
	//req.session.user = null;
	resp.redirect('/');
});

module.exports = router;

// exports.regist = function(req, resp) {
// 	resp.render('register');
// }

// exports.doRegist = function(req, resp) {
// 	console.log("Regist've called");
// 	// var login = {
// 	// 	_id: 'titan',
// 	// 	password: '123'
// 	// };
// 	var login = Login.findByLoginId(req.body.loginid, function(err, obj) {
// 		if (obj) {
// 			console.log('ID is existed.');
// 			resp.redirect('/');
// 		} else {
// 			Login.save(login, function(err) {
// 				if (err) {
// 					console.log('Regist false.');
// 				} else {
// 					resp.redirect('/');
// 				}
// 			});
// 		}
// 	});

// }
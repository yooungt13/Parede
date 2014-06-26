var express = require('express'),
	router = express.Router();

var user = require('../models/User.js');

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

router.post('/login', function(req, res) {
	console.log("Login've called");

	req.body.loginid = 'titan';
	req.body.password = '123';

	user.findByLoginId(req.body.loginid, function(err, obj) {
		console.log('LoginInfo: ' + obj);
		if (obj) {
			console.log('Input password: ' + req.body.password);
			if (req.body.loginid === obj._id && req.body.password === obj.password) {
				console.log('Validate success');
				// req.session.user = obj;
				// req.session.error = '';
				res.redirect('/home');
			} else {
				console.log('You\'ve a wrong Password.');
				res.redirect('/');
			}
		} else {
			console.log('There\'s no account.');
			//req.session.error = '用户名或密码不正确';
			res.redirect('/');
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

router.get('logout', function(req, resp) {
	//req.session.user = null;
	resp.redirect('/');
});

module.exports = router;



// exports.index = function(req, resp) {
// 	resp.render('login');
// };

// exports.login = function(req, resp) {
// 	console.log("Login've called");

// 	Login.findByLoginId(req.body.loginid, function(err, obj) {
// 		console.log(obj);
// 		if (obj) {
// 			console.log(req.body.password);
// 			if (req.body.loginid === obj._id && req.body.password === obj.password) {
// 				console.log('validate success');
// 				req.session.user = obj;
// 				req.session.error = '';
// 				resp.redirect('/home');
// 			}
// 		} else {
// 			req.session.error = '用户名或密码不正确';
// 			resp.redirect('/');
// 		}
// 	});
// };

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
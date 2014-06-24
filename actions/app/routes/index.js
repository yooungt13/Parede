var express = require('express'),
	router = express.Router();

var model = require('../models/Model.js');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title: 'Express'
	});
});

router.get('/login', function(req, res) {
	console.log("Login've called");

	req.body.loginid = 'titan';
	req.body.password = '1234';

	model.findByLoginId(req.body.loginid, function(err, obj) {
		console.log('LoginInfo: ' + obj);
		if (obj) {
			console.log('Input password: ' + req.body.password);
			if (req.body.loginid === obj._id && req.body.password === obj.password) {
				console.log('Validate success');
				// req.session.user = obj;
				// req.session.error = '';
				// resp.redirect('/home');
				res.redirect('/');
			} else {
				console.log('You\'ve a wrong Password.');
				res.redirect('/500');
			}
		} else {
			console.log('There\'s no account.');
			//req.session.error = '用户名或密码不正确';
			res.redirect('/500');
		}
	});
});

router.get('/doRegist', function(req, resp) {
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
	model.save(newer, function(err) {
		if (err) {
			console.log('Regist false.');
			resp.redirect('/500');
		} else {
			console.log('Regist success.');
			resp.redirect('/');
		}
	});

	// var login = Login.findByLoginId(req.body.loginid, function(err, obj) {
	// 	if (obj) {
	// 		console.log('ID is existed.');
	// 		resp.redirect('/');
	// 	} else {
	// 		Login.save(login, function(err) {
	// 			if (err) {
	// 				console.log('Regist false.');
	// 			} else {
	// 				resp.redirect('/');
	// 			}
	// 		});
	// 	}
	// });
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

// exports.logout = function(req, resp) {
// 	req.session.user = null;
// 	resp.redirect('/');
// };

// exports.home = function(req, resp) {
// 	resp.render('home');
// };
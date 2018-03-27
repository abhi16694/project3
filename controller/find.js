var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
/* GET home page. */
router.get('/', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}
	var fromuser = req.query.from;
	mongoose.model('requests').find({ "username": fromuser }, function (err, requests) {


		res.render('find', { fromuser: fromuser, requests: requests });
	});
});



router.get('/friend', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}
	var email = req.query.email;

	var username = req.query.from;
	mongoose.model('chatroom').find({ "email": email, "friends.username": { "$nin": [username] } }, function (err, user) {
		mongoose.model('requests').find({ "username": username }, function (err, requests) {
			if (!err && user) {

				res.render('find', { fromuser: username, friends: user });
			}

			else {
				res.render('find', { error: "No friends Found!", fromuser: fromuser, requests: requests });
			}

		});
	});


});



router.get('/addfriend', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}
	var username = req.query.username;
	var fromuser = req.query.from;


	db.collection('requests').insert({ "username": username, "from": fromuser });
	console.log("added");
	mongoose.model('requests').find({ "username": fromuser }, function (err, requests) {
		res.render('find', { fromuser: fromuser, requests: requests, error: "A friend request has been sent to " + username });
	});




});
router.get('/reject', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}
	var username = req.query.from;
	var from1 = req.query.username;
	mongoose.model('requests').remove({ "username": username, "from": from1 }, function (err, done3) {
		mongoose.model('requests').find({ "username": username }, function (err, requests) {
			res.render('find', { fromuser: username, requests: requests, error: from1 + " request has been removed" });
		});

	});

});

router.get('/accept', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}
	var username = req.query.from;
	var from1 = req.query.username;
	mongoose.model('chatroom').update({ "username": username }, { "$push": { "friends": { "username": from1 } } }, function (err, done1) {
		mongoose.model('chatroom').update({ "username": from1 }, { "$push": { "friends": { "username": username } } }, function (err, done2) {
			mongoose.model('requests').remove({ "username": username, "from": from1 }, function (err, done3) {
				mongoose.model('requests').find({ "username": username }, function (err, requests) {
					res.render('find', { fromuser: username, requests: requests, error: from1 + " has been added to your Friends List!" });
				});

			});
		});
	});
});
module.exports = router;

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var routes = require('./index');

router.get('/', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}
	var fromuser = req.query.from;
	db.collection('chatroom').findOne({ "username": fromuser }, function (err, fromdoc) {

		mongoose.model('messages').find({ "$or": [{ "from": fromuser }, { "to": fromuser }] }, function (err, posts) {
			mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": fromuser } } }, function (err, groups) {
				res.render('user', { fromuser: fromuser, users: fromdoc.friends, posts: posts, groups: groups });
			});
		});

	});
});


router.get('/change', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}
	var fromname = req.query.from;
	var toname = req.query.name;
	db.collection('chatroom').findOne({ "username": fromname }, function (err, fromdoc) {
		mongoose.model('messages').find({ $or: [{ "from": fromname, "to": toname }, { "from": toname, "to": fromname }] }, function (err, posts) {
			mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": fromname } } }, function (err, groups) {

				res.render('user', { users: fromdoc.friends, posts: posts, fromuser: fromname, to: toname, groups: groups });
			});
		});
	});
});



router.get('/changegrp', function (req, res, next) {
	if (!req.session.user || req.session.user != req.query.from) {
		res.redirect('/userLogin');
	}

	var fromname = req.query.from;
	var gname = req.query.gname;
	db.collection('chatroom').findOne({ "username": fromname }, function (err, fromdoc) {
		mongoose.model('messages').find({ "to": gname }, function (err, gposts) {
			mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": fromname } } }, function (err, groups) {

				res.render('user', { users: fromdoc.friends, gposts: gposts, fromuser: fromname, to: gname, groups: groups });
			});
		});
	});
});


router.post('/add', function (req, res, next) {
	if (!req.session.user || req.session.user != req.body.from) {
		res.redirect('/userLogin');
	}
	var fromname = req.body.from;
	var toname = req.body.to;
	var contentnew = req.body.content;
	db.collection('chatroom').findOne({ "username": fromname }, function (err, fromdoc) {
		db.collection('messages').insert({ "from": fromname, "to": toname, "content": contentnew });

		mongoose.model('messages').find({ $or: [{ "from": fromname, "to": toname }, { "from": toname, "to": fromname }] }, function (err, posts) {
			mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": fromname } } }, function (err, groups) {

				res.render('user', { users: fromdoc.friends, posts: posts, fromuser: fromname, to: toname, groups: groups });
			});
		});
	});
});

router.get('/api/change', function (req, res, next) {

	var fromname = req.query.from;
	var toname = req.query.name;
	//db.collection('chatroom').findOne({"username":fromname},function(err,fromdoc){ 
	mongoose.model('messages').find({ $or: [{ "from": fromname, "to": toname }, { "from": toname, "to": fromname }] }, function (err, posts) {


		res.send({ posts: posts });
	});
});




router.get('/api/changegrp', function (req, res, next) {

	var gname = req.query.gname;

	mongoose.model('messages').find({ "to": gname }, function (err, gposts) {

		if (!err) {
			res.send({ gposts: gposts });
		}
		else {
			res.send({ gposts: [] });
		}

	});
});








router.post('/api/add', function (req, res, next) {

	var fromname = req.body.from;
	var toname = req.body.to;
	var contentnew = req.body.content;
	db.collection('chatroom').findOne({ "username": fromname }, function (err, fromdoc) {
		db.collection('messages').insert({ "from": fromname, "to": toname, "content": contentnew }, function (err) {
			if (!err) {
				res.send({ status: 1 });
			} else {
				res.send({ status: 0 });
			}
		});


	});
});




module.exports = router;

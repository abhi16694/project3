
var express = require('express');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var Strategy = require('passport-facebook').Strategy;
var passport = require('passport');
var router = express.Router();
var session = require('client-sessions');
var mongoose = require('mongoose');
var db = mongoose.connection;
/* GET home page. */
router.get('/', function (req, res, next) {

	res.render('login');
});
router.get('/login', function (req, res, next) {
	var username = req.query.username;
	var password = req.query.password;

	db.collection('chatroom').findOne({ "username": username, "password": password }, function (err, u) {

		if (!err && u && password === req.query.password) {
			console.log(u.friends);
			// mongoose.model('chatroom').find({"username":{"$in":[u.friends]}},function(err,others){
			mongoose.model('messages').find({ "username": username }, function (err, posts) {
				mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": username } } }, function (err, groups) {
					console.log(groups);
					req.session.user = username;
					res.render('user', { fromuser: username, users: u.friends, posts: posts, groups: groups });
				});
			});
		}

		else { res.render('login', { error: "Incorrect Username or Password" }); }

	});

});
passport.use(new GoogleStrategy({
	clientID: "339367290623-09uokkmhpc89vvt7jn6vvqum5vj1ii58.apps.googleusercontent.com",
	clientSecret: "1KKcW3_rDfN3RzcoQY5LkcIt",
	callbackURL: "http://localhost:3000/userlogin/auth/google/callback",
	passReqToCallback: true
},
	function (request, accessToken, refreshToken, profile, done) {
		// sets req.user here
		return done(null, profile);
	}));
passport.use(new Strategy({
	clientID: '1893109600762594',
	clientSecret: 'c85d3bfff1055e0ce4dd2513c8154c06',
	callbackURL: 'http://localhost:3000/userLogin/facebook/return',
	enableProof: true,
	profileFields: ['emails', 'name']
},
	function (accessToken, refreshToken, profile, cb) {
		// req.user set here
		return cb(null, profile);
	}));


// Configure Passport authenticated session persistence.
passport.serializeUser(function (user, cb) {
	cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
	cb(null, obj);
});

// cookie parser and express-sessions required for passportjs sessions
router.use(require('cookie-parser')());
router.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
router.use(passport.initialize());
router.use(passport.session());
router.get('/facebook',
	passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/return',
	passport.authenticate('facebook', { failureRedirect: '/userLogin' }),
	function (req, res) {
		var username = req.user.name.givenName;
		//if authenticated check if user is in db or not 
		// if not then saves it
		if (req.isAuthenticated()) {
			mongoose.model('chatroom').findOne({ "username": username }, function (err, result) {

				if (err) {
					res.send("some error " + err)
				} else {
					if (result == "" || result == undefined || result == null) {

						db.collection('chatroom').insert({ "username": username, "email": req.user.emails[0].value });
						req.session.user = username;
						res.render('user', { fromuser: username, users: result.friends, posts: posts, groups: groups });

					}

					else {
						//sets found user to session

						mongoose.model('messages').find({ "username": username }, function (err, posts) {
							mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": username } } }, function (err, groups) {
								console.log(groups);
								req.session.user = username;
								res.render('user', { fromuser: username, users: result.friends, posts: posts, groups: groups });
							});
						});
					}
				}

			})
		}

	});

router.get('/auth/google', passport.authenticate('google', {
	scope: ['profile', 'email'] //asks for specific permissions

}));

//if authenticated check if user is in db or not 
// if not then saves it
router.get('/auth/google/callback',
	passport.authenticate('google', {

		failureRedirect: '/userLogin'
	}), function (req, res) {
		var username = req.user.name.givenName;
		if (req.isAuthenticated()) {
			mongoose.model('chatroom').findOne({ "username": username }, function (err, result) {

				if (err) {
					res.send("some error " + err)
				} else {
					if (result == "" || result == undefined || result == null) {

						db.collection('chatroom').insert({ "username": username, "email": req.user.emails[0].value });
						req.session.user = username;
						res.render('user', { fromuser: username, users: result.friends, posts: posts, groups: groups });

					}

					else {
						//sets found user to session

						mongoose.model('messages').find({ "username": username }, function (err, posts) {
							mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": username } } }, function (err, groups) {
								console.log(groups);
								req.session.user = username;
								res.render('user', { fromuser: username, users: result.friends, posts: posts, groups: groups });
							});
						});
					}
				}

			})
		}
	});

router.get('/logout', function (req, res, next) {
	var username = req.query.from;
	if (req.session.user || req.session.user == username) {
		delete req.session.user;
		res.redirect('/userLogin');
	}
	else {
		res.redirect('/userLogin');
	}

});

router.get('/register', function (req, res, next) {



	res.render('register');


});

router.get('/forgot', function (req, res, next) {



	res.render('forgot');


});

router.post('/resetPass', function (req, res, next) {
	var username = req.body.username;
	var password = req.body.password;
	var confpwd = req.body.passwordconf;
	var email = req.body.email;

	if (username != null && password === confpwd) {
		db.collection('chatroom').findOne({ "username": username }, function (err, result) {
			if (result != null) {

				db.collection('chatroom').update({ "username": username }, { "username": username, "password": password, "email": email });
				res.render('forgot', { error: "Your password is sucessfully changed. Please click the Login button to go to the Login Page" });

			}
			else {

				res.render('forgot', { error: "Username not found!! Please check" });
			}


		});
	}

	else res.render('forgot', { error: "Please ensure that both Passwords are same" });


});

router.post('/registeruser', function (req, res, next) {
	var username = req.body.username;
	var password = req.body.password;
	var confpwd = req.body.passwordconf;
	var email = req.body.email;

	if (email != null && password === confpwd) {
		mongoose.model('chatroom').findOne({ "username": username }, function (err, fromdoc) {
			if (fromdoc != null) {
				res.render('register', { error: "The username is  already in use...... Please try another username!" });
			}
			else {
				db.collection('chatroom').insert({ "username": username, "password": password, "email": email });
				res.render('register', { error: "Your account has been created! Please click the Login button to go to the Login Page" });
			}
		})
	}

	else res.render('register', { error: "Please ensure that both Passwords are same" });


});


module.exports = router;

router.get('/api/login', function (req, res, next) {
	var username = req.query.username;
	var password = req.query.password;

	db.collection('chatroom').findOne({ "username": username, "password": password }, function (err, u) {

		if (!err && u && password === req.query.password) {
			console.log(u.friends);
			// mongoose.model('chatroom').find({"username":{"$in":[u.friends]}},function(err,others){
			mongoose.model('messages').find({ "username": username }, function (err, posts) {
				mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": username } } }, function (err, groups) {
					console.log(groups);
					//req.session.user=username;
					res.send({ status: 1, fromuser: username, email: u.email });     //,users:u.friends ,posts:posts,groups:groups
				});
			});
		}

		else { res.send({ status: 0, username: username, email: "try again" }); }

	});

});


router.get('/api/friends', function (req, res, next) {
	var username = req.query.username;


	db.collection('chatroom').findOne({ "username": username }, function (err, u) {

		if (!err && u) {
			console.log(u.friends);

			//	 mongoose.model('messages').find({"username":username},function(err,posts){
			mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": username } } }, function (err, groups) {
				console.log(groups);
				//req.session.user=username;
				res.send({ status: 1, friends: u.friends });     //,users:u.friends ,posts:posts,groups:groups
			});
			//	});
		}

		else { res.send({ status: 0, friends: [] }); }

	});

});


router.get('/api/groups', function (req, res, next) {
	var username = req.query.username;


	db.collection('chatroom').findOne({ "username": username }, function (err, u) {

		if (!err && u) {
			console.log(u.friends);

			//	 mongoose.model('messages').find({"username":username},function(err,posts){
			mongoose.model('chatroomgrp').find({ "members": { "$elemMatch": { "username": username } } }, function (err, groups) {
				console.log(groups);
				//req.session.user=username;
				res.send({ status: 1, groups: groups });     //,users:u.friends ,posts:posts,groups:groups
			});
			//	});
		}

		else { res.send({ status: 0, friends: [] }); }

	});

});
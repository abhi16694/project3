var express=require('express');
var nodemailer = require("nodemailer");
var mongoose = require('mongoose');
var app=express();
var shortid = require("shortid");
var userModel = mongoose.model('User');
var responseGenerator = require('./../../libs/responseGenerator');
var crypto = require('./../../libs/crypto');
var resetRouter  = express.Router();
var async = require("async");
var crypto1 = require('crypto');
var mailer = require("./../../libs/mailConfig");

/*------------------Routing Started ------------------------*/

module.exports.controllerFunction = function(app) {

    //////////////////////////// route to set token and expity date usen user requests password change ////////////////////////

    resetRouter.post('/forgot', function(req, res, next) {
      
      async.waterfall([
        function(done) {
          crypto1.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            done(err, token);
          });
        },
        function(token, done) {
          
          userModel.findOne({ email : req.body.email }, function(err, userfound) {
            
            if (!userfound) {              
              var myResponse = responseGenerator.generate(true,"No account with that email address exists.",404,null);
              return res.send(myResponse)
            }

            userfound.resetPasswordToken = token;
            userfound.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            userfound.save(function(err) {
              done(err, token, userfound);
            });
          
          });
        },
        function(token, user, done) {
          
          var mailOptions = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Live Exam Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/api/v1/reset/' + token + '\n\n' +
              /*'http://theinvigilator.ga/api/v1/reset/' + token + '\n\n' +*/
              'This link is valid only for 1 hr and will not be of any use after its expired.\n'+
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          mailer.smtpTransport.sendMail(mailOptions, function(err) {
            var myResponse = responseGenerator.generate(false,'An e-mail has been sent to ' + user.email + ' with further instructions.',200,null);
            res.send(myResponse)
            done(err, 'done');
          });
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/#/forgotPassword');
      });
    });

    ////////////////////////////////////////////// route to check if token is valid ///////////////////////////////////////////

    resetRouter.get('/reset/:token', function(req, res) {
      userModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          /*req.flash('error', 'Password reset token is invalid or has expired.');*/
          return res.send('<h1 style="color:red;text-align:center">Password reset token is invalid or has expired.</h1>');
        }
        res.redirect("/#/reset/"+req.params.token);
      });
    });

    ///////////////////// route to change password, if token is valid and not expired and send success mail /////////////////////

    resetRouter.post('/reset/:token', function(req, res) {
      async.waterfall([
        function(done) {
          userModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              var myResponse = responseGenerator.generate(true,"Password reset token is invalid or has expired.",404,null);
              return res.send(myResponse)
            }

            var passwordDb = crypto.encrypt(req.body.password,crypto.key);
            user.password = passwordDb;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              
                done(err, user);
              
            });
          });
        },
        function(user, done) {
          
          var mailOptions = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          mailer.smtpTransport.sendMail(mailOptions, function(err) {
            
            var myResponse = responseGenerator.generate(false,'Success! Your password has been changed.',200,null);
            res.send(myResponse)
            done(err);
          });
        }
      ], function(err) {
        res.redirect('/');
      });
    });

    app.use('/', resetRouter);
    
}


/*--------------------Routing Over----------------------------*/



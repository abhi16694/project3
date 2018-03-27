var http=require('http');
var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorHandler=require('express-error-handler');
var routes = require('./controller/index');
var login = require('./controller/login');
var users = require('./controller/users');
var find = require('./controller/find');
var group = require('./controller/group');
var session=require('express-session');

var mongoose=require('mongoose');
var app = express();
var Schema=mongoose.Schema;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
  
  secret: "bsdfknaslndalsfdsnfksdkf",
  resave:false,
  saveUninitialized:true
 
}));


app.use('/', routes);
app.use('/index', routes);
app.use('/users', users);
app.use('/users/add', users);
app.use('/userLogin',login);
app.use('/find',find);
app.use('/group',group);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(errorHandler());
  mongoose.connect('mongodb://127.0.0.1/test');
}

mongoose.model('chatroom',{username:String,friends:[{username:String}]},'chatroom');
mongoose.model('messages',{from:String,to:String,content:String},'messages');
mongoose.model('requests',{username:String, from:String},'requests');
mongoose.model('chatroomgrp',{groupname:String,members:[{username:String}]},'chatroom')

module.exports = app;

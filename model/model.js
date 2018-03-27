var mongoose = require('mongoose');

var Schema = mongoose.Schema;

mongoose.model('chatroom',{username:String,friends:[{username:String}]},'chatroom');
mongoose.model('messages',{from:String,to:String,content:String},'messages');
mongoose.model('requests',{username:String, from:String},'requests');
mongoose.model('chatroomgrp',{groupname:String,members:[{username:String}]},'chatroom');
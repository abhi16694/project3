var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Social Network' });
});

router.get('/index', function(req, res, next) {
	var newname= req.query.name;
  res.render('index', { title: newname });
});



module.exports = router;

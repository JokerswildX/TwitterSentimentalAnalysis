var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/list_user', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    console.log("response got on searcing");
    console.log(req);
});

module.exports = router;

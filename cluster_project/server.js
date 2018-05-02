var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var couchdb = require('nano')('http://localhost:5984');
var twitterdb = couchdb.db.use('twitter_single');
couchdb.db.get('twitter_single', function(err, body) {
    if (!err) {
        console.log("printing body");
        console.log(body);
    }
});
couchdb.db.list(function (error, body, headers) {
    // if(error) { return response.send(error.message, error['status-code']); }
    // response.send(body, 200);
    console.log(body);
});
twitterdb.get('30fb7bc60bdf10e107ea16ba56003324', { revs_info: true }, function(err, body) {
    if (!err)
        console.log(body.rows);
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function (){
   console.log("Listening on http://localhost:3000");
});


module.exports = app;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();
app.use("/public", express.static(__dirname + "/public"));

var couchdb = require('nano')('http://localhost:5984');
var twitterdb = couchdb.db.use('data');
couchdb.db.list(function (error, body, headers) {
    console.log(body);
});
var insta;

// twitterdb.view('raw_data','get_text', function(err, body) {
//     if (!err) {
//         console.log(body);
//         body.rows.forEach(function(doc) {
//             console.log('Tweet:'+doc.value);
//         });
//     }
// });
app.get('/getSentiment',function(req,res){
    twitterdb.view('data','get_sentiment',{group:"true"},function(err,body){
        if(!err){
            res.send(body);
        }else{
            var resp = {
                message:"Error: Failed to get data, Please verify connection with Couch db database",
                type:"db"
            };
            res.send(resp);
        }
    });
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
app.use('/users/list_user',usersRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// app.get('/search',function(req,res){
//     res.send('hello world');
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/users/list_user', function (req, res) {
    console.log("Got a GET request for /list_user");
    res.send('Page Listing');
});

app.listen(3000, function (){
   console.log("Listening on http://localhost:3000");
});

module.exports = app;

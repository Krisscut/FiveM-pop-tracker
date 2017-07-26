var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var db = require('./server/db');
var logger = require('./server/logger');
var tracker = require('./server/tracker');
var routes = require('./routes/index');
var users = require('./routes/users');
var servers = require('./routes/servers');
var debug = require('./routes/debug');
var constants = require('./server/constants');

//set up log directy
var fs = require('fs');
var dir = path.join(__dirname, 'logs');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());

app.use('/', routes);
app.use('/users', users);
app.use('/api/servers', servers);
app.use('/api/debug', debug);

// DB configuration : atm deactivated
//mongoose.connect('mongodb://trackerUser:tracker@localhost:27017/tracker');        // database : user @ adress : /password

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
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

db.connect();

// start tracker refresh interval internally - background task
tracker();
setInterval(tracker, constants.REQUEST_INTERVAL*1000);
logger.info('App started !');

module.exports = app;

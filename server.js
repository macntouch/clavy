'use strict'

var express = require('express'),
    config = require('./config'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    path = require('path'),
    db = require('./server/config/mongoose'),
    passport = require('passport'),
    app = express();

app
    .use(cookieParser())
    .use(bodyParser())
    .use(methodOverride())
    .use(session({secret: 'SECRET'}))
    .use(express.static('public'))
    .use(passport.initialize())
    .use(passport.session())
    .set('views', __dirname + '/server/views')
    .set('view engine', 'jade');

db.init(path.join(__dirname, '/server/models'));
require('./server/config/passport')(passport);
require('./server/routes/routes.js')(app, passport);

app.listen(config.app.port, config.app.ip, function () {
    console.log('server running on ' + config.app.ip + ':' + config.app.port);
});
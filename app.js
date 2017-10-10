var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var async = require('async');
var crypto = require('crypto');


var flash = require('express-flash');

// module for maintaining sessions
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// path is used the get the path of our files on the computer
var path = require ('path');

app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());

// initialization of session middleware 

app.use(session({
  name :'myCustomCookie',
  secret: 'myAppSecret', // encryption key 
  resave: true,
  httpOnly : true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


// set the templating engine 
app.set('view engine', 'jade');

//set the views folder
app.set('views',path.join(__dirname + '/app/views'));


var dbPath  = "mongodb://localhost/smartcartInventory";

// command to connect with database
db = mongoose.connect(dbPath);

mongoose.connection.once('open', function() {

	console.log("database connection open success");

});



// fs module, by default module for file management in nodejs
var fs = require('fs');

// include all our model files
fs.readdirSync('./app/models').forEach(function(file){
	// check if the file is js or not
	if(file.indexOf('.js'))
		// if it is js then include the file from that folder into our express app using require
		require('./app/models/'+file);

});// end for each

// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		route.controllerFunction(app);
	}
});//end for each

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });	

app.get('/',function(req,res)
{
  res.render('index');
  });


app.listen(3000, function () {
  console.log('Smart-cart app listening on port 3000!');
});
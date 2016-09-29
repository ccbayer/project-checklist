//************************
// ENVIRONMENT VARIABLES
// ***********************
// allows for saving local configuration / environment variables that are specific to machine
require('dotenv').config()

//********
// EXPRESS
// *******
// web server
var express = require('express');
var session = require('express-session');
var app = express();

// server session for saving user authentication - for now.
// this will need to be dealt with later via cookies and/or mongo
app.use(session( {
  secret: 'project-checklist',
  resave: true,
  saveUninitialized: true
}));

app.set('port', (process.env.PORT || 5000));
// static directory for assets
app.use(express.static(__dirname + '/public'));

// 'views' is directory for all template files
app.set('views', __dirname + '/views');
// we are using ejs for now for templating engine
app.set('view engine', 'ejs');

//********
// PASSPORT
// *******
// use Passport for user authentication.
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var googleCallbackURL = 'https://epsilon-project-checklist.herokuapp.com/auth/google/callback';
if (process.env.NODE_ENV === 'development') {
  googleCallbackURL = "http://localhost:5000/auth/google/callback";
}
// initialize passport
app.use(passport.initialize());
// set up session to allow serialization of users when authenticated
app.use(passport.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  console.log(user.id);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// set up google strategy to authenticate against our application ID / secret.
passport.use(new GoogleStrategy({
    clientID: "243948653223-ogu029nca575dp4k4rvbagficd09lu8k.apps.googleusercontent.com",
    clientSecret: process.env.clientSecret,
    callbackURL: googleCallbackURL
  },
  // success callback
  function(accessToken, refreshToken, profile, done) {
       console.log('user ' + profile.displayName + ' is logged in');
       return done(null, profile);
  }
));
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

//***************
// EXPRESS ROUTES
// **************
app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/login', function(req, res) {
  res.render('pages/login');
});

app.get('/welcome', ensureAuthenticated, function(req, res) {
  // set local var to name set by Google
  req.app.locals.userName = req.session.passport.user.displayName || 'Anonymous';
  res.render('pages/welcome');
});

// logout
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// error handling
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// set up routes for authentication.
// Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/welcome' }),
  function(req, res) {
    res.redirect('/welcome');
  });

  // listening
  app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
  });

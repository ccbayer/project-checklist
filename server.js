var express = require('express');
var session = require('express-session');
var app = express();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var googleCallbackURL = 'https://epsilon-project-checklist.herokuapp.com/auth/google/callback'
if (process.env.NODE_ENV === 'development') {
  googleCallbackURL = "http://localhost:5000/auth/google/callback";
}
app.use(session( {
  secret: 'test',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
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

passport.use(new GoogleStrategy({
    clientID: "243948653223-ogu029nca575dp4k4rvbagficd09lu8k.apps.googleusercontent.com",
    clientSecret: "6eQWjsnnTRGPh_FZLRQ8ukCd",
    callbackURL: googleCallbackURL
  },
  function(accessToken, refreshToken, profile, done) {
       console.log('user ' + profile.displayName + ' is logged in');
       return done(null, profile);
  }
));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// ROUTES
app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/login', function(request, response) {
  response.render('pages/login');
});

app.get('/welcome', ensureAuthenticated, function(request, response) {
  request.app.locals.userName = request.session.passport.user.displayName || 'Anonymous';
  response.render('pages/welcome');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

// set up routes for authentication
// Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/welcome' }),
  function(req, res) {
    res.redirect('/welcome');
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

// listening
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

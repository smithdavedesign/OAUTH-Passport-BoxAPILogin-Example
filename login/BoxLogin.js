var express 			= require('express');
var path 				= require('path');
var logger 				= require('morgan');
var cookieParser 		= require('cookie-parser');
var bodyParser			= require('body-parser');
var passport 			= require('passport');
var BoxStrategy 		= require('passport-box').Strategy;
var app 				= express();

var BOX_CLIENT_ID = "v0llagf8r72glqj9vby8p60kv9btlx52";
var BOX_CLIENT_SECRET = "uXVm6sKsRqDWD3DXCbsGBi7j3ELzTuTJ";


// Passport middleware
app.use(passport.initialize());
// Now setup the session strategy, this happens after the express-session
// initialisation as that must run on a request first. Once we have the data
// from express-session (remember, it converted from a session ID given to
// the user via a cookie, back into the data we stored against the ID) we can
// then pull our any additional information.
app.use(passport.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Box profile is
//   serialized and deserialized.
passport.serializeUser( function(user, done) {
	done(null, user);
});

passport.deserializeUser( function(obj, done) {
	done(null, obj);
});


// Use the BoxStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and 37signals
//   profile), and invoke a callback with a user object.
passport.use(new BoxStrategy({
    clientID: BOX_CLIENT_ID,
    clientSecret: BOX_CLIENT_SECRET,
    callbackURL: "http://localhost:9000/dashboard"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Box profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Box account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// configure Express
app.use(logger('dev'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '/public')));


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/Box
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Box authentication will involve
//   redirecting the user to Box.com.  After authorization, Box
//   will redirect the user back to this application at /auth/box/callback
app.get('/auth/box',
  passport.authenticate('box'),
  function(req, res){
    // The request will be redirected to Box for authentication, so this
    // function will not be called.
  });

// GET /auth/box/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/box/callback', 
  passport.authenticate('box', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  User = require('mongoose').model('User'),
  path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Module init function
 */
module.exports = function (app) {
  // Serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Deserialize sessions
  passport.deserializeUser(function (id, done) {
    User.findOne({
      _id: id
    }, '-salt -password', function (err, user) {
      done(err, user);
    });
  });

  // Initialize strategies
  config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
    require(path.resolve(strategy))(config);
  });

  // Add passport's middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Add JWT based API login middleware
  app.use(function (req, res, next) {
    // if user is already authenticated using session, skip JWT auth
    if (req.user) return next();
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
      if (err || (info && info.message !== 'No auth token')) {
        return res.status(422).json({
          status: 'error',
          message: 'invalid auth token'
        });
      }
      // if user is successfully retrieved using JWT auth, store it in request
      if (user) req.user = user;
      // proceed to next, unauthenticated will be handled by authorization policy
      next();
    })(req, res, next);
  });

};

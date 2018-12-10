'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  _ = require('lodash'),
  JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  User = require('mongoose').model('User'),
  config = require(require('path').resolve('./config/config'));

module.exports = function () {
  var opts = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromBodyField('auth_token'),
      ExtractJwt.fromUrlQueryParameter('auth_token')
    ])
  };

  // JWT strategy
  passport.use(new JwtStrategy(opts, function (jwtPayload, done) {
    User.findById(jwtPayload._id, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (!user || !_.matches(_.pick(jwtPayload, ['password', 'provider', 'roles']))(user)) {
        // User not found or account access has been
        // changed after issuing the auth token
        return done(new Error('invalid auth token'), false);
      }
      return done(null, user);
    });
  }));
};

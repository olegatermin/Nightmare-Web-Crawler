'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.handleResponse = function (res, propertyName) {
  return function (data) {
    var json = (data instanceof mongoose.Model) ? data.toJSON() : data;
    json = (propertyName === undefined) ? json : _.set({}, propertyName, json);
    return res.status(200).send(_.merge({
      status: 'success'
    }, json));
  };
};

exports.handleError = function (res) {
  return function (err) {
    return res.status(422).send({
      status: 'error',
      message: errorHandler.getErrorMessage(err)
    });
  };
};

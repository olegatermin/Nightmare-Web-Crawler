'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema,
  validator = require('validator');

/**
 * Task Schema
 */
var TaskSchema = new Schema({
  site: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    trim: true,
    default: 'finished'
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Task', TaskSchema);

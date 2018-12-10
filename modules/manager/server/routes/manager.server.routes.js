'use strict';

module.exports = function (app) {
  // customer Routes
  var manager = require('../controllers/manager.server.controller');
  var adminPolicy = require('../policies/manager.server.policy');

  // Setting up the customer api
  app.route('/api/targets/start').post(adminPolicy.isAllowed, manager.start);
  app.route('/api/targets/jobstatus').get(adminPolicy.isAllowed, manager.getJobStatus);
};

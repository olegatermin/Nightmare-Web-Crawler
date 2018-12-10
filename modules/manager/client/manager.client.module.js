(function (app) {
  'use strict';

  app.registerModule('manager', ['angularUtils.directives.dirPagination', 'ngDialog']);
  app.registerModule('manager.routes', ['ui.router', 'core.routes']);
  app.registerModule('manager.service');

}(ApplicationConfiguration));

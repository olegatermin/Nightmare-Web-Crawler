(function () {
  'use strict';

  angular
    .module('manager.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('manager', {
        url: '/manager',
        templateUrl: '/modules/manager/client/views/view-manager.client.view.html',
        controller: 'ManagerController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      });
  }
}());

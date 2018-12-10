(function () {
  'use strict';

  angular
    .module('manager.service')
    .factory('ManagerService', ManagerService);

  ManagerService.$inject = ['$resource', '$log'];

  function ManagerService($resource, $log) {
    return $resource('/api/targets', {}, {
      start: {
        method: 'POST',
        url: '/api/targets/start',
        params: {
          role: '@keyword',
          site: '@url',
          depth: '@depth'
        }
      },
      getJobStatus: {
        method: 'GET',
        url: '/api/targets/jobstatus'
      }
    });
  }
}());

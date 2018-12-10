(function () {
  'use strict';

  angular
    .module('manager')
    .controller('ManagerController', ManagerController);

  ManagerController.$inject = ['$scope', '$filter', 'ManagerService', 'ngDialog', '$interval'];

  function ManagerController($scope, $filter, ManagerService, ngDialog, $interval) {
    var vm = this;
    vm.depth = 0;
    vm.isFinished = true;
    ManagerService.getJobStatus(function (data) {
      if (data.message === 'success') {
        data.jobs.forEach(function (job) {
          if (job.site === 'www.zara.com') vm.isFinished = (job.status === 'finished');
        });
      }
    });
    vm.determinateInterval = 0;
    vm.sites = [['www.zara.com', 'e-commerce']];
    vm.stop = function () {
      ManagerService.stop({
        url: vm.url
      }, function (data) {
      });
    };
    $scope.startCrawling = function (rel) {
      ManagerService.start({
        url: rel,
        depth: vm.depth
      }, function (data) {
        toggleBudge(data);
      });
    };
    function toggleBudge(data) {
      if (data.site === 'www.zara.com') {
        if (data.status === 'started') vm.isFinished = false;
      }
    }
    vm.getStatus = function () {
      if (!vm.isFinished) {
        ManagerService.getJobStatus(function (data) {
          if (data.message === 'success') {
            data.jobs.forEach(function (job) {
              if (job.site === 'www.zara.com') vm.isFinished = (job.status === 'finished');
            });
          }
        });
      }
    };
    $interval(vm.getStatus, 10000);
  }
}());

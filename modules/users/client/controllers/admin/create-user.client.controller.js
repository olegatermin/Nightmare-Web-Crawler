(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('CreateUserController', CreateUserController);

  CreateUserController.$inject = ['$scope', '$state', 'UsersService', '$location', '$window', 'Notification'];

  function CreateUserController($scope, $state, UsersService, $location, $window, Notification) {
    var vm = this;

    vm.create = create;

    // Get an eventual error defined in the URL query string:
    if ($location.search().err) {
      Notification.error({ message: $location.search().err });
    }

    function create(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userCreate(vm.credentials)
        .then(onUserCreateSuccess)
        .catch(onUserCreateError);
    }

    function onUserCreateSuccess(response) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Create successful!' });
      // And redirect to the user list page
      $state.go('admin.users');
    }

    function onUserCreateError(response) {
      Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Create Error!', delay: 6000 });
    }
  }
}());

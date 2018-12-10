(function () {
  'use strict';

  angular
    .module('manager')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Manager',
      state: 'manager',
      roles: ['admin']
    });
  }
}());

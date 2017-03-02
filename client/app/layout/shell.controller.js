(function() {
  'use strict';

  angular
    .module('demouiApp.layout')
    .controller('ShellController', ShellController);

  ShellController.$inject = ['$mdSidenav', '$mdDialog', '$scope', '$location'];

  function ShellController($mdSidenav, $mdDialog, $scope, $location) {
    /*jshint validthis: true */
    var vm = this;

    vm.notificationsEnabled = true;
  }
})();

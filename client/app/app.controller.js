(function() {
  'use strict';

  angular
    .module('demouiApp')
    .controller('AppController', AppController);

  AppController.$inject = ['$scope'];

  function AppController($scope, DashboardFactory) {
    /*jshint validthis: true */
    var vm = this;

    activate();
    function activate() {
    }
  }
})();

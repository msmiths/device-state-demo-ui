(function() {
  'use strict';

  angular
  .module('demouiApp.toasts')
  .controller('ActionToastController', ActionToastController);

  ActionToastController.$inject = ['$scope', '$mdToast', 'DashboardFactory'];

  function ActionToastController($scope, $mdToast, DashboardFactory) {
    /*jshint validthis: true */
    var vm = this;

    // Copy the relevant arguments from the scope passsed in
    vm.message = $scope.message;
    vm.actionMessage = $scope.actionMessage;
    vm.actionCallback = $scope.actionCallback;

    /**
     * Activates the toast... performs one off initialization.
     */
    activate();
    function activate() {
    }

    /**
     * Event handler that handles the user clicking on the cancel button in the
     * dialog.
     */
    vm.closeToast = function() {
      // Hide the toast
      $mdToast.hide();
    };

    /**
     * Event handler that handles the user clicking on the save button in the
     * dialog.
     */
    vm.performAction = function($event) {
      vm.actionCallback($event);
    };
  }
})();

(function() {
  'use strict';

  angular
  .module('demouiApp.toasts')
  .controller('ErrorNotificationToastController', ErrorNotificationToastController);

  ErrorNotificationToastController.$inject = ['$scope', '$mdToast', 'DashboardFactory'];

  function ErrorNotificationToastController($scope, $mdToast, DashboardFactory) {
    /*jshint validthis: true */
    var vm = this;

    // Copy the relevant arguments from the scope passsed in
    vm.message = $scope.message;
    vm.notificationPayload = $scope.notificationPayload;
    vm.errorMessage = $scope.notificationPayload.message;
    vm.formattedEventPayload = null;

    /**
     * Activates the toast... performs one off initialization.
     */
    activate();
    function activate() {
      vm.formattedEventPayload = JSON.stringify(vm.notificationPayload.eventPayload, undefined, 2);
    }

    /**
     * Event handler that handles the user clicking on the cancel button in the
     * dialog.
     */
    vm.closeToast = function() {
      // Hide the toast
      $mdToast.hide();
    };
  }
})();

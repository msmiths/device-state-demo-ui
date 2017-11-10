(function() {
  'use strict';

  angular
  .module('demouiApp.toasts')
  .controller('RuleNotificationToastController', RuleNotificationToastController);

  RuleNotificationToastController.$inject = ['$scope', '$mdToast', 'DashboardFactory'];

  function RuleNotificationToastController($scope, $mdToast, DashboardFactory) {
    /*jshint validthis: true */
    var vm = this;

    // Copy the relevant arguments from the scope passsed in
    vm.message = $scope.message;
    vm.ruleCondition = $scope.ruleCondition;
    vm.notificationPayload = $scope.notificationPayload;
    vm.formattedState = null;

    /**
     * Activates the toast... performs one off initialization.
     */
    activate();
    function activate() {
      vm.formattedState = JSON.stringify(vm.notificationPayload.state, undefined, 2);
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

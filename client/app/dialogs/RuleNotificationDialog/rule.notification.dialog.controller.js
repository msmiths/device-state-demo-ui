(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('RuleNotificationDialogController', RuleNotificationDialogController);

  RuleNotificationDialogController.$inject = ['$scope', '$window', '$mdDialog', 'rule', 'payload', 'Constants'];

  function RuleNotificationDialogController($scope, $window, $mdDialog, rule, payload, Constants) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.rule = rule;
    vm.payload = payload;
    vm.formattedEventPayload = null;

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
      vm.formattedPayload = JSON.stringify(vm.payload, undefined, 2);
    }

    /**
     * Event handler that handles the user clicking on the close button in the
     * dialog.
     */
    vm.closeDialog = function() {
      // Hide then modal dialog
      $mdDialog.hide();
    };
  }
})();

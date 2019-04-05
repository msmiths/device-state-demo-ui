(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('ConfirmationDialogController', ConfirmationDialogController);

  ConfirmationDialogController.$inject = ['$scope', '$window', '$mdDialog', 'title', 'message', 'Constants', 'DashboardFactory'];

  function ConfirmationDialogController($scope, $window, $mdDialog, title, message, Constants, DashboardFactory) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.title = title;
    vm.message = message;

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
    }

    /**
     * Event handler that handles the user clicking on the cancel button in the
     * dialog.
     */
    vm.cancel = function() {
      // Hide then modal dialog
      $mdDialog.hide(false);
    };

    /**
     * Event handler that handles the user clicking on the ok button in the
     * dialog.
     */
    vm.ok = function() {
      // Hide then modal dialog
      $mdDialog.hide(true);
    };
  }
})();

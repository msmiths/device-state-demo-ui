(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('CredentialsDialogController', CredentialsDialogController);

  CredentialsDialogController.$inject = ['$scope', '$window', '$mdDialog', 'Constants', 'DashboardFactory'];

  function CredentialsDialogController($scope, $window, $mdDialog, Constants, DashboardFactory) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.apiKey = null;
    vm.authToken = null;

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
      // Read the current credentials from the DashboardFactory
      vm.apiKey = DashboardFactory.getApiKey();
      vm.authToken = DashboardFactory.getAuthenticationToken();
    }

    /**
     * Event handler that handles the user clicking on the cancel button in the
     * dialog.
     */
    vm.closeDialog = function() {
      // Hide then modal dialog
      $mdDialog.hide();
    };

    /**
     * Event handler that handles the user clicking on the save button in the
     * dialog.
     */
    vm.save = function() {

      // Write the credentials back to the DashboardFactory
      DashboardFactory.setApiKey(vm.apiKey);
      DashboardFactory.setAuthenticationToken(vm.authToken);

      // Hide then modal dialog
      $mdDialog.hide();
    };
  }
})();

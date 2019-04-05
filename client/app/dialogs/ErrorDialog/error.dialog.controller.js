(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('ErrorDialogController', ErrorDialogController);

  ErrorDialogController.$inject = ['$scope', '$window', '$mdDialog', 'response', 'Constants'];

  function ErrorDialogController($scope, $window, $mdDialog, response, Constants) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.response = response;
    vm.formattedResponseBody = null;

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
      vm.formattedResponseBody = JSON.stringify(vm.response.data, undefined, 2);
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

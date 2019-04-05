(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('HeaderDialogController', HeaderDialogController);

  HeaderDialogController.$inject = ['$scope', '$window', '$mdDialog', 'header', 'Constants'];

  function HeaderDialogController($scope, $window, $mdDialog, header, Constants) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.createMode = (header === null);
    vm.header = angular.copy(header); // Take a copy of the header so that we are not modifying the local view

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
    vm.closeDialog = function() {
      // Hide then modal dialog
      $mdDialog.hide(false);
    };

    /**
     * Event handler that handles the user clicking on the save button in the
     * dialog.
     */
    vm.save = function() {
      // Hide then modal dialog
      $mdDialog.hide(vm.header);
    };
  }
})();

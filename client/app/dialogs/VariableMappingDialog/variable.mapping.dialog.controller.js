(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('VariableMappingDialogController', VariableMappingDialogController);

  VariableMappingDialogController.$inject = ['$scope', '$window', '$mdDialog', 'name', 'value', 'Constants'];

  function VariableMappingDialogController($scope, $window, $mdDialog, name, value, Constants) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.createMode = (name === null);
    vm.name  = angular.copy(name);  // Take a copy of the name so that we are not modifying the local view
    vm.value = angular.copy(value); // Take a copy of the value so that we are not modifying the local view

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
      var response = {};
      response[vm.name] = vm.value;
      $mdDialog.hide(response);
    };
  }
})();

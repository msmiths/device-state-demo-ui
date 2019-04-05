(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('ActionDialogController', ActionDialogController);

  ActionDialogController.$inject = ['$scope', '$window', '$mdDialog', 'action', 'Constants', 'Action', 'HeaderDialog', 'ConfirmationDialog'];

  function ActionDialogController($scope, $window, $mdDialog, action, Constants, Action, HeaderDialog, ConfirmationDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.createMode = (action === null);
    vm.action = angular.copy(action); // Take a copy of the action so that we are not modifying the local view

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
      if (vm.createMode) {
        // Create the action object and default some properties
        vm.action = {
          'enabled': true,
          'configuration': {
            'method': 'POST',
            'contentType': 'application/json',
            'headers': []
          }
        };
      }
    }

    /**
     * Event handler that handles the user clicking on the create header button
     * in the dialog.
     */
    vm.createHeader = function(event) {
      HeaderDialog.show(event, null).then(function(response) {
        // We only need to do something if the response is not a boolean
        if (typeof response !== 'boolean') {
          vm.action.configuration.headers.push(response);
        }
      });
    };

    /*
     * The editHeader function is called when the user clicks the edit action
     * button.
     */
    vm.editHeader = function(event, header, index) {
      HeaderDialog.show(event, header).then(function(response) {
        // We only need to do something if the response is not a boolean
        if (typeof response !== 'boolean') {
          vm.action.configuration.headers[index] = response;
        }
      });
    }; // HeaderDialog

    /*
     * The deleteHeader function is called when the user clicks the trash icon
     * on the row for an header
     */
    vm.deleteHeader = function(event, header, index) {
      var title = 'Delete Header';
      var message = 'Are you sure you want to delete the header \'' + header.name + '\'';
      ConfirmationDialog.show(event, title, message).then(function(response) {
        // We are only expecting a boolean repsonse
        if (response) {
          // The user has confirmed that they want to delete the header
          vm.action.configuration.headers.splice(index, 1);
        }
      });
    }; // deleteHeader

    /**
     * Event handler that handles the user clicking on the close button in the
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

      if (vm.createMode) {
        // Inject the only type that we current support
        vm.action.type = Constants.actionType.WEBHOOK;

        /**
         * The dialog is in create mode.  Attempt to POST the new Action
         * resource to the server.
         */
        Action.save(
          vm.action,
          function(action) {
            // Hide the modal dialog
            $mdDialog.hide(true);
          },
          function(response) {
            $mdDialog.hide(response);
          }
        );
      } else {
        /**
         * The dialog is in edit mode.  Attempt to PUT the updated Rule
         * resource to the server.
         */
        Action.update(
          { 
            actionId: vm.action.id
          },
          vm.action,
          function(action) {
            // Hide the modal dialog
            $mdDialog.hide(true);
          },
          function(response) {
            $mdDialog.hide(response);
          }
        );
      }
    };
  }
})();

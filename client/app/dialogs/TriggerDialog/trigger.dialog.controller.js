(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('TriggerDialogController', TriggerDialogController);

  TriggerDialogController.$inject = ['$scope', '$window', '$mdDialog', 'action', 'trigger', 'logicalInterface', 'rules','Constants', 'DashboardFactory', 'Trigger', 'VariableMappingDialog', 'ConfirmationDialog'];

  function TriggerDialogController($scope, $window, $mdDialog, action, trigger, logicalInterface, rules, Constants, DashboardFactory, Trigger, VariableMappingDialog, ConfirmationDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.createMode = (trigger === null);
    vm.action = action;
    vm.trigger = angular.copy(trigger); // Take a copy of the trigger so that we are not modifying the local view
    vm.logicalInterface = logicalInterface;
    vm.rules = rules;

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
      if (vm.createMode) {
        // Parse the action configuration to determine which variables are required
        var tokens = Mustache.parse(JSON.stringify(vm.action.configuration));

        // Create the trigger object and default some properties
        vm.trigger = {
          'type': 'rule',
          'enabled': true,
          'configuration': {
            'logicalInterfaceId': vm.logicalInterface.id,
            'ruleId': '*',
            'type': '*',
            'typeId': '*',
            'instanceId': '*'
          },
          'variableMappings': {
          }
        };

        // Add any required variables
        angular.forEach(tokens, function(token, index) {
          // Make sure that this is a valid token
          if (token[0] !== 'text') {
            // Get the variable name
            var name = token[1];

            // Strip any WIoTP prefixes
            if (name.startsWith(Constants.misc.wiotpEscapeQuotesPrefix)) {
              name = name.substring(Constants.misc.wiotpEscapeQuotesPrefix.length);
            }

            // Add the variable mapping to the trigger
            vm.trigger.variableMappings[name] = '';
          }
        });
      }
    }

    /**
     * Event handler that handles the user clicking on the create variable
     * mapping button.
     */
    vm.createVariableMapping = function(event) {
      VariableMappingDialog.show(event, null, null).then(function(response) {
        // We only need to do something if the response is not a boolean
        if (typeof response !== 'boolean') {
          angular.forEach(response, function(expression, name) {
            vm.trigger.variableMappings[name] = expression;
          });
        }
      });
    };

    /*
     * The editVariableMapping function is called when the user clicks the edit
     * variable mapping button.
     */
    vm.editVariableMapping = function(event, originalName, originalValue) {
      VariableMappingDialog.show(event, originalName, originalValue).then(function(response) {
        // We only need to do something if the response is not a boolean
        if (typeof response !== 'boolean') {
          // First, check to see if the user modified the name of the variable
          if (originalName !== Object.keys(response)[0]) {
            delete vm.trigger.variableMappings[originalName];
          }

          // Now update the property
          vm.trigger.variableMappings[Object.keys(response)[0]] = Object.values(response)[0];
        }
      });
    };

    /*
     * The deleteHeader function is called when the user clicks the trash icon
     * on the row for an header
     */
    vm.deleteVariableMapping = function(event, name) {
      var title = 'Delete Variable Mapping';
      var message = 'Are you sure you want to delete the mapping for variable \'' + name + '\'';
      ConfirmationDialog.show(event, title, message).then(function(response) {
        // We are only expecting a boolean repsonse
        if (response) {
          // The user has confirmed that they want to delete the variable mapping
          delete vm.trigger.variableMappings[name];
        }
      });
    }; // deleteVariableMapping

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
        vm.trigger.type = Constants.triggerType.RULE;

        /**
         * The dialog is in create mode.  Attempt to POST the new Trigger
         * resource to the server.
         */
        Trigger.save(
          {
            actionId: vm.action.id
          },
          vm.trigger,
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
         * The dialog is in edit mode.  Attempt to PUT the updated Trigger
         * resource to the server.
         */
        Trigger.update(
          { 
            actionId: vm.action.id,
            triggerId: vm.trigger.id
          },
          vm.trigger,
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

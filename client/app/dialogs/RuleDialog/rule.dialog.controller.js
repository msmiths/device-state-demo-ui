(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('RuleDialogController', RuleDialogController);

  RuleDialogController.$inject = ['$scope', '$window', '$mdDialog', 'rule', 'Constants', 'DashboardFactory', 'DraftRule', 'DraftLogicalInterface', 'ErrorDialog'];

  function RuleDialogController($scope, $window, $mdDialog, rule, Constants, DashboardFactory, DraftRule, DraftLogicalInterface, ErrorDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.logicalInterface = null;
    vm.createMode = (rule === null);
    vm.rule = angular.copy(rule); // Take a copy of the rule so that we are not modifying the local view
    vm.disableButtons = false;

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
      vm.logicalInterface = DashboardFactory.getSelectedLogicalInterface();
    }

    function activateConfiguration() {
      var op = { 'operation': 'activate-configuration'};
      DraftLogicalInterface.performOperation(
        { 
          logicalIntfId: vm.logicalInterface.id
        },
        op,
        function(response) {
          // Hide the busy spinner
          DashboardFactory.setShowSpinner(false);

          // Hide the modal dialog
          $mdDialog.hide(true);
        },
        function(response) {
          // Hide the busy spinner
          DashboardFactory.setShowSpinner(false);

          // Close the dialog, returning the error
          $mdDialog.hide(response);
        }
      );
    }

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

      // Show the busy spinner and disable the dialog buttons
      DashboardFactory.setShowSpinner(true);
      vm.disableButtons = true;

      // Tidy up the rule object before creating/updating
      if (  vm.rule.notificationStrategy.when === 'every-time'
         || vm.rule.notificationStrategy.when === 'becomes-true'
         || vm.rule.notificationStrategy.when === 'persists'
      ) {
        delete vm.rule.notificationStrategy.count;
      }
      if (  vm.rule.notificationStrategy.when === 'every-time'
         || vm.rule.notificationStrategy.when === 'becomes-true'
      ) {
        delete vm.rule.notificationStrategy.timePeriod;
      }

      if (vm.createMode) {
        /**
         * The dialog is in create mode.  Attempt to POST the new Rule resource
         * to the server.
         */
        DraftRule.save(
          { 
            logicalIntfId: vm.logicalInterface.id
          },
          vm.rule,
          function(rule) {
            activateConfiguration();
          },
          function(response) {
            // Hide the busy spinner
            DashboardFactory.setShowSpinner(false);

            // Close the dialog, returning the error
            $mdDialog.hide(response);
          }
        );
      } else {
        /**
         * The dialog is in edit mode.  Attempt to PUT the updated Rule
         * resource to the server.
         */
        DraftRule.update(
          { 
            logicalIntfId: vm.logicalInterface.id,
            ruleId: vm.rule.id
          },
          vm.rule,
          function(rule) {
            activateConfiguration();
          },
          function(response) {
            // Hide the busy spinner
            DashboardFactory.setShowSpinner(false);

            // Close the dialog, returning the error
            $mdDialog.hide(response);
          }
        );
      }
    };

  }
})();

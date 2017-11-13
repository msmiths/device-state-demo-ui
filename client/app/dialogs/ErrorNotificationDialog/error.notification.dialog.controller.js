(function() {
  'use strict';

  angular
  .module('demouiApp.dialogs')
  .controller('ErrorNotificationDialogController', ErrorNotificationDialogController);

  ErrorNotificationDialogController.$inject = ['$scope', '$window', '$mdDialog', 'type', 'typeId', 'instanceId', 'eventId', 'rule', 'payload', 'Constants'];

  function ErrorNotificationDialogController($scope, $window, $mdDialog,  type, typeId, instanceId, eventId, rule, payload, Constants) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.type = type;
    vm.typeId = typeId;
    vm.instanceId = instanceId;
    vm.eventId = eventId;
    vm.rule = rule;
    vm.payload = payload;
    vm.errorMessage = vm.payload.message;
    vm.formattedEventPayload = null;

    /**
     * Activates the dialog... performs one off initialization.
     */
    activate();
    function activate() {
      vm.formattedPayload = JSON.stringify(vm.payload.eventPayload || vm.payload.state, undefined, 2);
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

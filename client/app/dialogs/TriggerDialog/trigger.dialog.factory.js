(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('TriggerDialog', TriggerDialog);

    TriggerDialog.$inject = ['$mdDialog'];

  function TriggerDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, action, trigger, logicalInterface, rules) {
      var parentEl = angular.element(document.body);
      var promise = $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/TriggerDialog/triggerDialog.html',
        controller: 'TriggerDialogController',
        controllerAs: 'vm',
        locals: {
          action: action,
          trigger: trigger,
          logicalInterface: logicalInterface,
          rules: rules
        }
      });

      return promise;
    }
  }
})();

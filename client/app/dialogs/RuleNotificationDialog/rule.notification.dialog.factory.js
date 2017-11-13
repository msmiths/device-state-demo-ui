(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('RuleNotificationDialog', RuleNotificationDialog);

    RuleNotificationDialog.$inject = ['$mdDialog'];

  function RuleNotificationDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, rule, payload) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/RuleNotificationDialog/ruleNotificationDialog.html',
        controller: 'RuleNotificationDialogController',
        controllerAs: 'vm',
        locals: {
          rule: rule,
          payload: payload
        }
      });
    }
  }
})();

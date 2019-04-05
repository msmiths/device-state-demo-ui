(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('RuleDialog', RuleDialog);

    RuleDialog.$inject = ['$mdDialog'];

  function RuleDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, rule) {
      var parentEl = angular.element(document.body);
      var promise = $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/RuleDialog/ruleDialog.html',
        controller: 'RuleDialogController',
        controllerAs: 'vm',
        locals: {
          rule: rule
        }
      });

      return promise;
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('VariableMappingDialog', VariableMappingDialog);

  VariableMappingDialog.$inject = ['$mdDialog'];

  function VariableMappingDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, name, value) {
      var parentEl = angular.element(document.body);
      var promise = $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/VariableMappingDialog/variableMappingDialog.html',
        controller: 'VariableMappingDialogController',
        controllerAs: 'vm',
        multiple: true,
        locals: {
          name: name,
          value: value
        }
      });

      return promise;
    }
  }
})();

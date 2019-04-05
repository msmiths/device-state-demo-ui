(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('ActionDialog', ActionDialog);

  ActionDialog.$inject = ['$mdDialog'];

  function ActionDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, action) {
      var parentEl = angular.element(document.body);
      var promise = $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/ActionDialog/actionDialog.html',
        controller: 'ActionDialogController',
        controllerAs: 'vm',
        locals: {
          action: action
        }
      });

      return promise;
    }
  }
})();

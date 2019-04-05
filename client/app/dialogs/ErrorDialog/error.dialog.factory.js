(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('ErrorDialog', ErrorDialog);

    ErrorDialog.$inject = ['$mdDialog'];

  function ErrorDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, response) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/ErrorDialog/errorDialog.html',
        controller: 'ErrorDialogController',
        controllerAs: 'vm',
        locals: {
          response: response
        }
      });
    }
  }
})();

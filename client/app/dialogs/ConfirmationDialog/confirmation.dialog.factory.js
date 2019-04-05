(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('ConfirmationDialog', ConfirmationDialog);

    ConfirmationDialog.$inject = ['$mdDialog'];

  function ConfirmationDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, title, message) {
      var parentEl = angular.element(document.body);
      var promise = $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/ConfirmationDialog/confirmationDialog.html',
        controller: 'ConfirmationDialogController',
        controllerAs: 'vm',
        multiple: true,
        locals: {
          title: title,
          message: message
        }

      });

      return promise;
    }
  }
})();

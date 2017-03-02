(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('CredentialsDialog', CredentialsDialog);

  CredentialsDialog.$inject = ['$mdDialog'];

  function CredentialsDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/CredentialsDialog/credentialsDialog.html',
        controller: 'CredentialsDialogController',
        controllerAs: 'vm'
      });
    }
  }
})();

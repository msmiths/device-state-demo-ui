(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('HeaderDialog', HeaderDialog);

    HeaderDialog.$inject = ['$mdDialog'];

  function HeaderDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, header) {
      var parentEl = angular.element(document.body);
      var promise = $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/HeaderDialog/headerDialog.html',
        controller: 'HeaderDialogController',
        controllerAs: 'vm',
        multiple: true,
        locals: {
          header: header
        }
      });

      return promise;
    }
  }
})();

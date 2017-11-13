(function() {
  'use strict';

  angular
    .module('demouiApp.dialogs')
    .factory('ErrorNotificationDialog', ErrorNotificationDialog);

    ErrorNotificationDialog.$inject = ['$mdDialog'];

  function ErrorNotificationDialog($mdDialog) {
    var dialog = {
      show: show
    };
    return dialog;

    /**
     * Shows the modal dialog
     */
    function show(event, type, typeId, instanceId, eventId, rule, payload) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: event,
        templateUrl: 'app/dialogs/ErrorNotificationDialog/errorNotificationDialog.html',
        controller: 'ErrorNotificationDialogController',
        controllerAs: 'vm',
        locals: {
          type: type,
          typeId: typeId,
          instanceId: instanceId,
          eventId: eventId,
          rule: rule,
          payload: payload
        }
      });
    }
  }
})();

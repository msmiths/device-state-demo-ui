(function() {
  'use strict';

  angular
    .module('demouiApp.toasts')
    .factory('ErrorNotificationToast', ErrorNotificationToast);

  ErrorNotificationToast.$inject = ['$rootScope', '$mdToast'];

  function ErrorNotificationToast($rootScope, $mdToast) {
    var toastOpen = false;
    
    var toast = {
      show: show,
      hide: hide
    };
    return toast;

    /**
     * Shows the toast
     */
    function show(options) {

      /*
       * Create a new scope for the toast and initialize it with the data passed
       * in the options object
       */ 
      var toastScope = $rootScope.$new();
      toastScope.message = options.message;
      toastScope.notificationPayload = options.notificationPayload;
      toastScope.closeCallback = options.closeCallback;
      
      /*
       * Now create the options object for the toast and initialize it with any
       * options passed in the options object... using sensible defaults where
       * appropriate.
       */ 
      var toastOptions = {
        hideDelay: options.hideDelay || 0,
        position: options.position || 'top right',
        templateUrl: 'app/toasts/ErrorNotificationToast/errorNotificationToast.html',
        controller: 'ErrorNotificationToastController',
        controllerAs: 'vm',
        scope: toastScope
      };
      if (!toastOpen) {
        toastOpen = true;
        $mdToast.show(toastOptions).then(function(response) {
          toastOpen = false;
          
          // Invoke the closeCallback passed in the options, if any
          if (toastScope.closeCallback) {
            toastScope.closeCallback();
          }
        });   
      }
    }
    
    /**
     * Hides the toast
     */
    function hide() {
      if (toastOpen) {
        // Hide the toast
        $mdToast.hide().then(function() {
          toastOpen = false;
        });
      }
    }
  }
})();

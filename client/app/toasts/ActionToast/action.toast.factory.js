(function() {
  'use strict';

  angular
    .module('demouiApp.toasts')
    .factory('ActionToast', ActionToast);

  ActionToast.$inject = ['$rootScope', '$mdToast'];

  function ActionToast($rootScope, $mdToast) {
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
      toastScope.actionMessage = options.actionMessage;
      toastScope.actionCallback = options.actionCallback;
      
      /*
       * Now create the options object for the toast and initialize it with any
       * options passed in the options object... using sensible defaults where
       * appropriate.
       */ 
      var toastOptions = {
        hideDelay: options.hideDelay || 0,
        position: options.position || 'top right',
        templateUrl: 'app/toasts/ActionToast/actionToast.html',
        controller: 'ActionToastController',
        controllerAs: 'vm',
        scope: toastScope
      };
      if (!toastOpen) {
        toastOpen = true;
        $mdToast.show(toastOptions).then(function(response) {
          if ( response == 'ok' ) {
            alert('You clicked \'OK\'.');
          }
          toastOpen = false;
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

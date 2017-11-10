(function() {
  'use strict';

  angular
    .module('demouiApp.layout')
    .controller('ShellController', ShellController);

  ShellController.$inject = ['$scope', '$mdSidenav', 'DashboardFactory', 'ActionToast', 'CredentialsDialog'];

  function ShellController($scope, $mdSidenav, DashboardFactory, ActionToast, CredentialsDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.notificationsEnabled = true;
    
    /**
     * Activates the view... performs one off initialization.
     */
    activate();
    function activate() {
      /*
       * Set watches on the DashboardFactory functions that return the API Key
       * and Authentication Token.  This enables to detect changes to the
       * credentials specified by the user and display a toast if they are not
       * valid.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getApiKey();
        },
        onCredentialsChanged
      );
      $scope.$watch(
        function() {
          return DashboardFactory.getAuthenticationToken();
        },
        onCredentialsChanged
      );

      /*
       * Set a watch on the DashboardFactory function that returns the API Key
       * and Authentication Token.  This enables to detect changes to the
       * credentials specified by the user and display a toast if they are not
       * valid.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedLogicalInterface();
        },
        onSelectedInstanceChanged
      );
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedType();
        },
        onSelectedInstanceChanged
      );
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedInstance();
        },
        onSelectedInstanceChanged
      );
    } // activate
    
    /**
     * Called when the user modifies their credentials using the credentials
     * dialog. 
     */
    function onCredentialsChanged() {
      if (  DashboardFactory.getApiKey()
         && DashboardFactory.getAuthenticationToken()
         ) {
        /*
         * The user has specified some credentials... so hide this particular
         * toast.
         */
        ActionToast.hide();
      } else {
        ActionToast.show({
          message: 'Before you begin, you must enter a valid API Key and Authentication Token in the Credentials Dialog.',
          actionMessage: 'Edit Credentials',
          actionCallback: function(event) {
            CredentialsDialog.show(event);
          },
          closeCallback: function() {
            onSelectedInstanceChanged();
          }
        });
      }
    }
    
    /**
     * Called when the user modifies the selected device that they want to view
     * the state for.
     */
    function onSelectedInstanceChanged() {
      if (   DashboardFactory.getSelectedLogicalInterface()
          && DashboardFactory.getSelectedType()
          && DashboardFactory.getSelectedInstance()
         ) {
        ActionToast.hide();
      } else {
        ActionToast.show({
          message: 'Now you need to select the Device whose state you want to view.',
          actionMessage: 'Show Device Selector',
          actionCallback: function(event) {
            $mdSidenav('left').toggle();
          }
        });
      }
    }
  }
})();

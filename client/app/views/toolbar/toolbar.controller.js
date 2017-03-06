(function() {
  'use strict';

  angular
  .module('demouiApp.toolbar')
  .controller('ToolbarController', ToolbarController);

  ToolbarController.$inject = ['$mdSidenav', 'CredentialsDialog', 'DashboardFactory'];

  function ToolbarController($mdSidenav, CredentialsDialog, DashboardFactory) {
    /*jshint validthis: true */
    var vm = this;

    vm.DashboardFactory = DashboardFactory;

    /**
     * Activates the view... performs one off initialization.
     */
    activate();
    function activate() {
    }

    /**
     * Toggles the side navigation view
     */
    vm.toggleNav = function() {
      $mdSidenav('left').toggle();
    }

    /**
     * Toggles the menu
     */
    vm.openMenu = function($mdOpenMenu, event) {
      $mdOpenMenu(event);
    };

    /**
     * Shows the credentials dialog
     */
    vm.showCredentialsDialog = function(event) {
      CredentialsDialog.show(event);
    };

    /**
     * Toggles whether to poll for state
     */
    vm.toggleUpdates = function(event) {
      DashboardFactory.setUpdatesEnabled(!DashboardFactory.getUpdatesEnabled());
    };
  }
})();

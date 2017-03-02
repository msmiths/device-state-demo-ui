(function() {
  'use strict';

  angular
    .module('demouiApp.layout')
    .config(config);

  config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

  function config($stateProvider, $urlRouterProvider, $httpProvider, DashboardFactory) {

    // Ensure that cookies are sent with all AJAX requests
    $httpProvider.defaults.withCredentials = true;

    $stateProvider
      .state('dashboard', {
        url:'/',
        views: {
          'nav': {
            templateUrl: 'app/views/nav/nav.html',
            controller: 'NavController',
            controllerAs: 'vm'
          },
          'toolbar': {
            templateUrl: 'app/views/toolbar/toolbar.html',
            controller: 'ToolbarController',
            controllerAs: 'vm'
          },
         'main': {
           templateUrl: 'app/views/main/main.html',
           controller: 'MainController',
           controllerAs: 'vm'
         }
        }
      });
  }
})();

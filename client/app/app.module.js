(function() {
  'use strict';

  angular.module('demouiApp', [
      /*
       * Angular and third-party modules
       */
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ngAnimate',
      'ngMessages',
      'ui.router',
      'ngMaterial',

      /*
       * Feature areas.
       *
       * IMPORTANT: The order that the modules appear here does matter.  The
       *            constants module needs to be registered before any modules
       *            that depend on it during the configuration phase of the
       *            application life cycle... otherwise you get dependency
       *            injection (DI) errors.
       */
      'demouiApp.constants',
      'demouiApp.dialogs',
      'demouiApp.directives',
      'demouiApp.factories',
      'demouiApp.layout',
      'demouiApp.main',
      'demouiApp.nav',
      'demouiApp.toolbar',
      'demouiApp.resources',
      'demouiApp.toasts'
    ]
  );

  angular
    .module('demouiApp')
    .config(function($mdIconProvider) {
      $mdIconProvider
        .iconSet('action', '../assets/iconsets/action-icons.svg', 24)
        .iconSet('alert', '../assets/iconsets/alert-icons.svg', 24)
        .iconSet('av', '../assets/iconsets/av-icons.svg', 24)
        .iconSet('communication', '../assets/iconsets/communication-icons.svg', 24)
        .iconSet('content', '../assets/iconsets/content-icons.svg', 24)
        .iconSet('device', '../assets/iconsets/device-icons.svg', 24)
        .iconSet('editor', '../assets/iconsets/editor-icons.svg', 24)
        .iconSet('file', '../assets/iconsets/file-icons.svg', 24)
        .iconSet('hardware', '../assets/iconsets/hardware-icons.svg', 24)
        .iconSet('icons', '../assets/iconsets/icons-icons.svg', 24)
        .iconSet('image', '../assets/iconsets/image-icons.svg', 24)
        .iconSet('maps', '../assets/iconsets/maps-icons.svg', 24)
        .iconSet('navigation', '../assets/iconsets/navigation-icons.svg', 24)
        .iconSet('notification', '../assets/iconsets/notification-icons.svg', 24)
        .iconSet('social', '../assets/iconsets/social-icons.svg', 24)
        .iconSet('toggle', '../assets/iconsets/toggle-icons.svg', 24)
        .iconSet('avatar', '../assets/iconsets/avatar-icons.svg', 128);
    }
  );

  angular
    .module('demouiApp')
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider
        .otherwise('/');

      $locationProvider.html5Mode(true);
    }
  );
})();

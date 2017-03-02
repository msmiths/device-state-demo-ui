(function() {
  'use strict';

  /**
   * Define the constants that need to be available across the Dashboard
   * application.  Since this Angular creates constants during the configuration
   * phase of the application bootstrap process, services are not available
   * because they have not been created yet.  For this reason, the constants
   * cannot have dependencies on any services defined by Angular or by the
   * Dashboard application.
   */
  angular
    .module('demouiApp.constants')
    .constant('Constants', constants()); // Dashboard constants

  function constants() {
    /*
     * Calculate the hostNameSuffix from the window.location.host.  Remember
     * that the value of the base Javascript window.location.host attribute
     * contains the host AND port, not just the hostname.
     */
    var baseURL = '/api/v0002';
    var schemaEndpoint = baseURL + '/schemas/:schemaId';
    var schemaContentEndpoint = baseURL + '/schemas/:schemaId/content';
    var applicationInterfaceEndpoint = baseURL + '/applicationinterfaces/:appIntfId';
    var applicationInterfaceSchemaEndpoint = applicationInterfaceEndpoint + '/schema';
    var deviceTypesEndpoint = baseURL + '/device/types/:typeId';
    var devicesEndpoint = deviceTypesEndpoint + '/devices';
    var deviceEndpoint = devicesEndpoint + '/:deviceId';
    var deviceTypeApplicationInterfacesEndpoint = deviceTypesEndpoint + '/applicationinterfaces';
    var deviceStateEndpoint = deviceEndpoint + '/state/:appIntfId';
    var httpHeaders = {
      'authorization': 'Authorization'
    };
    var misc = {
      'basic': 'Basic '
    };

    var factory = {
        'schemaEndpoint': schemaEndpoint,
        'schemaContentEndpoint': schemaContentEndpoint,
        'applicationInterfaceEndpoint': applicationInterfaceEndpoint,
        'deviceTypesEndpoint': deviceTypesEndpoint,
        'devicesEndpoint': devicesEndpoint,
        'deviceEndpoint': devicesEndpoint,
        'deviceTypeApplicationInterfacesEndpoint': deviceTypeApplicationInterfacesEndpoint,
        'deviceStateEndpoint': deviceStateEndpoint,
        'httpHeaders': httpHeaders,
        'misc': misc
    };

    Object.freeze(factory);
    return factory;
  }
})();

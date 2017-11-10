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
    var baseURL = '/api/v0002';
    var draftBaseURL = baseURL + '/draft';
    var schemaEndpoint = baseURL + '/schemas/:schemaId';
    var schemaContentEndpoint = baseURL + '/schemas/:schemaId/content';
    var logicalInterfaceEndpoint = baseURL + '/logicalinterfaces/:logicalIntfId';
    var logicalInterfaceSchemaEndpoint = logicalInterfaceEndpoint + '/schema';
    var ruleEndpoint = logicalInterfaceEndpoint + '/rules/:ruleId';
    var draftDeviceTypesEndpoint = draftBaseURL + '/device/types/:typeId';
    var deviceTypesEndpoint = baseURL + '/device/types/:typeId';
    var devicesEndpoint = deviceTypesEndpoint + '/devices';
    var deviceEndpoint = devicesEndpoint + '/:deviceId';
    var draftDeviceTypeLogicalInterfacesEndpoint = draftDeviceTypesEndpoint + '/logicalinterfaces';
    var deviceTypeLogicalInterfacesEndpoint = deviceTypesEndpoint + '/logicalinterfaces';
    var deviceStateEndpoint = deviceEndpoint + '/state/:logicalIntfId';
    var resourceType = {
      DEVICE_TYPE: 'DEVICE_TYPE'
    };
    var httpHeaders = {
      authorization: 'Authorization'
    };
    var apiKeyRegex = '[a]-[a-z0-9]{6}-[a-z0-9]{10}';
    var ruleIdRegex = /[iot\-2\/intf\/[a-z0-9]{24}\/rule\/([a-z0-9]{24})\/evt\/trigger/;
    var mqttDestinationNameSuffix = {
      StateNotification: '/evt/state',
      RuleNotification: '/evt/trigger',
      ErrorNotification: '/err/data'
    };
    var misc = {
      basic: 'Basic '
    };

    var factory = {
        schemaEndpoint: schemaEndpoint,
        schemaContentEndpoint: schemaContentEndpoint,
        logicalInterfaceEndpoint: logicalInterfaceEndpoint,
        logicalInterfaceSchemaEndpoint: logicalInterfaceSchemaEndpoint,
        ruleEndpoint: ruleEndpoint,
        draftDeviceTypesEndpoint: draftDeviceTypesEndpoint,
        deviceTypesEndpoint: deviceTypesEndpoint,
        devicesEndpoint: devicesEndpoint,
        deviceEndpoint: devicesEndpoint,
        draftDeviceTypeLogicalInterfacesEndpoint: draftDeviceTypeLogicalInterfacesEndpoint,
        deviceTypeLogicalInterfacesEndpoint: deviceTypeLogicalInterfacesEndpoint,
        deviceStateEndpoint: deviceStateEndpoint,
        resourceType: resourceType,
        httpHeaders: httpHeaders,
        apiKeyRegex: apiKeyRegex,
        ruleIdRegex: ruleIdRegex,
        mqttDestinationNameSuffix: mqttDestinationNameSuffix,
        misc: misc
    };

    Object.freeze(factory);
    return factory;
  }
})();

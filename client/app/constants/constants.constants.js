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
    var draftLogicalInterfaceEndpoint = draftBaseURL + '/logicalinterfaces/:logicalIntfId';
    var logicalInterfaceEndpoint = baseURL + '/logicalinterfaces/:logicalIntfId';
    var logicalInterfaceSchemaEndpoint = logicalInterfaceEndpoint + '/schema';
    var draftRuleEndpoint = draftLogicalInterfaceEndpoint + '/rules/:ruleId';
    var ruleEndpoint = logicalInterfaceEndpoint + '/rules/:ruleId';
    var draftDeviceTypesEndpoint = draftBaseURL + '/device/types/:typeId';
    var deviceTypesEndpoint = baseURL + '/device/types/:typeId';
    var devicesEndpoint = deviceTypesEndpoint + '/devices';
    var deviceEndpoint = devicesEndpoint + '/:deviceId';
    var draftDeviceTypeLogicalInterfacesEndpoint = draftDeviceTypesEndpoint + '/logicalinterfaces';
    var deviceTypeLogicalInterfacesEndpoint = deviceTypesEndpoint + '/logicalinterfaces';
    var deviceStateEndpoint = deviceEndpoint + '/state/:logicalIntfId';
    var thingTypesEndpoint = baseURL + '/thing/types/:typeId';
    var thingsEndpoint = thingTypesEndpoint + '/things';
    var thingEndpoint = thingsEndpoint + '/:thingId';
    var thingTypeLogicalInterfacesEndpoint = thingTypesEndpoint + '/logicalinterfaces';
    var thingStateEndpoint = thingEndpoint + '/state/:logicalIntfId';
    var actionEndpoint = baseURL + '/actions/:actionId';
    var triggerEndpoint = actionEndpoint + '/triggers/:triggerId';
    var resourceType = {
      DEVICE_TYPE: 'DEVICE_TYPE',
      THING_TYPE: 'THING_TYPE'
    };
    var actionType = {
      WEBHOOK: 'webhook'
    };
    var triggerType = {
      RULE: 'rule'
    };
    var httpHeaders = {
      authorization: 'Authorization'
    };
    var nameRegex = '^(?![ ]+$)[\\w \\-\\_\\.]{1,128}';
    var apiKeyRegex = '[a]-[a-z0-9]{6}-[a-z0-9]{10}';
    var ruleIdRegex = /iot\-2\/intf\/[a-z0-9]{24}\/rule\/([a-z0-9]{24})\/evt\/trigger/;
    var errorTopicRegex = /iot\-2\/type\/([A-Za-z0-9\-\_\.]{1,36})\/id\/([A-Za-z0-9\-\_\.]{1,36})\/err\/data/;
    var headerNameRegex = '^[\\x21-\\x7E&&[^:]]{1,2048}';
    var headerValueRegex = '^[\\p{ASCII}]{1,2048}';
    var mqttDestinationNameSuffix = {
      StateNotification: '/evt/state',
      RuleNotification: '/evt/trigger',
      ErrorNotification: '/err/data'
    };
    var misc = {
      device: 'device',
      thing: 'thing',
      basic: 'Basic ',
      defaultToastHideDelay: 10000,
      wiotpEscapeQuotesPrefix: '@wiotp_eq_'
    };

    var factory = {
        schemaEndpoint: schemaEndpoint,
        schemaContentEndpoint: schemaContentEndpoint,
        draftLogicalInterfaceEndpoint: draftLogicalInterfaceEndpoint,
        logicalInterfaceEndpoint: logicalInterfaceEndpoint,
        logicalInterfaceSchemaEndpoint: logicalInterfaceSchemaEndpoint,
        draftRuleEndpoint: draftRuleEndpoint,
        ruleEndpoint: ruleEndpoint,
        draftDeviceTypesEndpoint: draftDeviceTypesEndpoint,
        deviceTypesEndpoint: deviceTypesEndpoint,
        devicesEndpoint: devicesEndpoint,
        deviceEndpoint: devicesEndpoint,
        draftDeviceTypeLogicalInterfacesEndpoint: draftDeviceTypeLogicalInterfacesEndpoint,
        deviceTypeLogicalInterfacesEndpoint: deviceTypeLogicalInterfacesEndpoint,
        deviceStateEndpoint: deviceStateEndpoint,
        thingTypesEndpoint: thingTypesEndpoint,
        thingsEndpoint: thingsEndpoint,
        thingEndpoint: thingEndpoint,
        thingTypeLogicalInterfacesEndpoint: thingTypeLogicalInterfacesEndpoint,
        thingStateEndpoint: thingStateEndpoint,
        actionEndpoint: actionEndpoint,
        triggerEndpoint: triggerEndpoint,
        resourceType: resourceType,
        triggerType: triggerType,
        actionType: actionType,
        httpHeaders: httpHeaders,
        nameRegex: nameRegex,
        apiKeyRegex: apiKeyRegex,
        ruleIdRegex: ruleIdRegex,
        errorTopicRegex: errorTopicRegex,
        headerNameRegex: headerNameRegex,
        headerValueRegex: headerValueRegex,
        mqttDestinationNameSuffix: mqttDestinationNameSuffix,
        misc: misc
    };

    Object.freeze(factory);
    return factory;
  }
})();

(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('DeviceType', DeviceTypeResource);

  DeviceTypeResource.$inject = ['$resource', 'Constants'];

  function DeviceTypeResource($resource, Constants) {
    return $resource(
      Constants.deviceTypesEndpoint,
      {
        typeId: '@typeId',
        deviceId: '@deviceId',
        logicalIntfId: '@logicalIntfId'
      }, {
        update : {
          method : 'PUT'
        },
        query: {
          method: 'GET',
          isArray: false
        },
        getDevices: {
          method: 'GET',
          url: Constants.devicesEndpoint
        },
        getLogicalInterfaces: {
          method: 'GET',
          isArray: true,
          url: Constants.deviceTypeLogicalInterfacesEndpoint
        },
        getDeviceState: {
          method: 'GET',
          url: Constants.deviceStateEndpoint
        }
      }
    );
  }
})();

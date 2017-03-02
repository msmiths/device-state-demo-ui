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
        appIntfId: '@appIntfId'
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
        getApplicationInterfaces: {
          method: 'GET',
          isArray: true,
          url: Constants.deviceTypeApplicationInterfacesEndpoint
        },
        getDeviceState: {
          method: 'GET',
          url: Constants.deviceStateEndpoint
        }
      }
    );
  }
})();

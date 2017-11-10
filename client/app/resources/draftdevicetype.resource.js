(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('DraftDeviceType', DraftDeviceTypeResource);

  DraftDeviceTypeResource.$inject = ['$resource', 'Constants'];

  function DraftDeviceTypeResource($resource, Constants) {
    return $resource(
      Constants.draftDeviceTypesEndpoint,
      {
        typeId: '@typeId',
        logicalIntfId: '@logicalIntfId'
      }, {
        query: {
          method: 'GET',
          isArray: false
        },
        getDraftLogicalInterfaces: {
          method: 'GET',
          isArray: true,
          url: Constants.draftDeviceTypeLogicalInterfacesEndpoint
        }
      }
    );
  }
})();

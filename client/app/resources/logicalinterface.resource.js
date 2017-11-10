(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('LogicalInterface', LogicalInterfaceResource);

  LogicalInterfaceResource.$inject = ['$resource', 'Constants'];

  function LogicalInterfaceResource($resource, Constants) {
    return $resource(
      Constants.logicalInterfaceEndpoint,
      {
        logicalIntfId: '@logicalIntfId'
      }, {
        update : {
          method : 'PUT'
        },
        query: {
          method: 'GET',
          isArray: false
        },
        getSchema: {
          method: 'GET',
          url: Constants.logicalInterfaceSchemaEndpoint
        }
      }
    );
  }
})();

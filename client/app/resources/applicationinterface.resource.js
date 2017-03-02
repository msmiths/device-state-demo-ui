(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('ApplicationInterface', ApplicationInterfaceResource);

  ApplicationInterfaceResource.$inject = ['$resource', 'Constants'];

  function ApplicationInterfaceResource($resource, Constants) {
    return $resource(
      Constants.applicationInterfaceEndpoint,
      {
        appIntfId: '@appIntfId'
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
          url: Constants.applicationInterfaceSchemaEndpoint
        }
      }
    );
  }
})();

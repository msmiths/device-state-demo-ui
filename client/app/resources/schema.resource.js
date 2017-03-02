(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('Schema', SchemaResource);

  SchemaResource.$inject = ['$resource', 'Constants'];

  function SchemaResource($resource, Constants) {
    return $resource(
      Constants.schemaEndpoint,
      {
        schemaId: '@schemaId'
      }, {
        update : {
          method : 'PUT'
        },
        query: {
          method: 'GET',
          isArray: false
        },
        getContent: {
          method: 'GET',
          url: Constants.schemaContentEndpoint
        }
      }
    );
  }
})();

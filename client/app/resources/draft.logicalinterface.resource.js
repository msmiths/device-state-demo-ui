(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('DraftLogicalInterface', DraftLogicalInterfaceResource);
   
  DraftLogicalInterfaceResource.$inject = ['$resource', 'Constants'];

  function DraftLogicalInterfaceResource($resource, Constants) {
    return $resource(
      Constants.draftLogicalInterfaceEndpoint,
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
        performOperation: {
          method: 'PATCH'
        }
      }
    );
  }
})();

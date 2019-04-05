(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('Action', ActionResource);
   
  ActionResource.$inject = ['$resource', 'Constants'];

  function ActionResource($resource, Constants) {
    return $resource(
      Constants.actionEndpoint,
      {
        actionId: '@actionId'
      }, {
        update : {
          method : 'PUT'
        },
        query: {
          method: 'GET',
          isArray: false
        }
      }
    );
  }
})();

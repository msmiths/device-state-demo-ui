(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('Trigger', TriggerResource);
   
  TriggerResource.$inject = ['$resource', 'Constants'];

  function TriggerResource($resource, Constants) {
    return $resource(
      Constants.triggerEndpoint,
      {
        actionId: '@actionId',
        triggerId: '@triggerId'
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

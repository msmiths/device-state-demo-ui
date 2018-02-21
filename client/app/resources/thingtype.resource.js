(function() {	
  'use strict';	
  
  angular	
    .module('demouiApp.resources')	
    .factory('ThingType', ThingTypeResource);	

  ThingTypeResource.$inject = ['$resource', 'Constants'];	

  function ThingTypeResource($resource, Constants) {	
    return $resource(	
      Constants.thingTypesEndpoint,	
      {	
        typeId: '@typeId',	
        thingId: '@thingId',	
        appIntfId: '@appIntfId'	
      }, {	
        update : {	
          method : 'PUT'	
        },	
        query: {	
          method: 'GET',	
          isArray: false	
        },	
        getThings: {	
          method: 'GET',	
          url: Constants.thingsEndpoint	
        },	
        getLogicalInterfaces: {	
          method: 'GET',	
          isArray: true,	
          url: Constants.thingTypeLogicalInterfacesEndpoint	
        },	
        getThingState: {	
          method: 'GET',	
          url: Constants.thingStateEndpoint	
        }	
      }	
    );	
  }	
})();
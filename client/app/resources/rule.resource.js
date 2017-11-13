(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('Rule', RuleResource);

  RuleResource.$inject = ['$resource', 'Constants'];

  function RuleResource($resource, Constants) {
    return $resource(
      Constants.ruleEndpoint,
      {
        logicalIntfId: '@logicalIntfId',
        ruleId: '@ruleId'
      }, {
        update : {
          method : 'PUT'
        }
      }
    );
  }
})();

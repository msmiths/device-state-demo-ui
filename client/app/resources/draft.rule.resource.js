(function() {
  'use strict';

  angular
    .module('demouiApp.resources')
    .factory('DraftRule', DraftRuleResource);

  DraftRuleResource.$inject = ['$resource', 'Constants'];

  function DraftRuleResource($resource, Constants) {
    return $resource(
      Constants.draftRuleEndpoint,
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

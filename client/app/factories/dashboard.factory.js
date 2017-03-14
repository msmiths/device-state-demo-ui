(function() {
  'use strict';

/**
 * Define a factory that can be used to retrieve the state that needs to be
 * shared across the controllers in the dashboard, e.g., the api key and
 * authentication token used in REST calls to the backend.
 */
  angular
    .module('demouiApp.factories')
    .factory('DashboardFactory', DashboardFactory);

  DashboardFactory.$inject = ['$http', 'Constants'];

  function DashboardFactory($http, Constants) {
    var apiKey = null;
    var authenticationToken = null;
    var applicationInterface = null;
    var deviceType = null;
    var device = null;
    var updatesEnabled = true;
    var type = null;
    var instance = null;
    
    var factory = {
      setApiKey: setApiKey,
      getApiKey: getApiKey,
      setAuthenticationToken: setAuthenticationToken,
      getAuthenticationToken: getAuthenticationToken,
      getSelectedApplicationInterface: getSelectedApplicationInterface,
      setSelectedApplicationInterface: setSelectedApplicationInterface,
      getSelectedType: getSelectedType,
      setSelectedType: setSelectedType,
      getSelectedInstance: getSelectedInstance,
      setSelectedInstance: setSelectedInstance,
      getUpdatesEnabled: getUpdatesEnabled,
      setUpdatesEnabled: setUpdatesEnabled
    };
    return factory;

    /**
     * Sets the value of the apiKey attribute.
     */
    function setApiKey(newApiKey) {
      apiKey = newApiKey;
      updateAuthorizationHeader();
    }

    /**
     * Returns the value of the apiKey attribute.
     */
    function getApiKey() {
      return apiKey;
    }

    /**
     * Sets the value of the authenticationToken attribute.
     */
    function setAuthenticationToken(newAuthenticationToken) {
      authenticationToken = newAuthenticationToken;
      updateAuthorizationHeader();
    }

    /**
     * Returns the value of the authenticationToken attribute.
     */
    function getAuthenticationToken() {
      return authenticationToken;
    }

    /**
     * Returns the selected application interface
     */
    function getSelectedApplicationInterface() {
      return applicationInterface;
    }

    /**
     * Sets the selected application interface
     */
    function setSelectedApplicationInterface(newApplicationInterface) {
      applicationInterface = newApplicationInterface;
    }

    /**
     * Returns the selected device or thing type
     */
    function getSelectedType() {
      return type;
    }

    /**
     * Sets the selected device or thing type
     */
    function setSelectedType(newType) {
      type = newType;
    }

    /**
     * Returns the selected device or thing instance
     */
    function getSelectedInstance() {
      return instance;
    }

    /**
     * Sets the selected device or thing instance
     */
    function setSelectedInstance(newInstance) {
      instance = newInstance;
    }

    /**
     * Returns the udpatesEnabled flag
     */
    function getUpdatesEnabled() {
      return updatesEnabled;
    }

    /**
     * Sets the udpatesEnabled flag
     */
    function setUpdatesEnabled(newUpdatesEnabled) {
      updatesEnabled = newUpdatesEnabled;
    }

    function updateAuthorizationHeader() {
      $http.defaults.headers.common[Constants.httpHeaders.authorization] = Constants.misc.basic + btoa(apiKey + ':' + authenticationToken);
    }
  }
})();

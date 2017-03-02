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
    // TODO: REMOVE BEFORE PUSHING TO GIT
    var apiKey = null;
    var authenticationToken = null;
    var applicationInterface = null;
    var deviceType = null;
    var device = null;
    var updatesEnabled = true;

    var factory = {
      setApiKey: setApiKey,
      getApiKey: getApiKey,
      setAuthenticationToken: setAuthenticationToken,
      getAuthenticationToken: getAuthenticationToken,
      getSelectedApplicationInterface: getSelectedApplicationInterface,
      setSelectedApplicationInterface: setSelectedApplicationInterface,
      getSelectedDeviceType: getSelectedDeviceType,
      setSelectedDeviceType: setSelectedDeviceType,
      getSelectedDevice: getSelectedDevice,
      setSelectedDevice: setSelectedDevice,
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
     * Returns the selected device type
     */
    function getSelectedDeviceType() {
      return deviceType;
    }

    /**
     * Sets the selected device type
     */
    function setSelectedDeviceType(newDeviceType) {
      deviceType = newDeviceType;
    }

    /**
     * Returns the selected device
     */
    function getSelectedDevice() {
      return device;
    }

    /**
     * Sets the selected device
     */
    function setSelectedDevice(newDevice) {
      device = newDevice;
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

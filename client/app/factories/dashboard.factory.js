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
    var logicalInterface = null;
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
      getSelectedLogicalInterface: getSelectedLogicalInterface,
      setSelectedLogicalInterface: setSelectedLogicalInterface,
      getSelectedType: getSelectedType,
      setSelectedType: setSelectedType,
      getSelectedInstance: getSelectedInstance,
      setSelectedInstance: setSelectedInstance,
      getUpdatesEnabled: getUpdatesEnabled,
      setUpdatesEnabled: setUpdatesEnabled,
      getMQTTEndpoint: getMQTTEndpoint,
      getMQTTClientId: getMQTTClientId,
      getDeviceStateNotificationTopic: getDeviceStateNotificationTopic,
      getDeviceStateErrorTopic: getDeviceStateErrorTopic,
      getRuleNotificationTopic: getRuleNotificationTopic,
      getRuleErrorTopic: getRuleErrorTopic
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
     * Returns the selected logical interface
     */
    function getSelectedLogicalInterface() {
      return logicalInterface;
    }

    /**
     * Sets the selected logical interface
     */
    function setSelectedLogicalInterface(newLogicalInterface) {
      logicalInterface = newLogicalInterface;
    }

    /**
     * Returns the selected device type
     */
    function getSelectedType() {
      return type;
    }

    /**
     * Sets the selected device type
     */
    function setSelectedType(newType) {
      type = newType;
    }

    /**
     * Returns the selected device instance
     */
    function getSelectedInstance() {
      return instance;
    }

    /**
     * Sets the selected device instance
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

    /**
     * Returns the mqttEndpoint... calculated based on the orgId contained in
     * the API key
     */
    function getMQTTEndpoint() {
      var orgId = apiKey.substr(2, 6);
      return 'wss://' + orgId + '.messaging.internetofthings.ibmcloud.com/mqtt';
    }

    /**
     * Returns the mqtt client id... calculated based on the orgId contained
     * in the API key
     */
    function getMQTTClientId() {
      var orgId = apiKey.substr(2, 6);
      return 'a:' + orgId + ':' + apiKey;
    }

    /**
     * Returns the MQTT topic that device state update notifications are
     * published to... calculated based on the selected logical interface,
     * type and instance.
     */
    function getDeviceStateNotificationTopic() {
      var deviceStateTopic = null;
      if (logicalInterface && type && instance) {
        deviceStateTopic = 'iot-2/type/' + type.id + '/id/' + instance.id + '/intf/' + logicalInterface.id + '/evt/state';
      }
      console.log('deviceStateTopic: ' + deviceStateTopic);
      return deviceStateTopic;
    }

    /**
     * Returns the MQTT topic that device state error notifications are
     * published to... calculated based on the selected logical interface,
     * type and instance.
     */
    function getDeviceStateErrorTopic() {
      var deviceStateErrorTopic = null;
      if (logicalInterface && type && instance) {
        deviceStateErrorTopic = 'iot-2/type/' + type.id + '/id/' + instance.id + '/err/data';
      }
      console.log('deviceStateErrorTopic: ' + deviceStateErrorTopic);
      return deviceStateErrorTopic;
    }

    /**
     * Returns the MQTT topic that rule trigger notifications are published
     * to... calculated based on the selected logical interface.
     */
    function getRuleNotificationTopic() {
      var ruleTriggerNotificationTopic = null;
      if (logicalInterface) {
        ruleTriggerNotificationTopic = 'iot-2/intf/' + logicalInterface.id + '/rule/+/evt/trigger';
      }
      console.log('ruleTriggerNotificationTopic: ' + ruleTriggerNotificationTopic);
      return ruleTriggerNotificationTopic;
    }

    /**
     * Returns the MQTT topic that rule error notifications are published
     * to... calculated based on the selected logical interface.
     */
    function getRuleErrorTopic() {
      var ruleErrorTopic = null;
      if (logicalInterface && type && instance) {
        ruleErrorTopic = 'iot-2/intf/' + logicalInterface.id + '/rule/+/err/data';
      }
      console.log('ruleErrorTopic: ' + ruleErrorTopic);
      return ruleErrorTopic;
    }

    function updateAuthorizationHeader() {
      $http.defaults.headers.common[Constants.httpHeaders.authorization] = Constants.misc.basic + btoa(apiKey + ':' + authenticationToken);
    }
  }
})();

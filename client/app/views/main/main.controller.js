(function() {
  'use strict';

  angular
    .module('demouiApp.main')
    .controller('MainController', MainController);

  MainController.$inject = ['$scope', '$http', '$q', '$interval', '$mdSidenav', 'Constants', 'DashboardFactory', 'Schema', 'DeviceType', 'ThingType', 'Rule', 'ActionToast', 'ErrorNotificationDialog', 'RuleNotificationDialog', 'CredentialsDialog'];

  function MainController($scope, $http, $q, $interval, $mdSidenav, Constants, DashboardFactory, Schema, DeviceType, ThingType, Rule, ActionToast, ErrorNotificationDialog, RuleNotificationDialog, CredentialsDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.chartRefreshInterval = 1000;
    vm.chartController = {};
    // vm.colorScale = d3.scale.category20().range();
    vm.colorScale = d3.schemeCategory20;
    vm.logicalInterface = null;
    vm.logicalInterfaceSchema = null;
    vm.rules = {};
    vm.numericSchemaProperties = [];
    vm.nonNumericSchemaProperties = [];
    vm.type = null;
    vm.instance = null;
    vm.stateData = [];
    vm.intervalPromise = null;
    vm.mqttClient = null;

    /**
     * Activates the view... performs one off initialization.
     */
    activate();
    function activate() {
      /*
       * Set watches on the DashboardFactory function that returns the API Key.
       * This enables us to detect changes to the API Key specified by the user
       * and (re)initialize the Paho client accordingly.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getApiKey();
        },
        function(newValue, oldValue) {
          /*
           * The user has modified the API Key.  We need to clean up the
           * existing MQTT client connection, if any, before attempting to
           * reconnect with the new credentials.
           */
          if (vm.mqttClient && vm.mqttClient.isConnected()) {
            manageMqttSubscriptions(false);
            vm.mqttClient.disconnect();
            vm.mqttClient = null;
          }
          
          if (newValue) {
            // Retrieve the orgId from the new API Key
            vm.mqttClient = new Paho.MQTT.Client(DashboardFactory.getMQTTEndpoint(), DashboardFactory.getMQTTClientId());
            var connectOptions = {
              userName: DashboardFactory.getApiKey(),
              password: DashboardFactory.getAuthenticationToken(),
              useSSL: true,
              onSuccess:function (response) {
                // Set the onMessageArrived function
                vm.mqttClient.onMessageArrived = onMessage;

                vm.mqttClient.onConnectionLost = function(responseObject) {
                  console.log("Connection Lost: "+responseObject.errorMessage);
                };
            
                // Only attempt to subscribe if we have a valid topic
                manageMqttSubscriptions(true);
              },
              onFailure:function (response) {
                onUnauthorizedOrForbiddenResponse();
              }
            };
            vm.mqttClient.connect(connectOptions);
          }
        }
      );

      /*
       * Set a watch on a function that returns the value of calling the
       * getUpdatesEnabled() function on the DashboardFactory.  This enables
       * us to toggle updates in the toolbar and pick up the change here in
       * order to control whether poll for device state.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getUpdatesEnabled();
        },
        function(newValue, oldValue) {
          if (newValue) {
            // Only attempt to subscribe if we have a valid topic
            manageMqttSubscriptions(true);

            vm.intervalPromise = $interval(function() {
              retrieveState();
            }, vm.chartRefreshInterval);
          } else {
            // Only attempt to unsubscribe if we have a valid topic
            manageMqttSubscriptions(false);

            $interval.cancel(vm.intervalPromise);
            vm.intervalPromise = null;
          }
        }
      );

      /*
       * Set a watch on a function that returns the value of calling the
       * getSelectedLogicalInterface() function on the DashboardFactory.
       * This enables us to change the selected logical interface in the nav
       * view and pick up the change here to trigger retrieving the schema for
       * selected logical interface.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedLogicalInterface();
        },
        onLogicalInterfaceSelected
      );
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedType();
        },
        onTypeSelected
      );
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedInstance();
        },
        onInstanceSelected
      );
    } // activate

    /**
     * Called when the user changes the logical interface that is selected.
     * In response, we need to retrieve the schema for the selected logical
     * interface and process the properties that it defines.
     */
    function onLogicalInterfaceSelected() {
      // First, unsubcribe from any previous MQTT topics
      manageMqttSubscriptions(false);

      // Now, reset the relevant view-model variables
      vm.logicalInterface = DashboardFactory.getSelectedLogicalInterface();
      vm.logicalInterfaceSchema = null;
      vm.numericSchemaProperties = [];
      vm.nonNumericSchemaProperties = [];
      vm.type = DashboardFactory.getSelectedType();
      vm.instance = DashboardFactory.getSelectedInstance();
      vm.stateData = [];
      vm.rules = {};
      
      // Reset the chart
      vm.chartController.reset();
      
      // Make sure that a logical interface is selected
      if (vm.logicalInterface) {
        // Retrieve the schema for the selected logical interface
        Schema.getContent(
          { schemaId: vm.logicalInterface.schemaId },
          function(schema) {
            // Store the logical interface
            vm.logicalInterfaceSchema = schema;

            // Normalise the properties into an array
            vm.numericSchemaProperties = [];
            vm.nonNumericSchemaProperties = [];
            Object.keys(schema.properties).forEach(function (key) {
              var property = schema.properties[key];
              property.name = key;
              if (property.type && (property.type === 'number' || property.type === 'integer')) {
                vm.numericSchemaProperties.push(property);
              } else {
                vm.nonNumericSchemaProperties.push(property);
              }
            });
          },
          function(response) {
            /*
             * Check specifically for a 401 Unauthorized or a 403 Forbidden 
             * response here.  This indicates that the credentials entered by
             * the user are incorrect/invalid.  This should not happen since the
             * user has just selected an logical interface, but we should
             * handle it anyway.
             */
            if (  response.status === 401
               || response.status === 403
               ) {
              onUnauthorizedOrForbiddenResponse();
            }
          }
        );

        // Retrieve the rules for the selected logical interface
        Rule.query(
          { 
            logicalIntfId: vm.logicalInterface.id
          },
          function(rules) {
            /*
             * Convert the response into an associative array so that we can
             * easily retrieve rules by their ids later.
             */
            rules.map(function(rule){
              vm.rules[rule.id] = rule;
            });
          },
          function(response) {
            /*
              * Check specifically for a 401 Unauthorized or a 403 Forbidden 
              * response here.  This indicates that the credentials entered by
              * the user are incorrect/invalid.  This should not happen since the
              * user has just selected an logical interface, but we should
              * handle it anyway.
              */
            if (  response.status === 401 || response.status === 403) {
              onUnauthorizedOrForbiddenResponse();
            }
          }
        );
      }
    }

    /**
     * Called when the user changes the type that is selected. In response, we
     * need to remove the current state data and reset the chart. 
     */
    function onTypeSelected() {
      
      // First, unsubcribe from any previous MQTT topics
      manageMqttSubscriptions(false);
      
      // Reset the relevant view-model variables and the chart
      vm.stateData = [];

      // Retrieve the currently selected device type and device
      vm.type = DashboardFactory.getSelectedType();
      vm.instance = DashboardFactory.getSelectedInstance();

      // Now reset the chart
      vm.chartController.reset();
    }

    /**
     * Called when the user changes the instance that is selected. In response,
     * we need to remove the current state data and reset the chart. 
     */
    function onInstanceSelected() {
      
      // First, unsubcribe from any previous MQTT topics
      manageMqttSubscriptions(false);
      
      // Reset the relevant view-model variables and the chart
      vm.stateData = [];

      // Retrieve the currently selected instance
      vm.instance = DashboardFactory.getSelectedInstance();

      // Now reset the chart
      vm.chartController.reset();

      // Only attempt to subscribe if we have a valid topic
      manageMqttSubscriptions(true);
    }

    /**
     * Retrieve the state of the currently selected instance.
     */
    function retrieveState() {
      /*
       * If the user has selected the logical interface, type and instance,
       * retrieve the current state of the selected instance.
       */
      if (  DashboardFactory.getSelectedType()
         && DashboardFactory.getSelectedInstance()
         && DashboardFactory.getSelectedLogicalInterface()
         ) {
        if (DashboardFactory.getSelectedType().type === vm.constants.resourceType.DEVICE_TYPE) {
          // The instance selected is a device... retrieve its state
          retrieveDeviceState();
        } else if (DashboardFactory.getSelectedType().type === vm.constants.resourceType.THING_TYPE) {
          retrieveThingState();
        }
      }
    } // retrieveState

    /*
     * The onMessage function is called when an MQTT state update notification
     * is published.
     */
    function onMessage(message) {
      
      // Retrieve the message destination name and payload
      var destinationName = message.destinationName;
      var payload = angular.fromJson(message.payloadString);

      console.log('Destination Name: ' + destinationName);
      console.log('Payload: ', payload);

      /*
       * Determine the type of the notification and take the appropriate
       * action. 
       * 
       * Because this code is being driven by the arrival of messages
       * over MQTT, Angular is not aware of them.  We need to drive the
       * actions inside the $scope.$apply function to ensure that the
       * Angular digest loop is driven.
       */
      $scope.$apply(function() {
        // Determine the type of the notification
        if (destinationName.endsWith(Constants.mqttDestinationNameSuffix.StateNotification)) {
          onStateUpdateNotification(payload);
        } else if (destinationName.endsWith(Constants.mqttDestinationNameSuffix.RuleNotification)) {
          var ruleId = destinationName.match(Constants.ruleIdRegex)[1];
          onRuleTriggerNotification(ruleId, payload);
        } else if (destinationName.endsWith(Constants.mqttDestinationNameSuffix.ErrorNotification)) {
          // Retrieve the various pieces of metadta for the error notification
          var type = null;
          var typeId = null;
          var instanceId = null;
          var eventId = null;
          var rule = null;
          if (payload.ruleId) {
            // This is rule evaluation error
            type = payload.type;
            typeId = payload.typeId;
            instanceId = payload.instanceId;
            rule = vm.rules[payload.ruleId];
          } else {
            // This is a more general runtime error
            var type = Constants.misc.device;
            var typeId = destinationName.match(Constants.errorTopicRegex)[1];
            var instanceId = destinationName.match(Constants.errorTopicRegex)[2];
            var eventId = payload.eventId;
          }
          onErrorNotification(type, typeId, instanceId, eventId, rule, payload);
        }
      });

    } // onMessage

    function onStateUpdateNotification(payload) {
      // Convert the ISO8601 date properties to millis 
      payload.updated = new Date(payload.updated).getTime();
      payload.timestamp = new Date(payload.timestamp).getTime();
      
      // Push the new payload object onto the stateData array.
      vm.stateData.push(payload);

      /*
       * We only display one minutes worth of data points.  Strip off the first
       * element of the array if it is over a certain size.
       */
      // if (vm.stateData.length > 65) {
      //   vm.stateData.shift();
      // }
    }

    /**
     * Retrieve the state of the currently selected device.
     */
    function retrieveDeviceState() {
      DeviceType.getDeviceState(
        {
          typeId: DashboardFactory.getSelectedType().id,
          deviceId: DashboardFactory.getSelectedInstance().id,
          logicalIntfId: DashboardFactory.getSelectedLogicalInterface().id
        },
        function(response) {

          /*
           * Normalise the response until the latest drivers have been
           * deployed into production.
           */
          // Convert the ISO8601 date properties to millis 
          // var data = {};
          response.updated = new Date(response.updated).getTime();
          response.timestamp = new Date(response.timestamp).getTime();
          // var now = Date.now();
          // if (!response.updated && !response.state) {
          //   /*
          //    * The data returned is in the old format... inject our own
          //    * updated timestamp and store the state in a state property.
          //    */
          //   data.updated = now;
          //   data.state = response; 
          // } else {
          //   var updatedMillis = new Date(response.updated).getTime();
          //   response.updated = updatedMillis;
          //   data = response;
          // }
          // data.timestamp = now;
          // vm.stateData.push(data);
          vm.stateData.push(response);

         /*
          * We only display one minutes worth of data points.  Strip off the first
          * element of the array if it is over a certain size.
          */
          // if (vm.stateData.length > 65) {
          //   vm.stateData.shift();
          // }
    
        },
        function(response) {
          if (  response.status === 401
             || response.status === 403
              ) {
             onUnauthorizedOrForbiddenResponse();
           } else if (response.status === 404) {
             onNoStateFoundResponse();
           }
        }
      );
    } // retrieveDeviceState

    /**
     * Retrieve the state of the currently selected thing.
     */
    function retrieveThingState() {
      ThingType.getThingState(
        {
          typeId: DashboardFactory.getSelectedType().id,
          thingId: DashboardFactory.getSelectedInstance().id,
          logicalIntfId: DashboardFactory.getSelectedLogicalInterface().id
        },
        function(response) {

          // Convert the ISO8601 date properties to millis 
          response.updated = new Date(response.updated).getTime();
          response.timestamp = new Date(response.timestamp).getTime();
          vm.stateData.push(response);

          /*
           * We only display one minutes worth of data points.  Strip off the first
           * element of the array if it is over a certain size.
           */
          // if (vm.stateData.length > 65) {
          //   vm.stateData.shift();
          // }
        },
        function(response) {
          if (  response.status === 401
             || response.status === 403
             ) {
             onUnauthorizedOrForbiddenResponse();
           } else if (response.status === 404) {
             onNoStateFoundResponse();
           }
        }
      );
    } // retrieveThingState

    /*
     * The manageMqttSubscriptions function is used to manage MQTT
     * subscriptions in a single place
     */
    function manageMqttSubscriptions(subscribe) {
      /*
       * Only attempt to subscribe/unsubscribe if we are connected and have 
       * valid MQTT topic names
       */ 
      if (  vm.mqttClient && vm.mqttClient.isConnected()
         && getDeviceStateNotificationTopic()
         && getDeviceStateErrorTopic()
         && getThingStateNotificationTopic()
         && getThingStateErrorTopic()
         && getRuleNotificationTopic()
         && getRuleErrorTopic()
         ) {
        // Determine whether we are subscribing or unsubscribing
        var func = vm.mqttClient.subscribe;
        if (!subscribe) {
          func = vm.mqttClient.unsubscribe;
        }
        // func(getDeviceStateNotificationTopic());
        func(getDeviceStateErrorTopic());
        // func(getThingStateNotificationTopic());
        func(getThingStateErrorTopic());
        func(getRuleNotificationTopic());
        func(getRuleErrorTopic());
      }
    }

    /**
     * Called when an MQTT rule trigger notification event is received. 
     */
    function onRuleTriggerNotification(ruleId, payload) {

      // Make sure that subject of the rule matches the select device/thing
      if (vm.type && vm.instance) {
        if (  vm.type.id == payload.typeId
           && vm.instance.id === payload.instanceId
          ) {
            // Retrieve the metadta for the rule that has been triggered
            var rule = vm.rules[ruleId];

            ActionToast.show({
              message: 'The \'' + rule.name +'\' rule has been triggered',
              actionMessage: 'Show Details',
              actionCallback: function(event) {
                RuleNotificationDialog.show(event, rule, payload);
              },
              hideDelay: Constants.misc.defaultToastHideDelay
            });
        } else {
          console.log('Rule trigger event is not for selected device/thing - ignoring');
        }
      }
    } // onRuleTriggerNotification 

    /**
     * Called when an MQTT error notification event is received. 
     */
    function onErrorNotification(type, typeId, instanceId, eventId, rule, payload) {
      ActionToast.show({
        message: 'A runtime error has occurred when processing an event',
        actionMessage: 'Show Details',
        actionCallback: function(event) {
          ErrorNotificationDialog.show(event, type, typeId, instanceId, eventId, rule, payload);
        },
        hideDelay: Constants.misc.defaultToastHideDelay
      });
    } // onRuleTriggerNotification 

    /**
     * Called when a "403 Forbidden" is returned from a call to a Watson IoT
     * REST API. 
     */
    function onUnauthorizedOrForbiddenResponse() {
      ActionToast.show({
        message: 'The credentials that you entered are invalid.  Please enter a valid API Key and Authentication Token in the Credentials Dialog.',
        actionMessage: 'Edit Credentials',
        actionCallback: function(event) {
          CredentialsDialog.show(event);
        }
      });
    } // onUnauthorizedOrForbiddenResponse 

    /**
     * Called when a "404 Not Found" is returned from a call to retrieve the
     * state of the selected Device.  Given the checks that we have in place
     * this should never happen, but we should handle it just in case.
     */
    function onNoStateFoundResponse() {
      ActionToast.show({
        message: 'The selected device has no state Please select another Device whose state you want to view.',
        actionMessage: 'Show Device Selector',
        actionCallback: function(event) {
          $mdSidenav('left').toggle();
        }
      });
    } // onNoStateFoundResponse

    /**
     * Returns the MQTT topic that device state update notifications are
     * published to... calculated based on the selected logical interface,
     * type and instance.
     */
    function getDeviceStateNotificationTopic() {
      var deviceStateTopic = null;
      if (vm.logicalInterface && vm.type && vm.instance) {
        deviceStateTopic = 'iot-2/type/' + vm.type.id + '/id/' + vm.instance.id + '/intf/' + vm.logicalInterface.id + '/evt/state';
      }
      return deviceStateTopic;
    }

    /**
     * Returns the MQTT topic that device state error notifications are
     * published to... calculated based on the selected logical interface,
     * type and instance.
     */
    function getDeviceStateErrorTopic() {
      var deviceStateErrorTopic = null;
      if (vm.logicalInterface && vm.type && vm.instance) {
        deviceStateErrorTopic = 'iot-2/type/' + vm.type.id + '/id/' + vm.instance.id + '/err/data';
      }
      return deviceStateErrorTopic;
    }

    /**
     * Returns the MQTT topic that thing state update notifications are
     * published to... calculated based on the selected logical interface,
     * type and instance.
     */
    function getThingStateNotificationTopic() {
      var thingStateTopic = null;
      if (vm.logicalInterface && vm.type && vm.instance) {
        thingStateTopic = 'iot-2/thing/type/' + vm.type.id + '/id/' + vm.instance.id + '/intf/' + vm.logicalInterface.id + '/evt/state';
      }
      return thingStateTopic;
    }

    /**
     * Returns the MQTT topic that thing state error notifications are
     * published to... calculated based on the selected logical interface,
     * type and instance.
     */
    function getThingStateErrorTopic() {
      var thingStateErrorTopic = null;
      if (vm.logicalInterface && vm.type && vm.instance) {
        thingStateErrorTopic = 'iot-2/thing/type/' + vm.type.id + '/id/' + vm.instance.id + '/err/data';
      }
      return thingStateErrorTopic;
    }

    /**
     * Returns the MQTT topic that rule trigger notifications are published
     * to... calculated based on the selected logical interface.
     */
    function getRuleNotificationTopic() {
      var ruleTriggerNotificationTopic = null;
      if (vm.logicalInterface) {
        ruleTriggerNotificationTopic = 'iot-2/intf/' + vm.logicalInterface.id + '/rule/+/evt/trigger';
      }
      return ruleTriggerNotificationTopic;
    }

    /**
     * Returns the MQTT topic that rule error notifications are published
     * to... calculated based on the selected logical interface.
     */
    function getRuleErrorTopic() {
      var ruleErrorTopic = null;
      if (vm.logicalInterface) {
        ruleErrorTopic = 'iot-2/intf/' + vm.logicalInterface.id + '/rule/+/err/data';
      }
      return ruleErrorTopic;
    }
  }
})();

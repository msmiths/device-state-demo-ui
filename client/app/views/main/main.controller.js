(function() {
  'use strict';

  angular
    .module('demouiApp.main')
    .controller('MainController', MainController);

  MainController.$inject = ['$scope', '$http', '$q', '$interval', '$mdSidenav', 'Constants', 'DashboardFactory', 'Schema', 'DeviceType', 'ThingType', 'ActionToast', 'CredentialsDialog'];

  function MainController($scope, $http, $q, $interval, $mdSidenav, Constants, DashboardFactory, Schema, DeviceType, ThingType, ActionToast, CredentialsDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
	  vm.chartRefreshInterval = 1000;
	  vm.chartController = {};
    vm.colorScale = d3.scale.category20().range();
    vm.applicationInterface = null;
    vm.applicationInterfaceSchema = null;
    vm.numericSchemaProperties = [];
    vm.nonNumericSchemaProperties = [];
    vm.type = null;
    vm.instance = null;
	  vm.stateData = [];
	  vm.intervalPromise = null;

    /**
     * Activates the view... performs one off initialization.
     */
    activate();
    function activate() {
      /*
       * Set a watch on a function that returns the value of calling the
       * getUpdatesEnabled() function on the DashboardFactory.  This enables
       * us to toggle updates in the toolbar and pick up the change here in
       * order to control whether poll for device/thing state.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getUpdatesEnabled();
        },
        function(newValue, oldValue) {
          if (newValue) {
            vm.intervalPromise = $interval(function() {
              retrieveState();
            }, vm.chartRefreshInterval);
          } else {
            $interval.cancel(vm.intervalPromise);
            vm.intervalPromise = null;
          }
        }
      );

      /*
       * Set a watch on a function that returns the value of calling the
       * getSelectedApplicationInterface() function on the DashboardFactory.
       * This enables us to change the selected application interface in the nav
       * view and pick up the change here to trigger retrieving the schema for
       * selected application interface.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedApplicationInterface();
        },
        onApplicationInterfaceSelected
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
     * Called when the user changes the application interface that is selected.
     * In response, we need to retrieve the schema for the selected application
     * interface and process the properties that it defines.
     */
    function onApplicationInterfaceSelected() {
      // First, reset the relevant view-model variables
      vm.applicationInterface = null;
      vm.applicationInterfaceSchema = null;
      vm.numericSchemaProperties = [];
      vm.nonNumericSchemaProperties = [];
      vm.type = null;
      vm.instance = null;
      vm.stateData = [];
      
      // Now reset the chart
      vm.chartController.reset();
      
      // Retrieve the selected application interface
      vm.applicationInterface = DashboardFactory.getSelectedApplicationInterface();
      if (vm.applicationInterface) {
        // Retrieve the schema for the selected application interface
        Schema.getContent(
          { schemaId: vm.applicationInterface.schemaId },
          function(schema) {
            // Store the application interface
            vm.applicationInterfaceSchema = schema;

            // Normalise the properties into an array
            vm.numericSchemaProperties
            vm.nonNumericSchemaProperties = [];
            Object.keys(schema.properties).forEach(function (key) {
              var property = schema.properties[key];
              property.name = key;
              if (property.type && property.type === 'number') {
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
             * user has just selected an application interface, but we should
             * handle it anyway.
             */
            if (  response.status === 401
               || response.status === 403
               ) {
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
      
      // Reset the relevant view-model variables and the chart
      vm.stateData = [];

      // Retrieve the currently selected instance
      vm.instance = DashboardFactory.getSelectedInstance();

      // Now reset the chart
      vm.chartController.reset();
    }

    /**
     * Retrieve the state of the currently selected instance.
     */
    function retrieveState() {
      /*
       * If the user has selected the application interface, type and instance,
       * retrieve the current state of the selected instance.
       */
      if (  DashboardFactory.getSelectedType()
         && DashboardFactory.getSelectedInstance()
         && DashboardFactory.getSelectedApplicationInterface()
         ) {
        if (DashboardFactory.getSelectedType().type === vm.constants.resourceType.DEVICE_TYPE) {
          // The instance selected is a device... retrieve its state
          retrieveDeviceState();
        } else {
          // The instance selected is a thing... retrieve its state
          retrieveThingState();
        }
      }
    } // retrieveState

    /**
     * Retrieve the state of the currently selected device.
     */
    function retrieveDeviceState() {
      DeviceType.getDeviceState(
        {
          typeId: DashboardFactory.getSelectedType().id,
          deviceId: DashboardFactory.getSelectedInstance().id,
          appIntfId: DashboardFactory.getSelectedApplicationInterface().id
        },
        function(response) {
          /*
           * Normalise the response until the latest drivers have been
           * deployed into production.
           */
          var data = {};
          var now = Date.now();
          if (!response.updated && !response.state) {
            /*
             * The data returned is in the old format... inject our own
             * updated timestamp and store the state in a state property.
             */
            data.updated = now;
            data.state = response; 
          } else {
            var updatedMillis = new Date(response.updated).getTime();
            response.updated = updatedMillis;
            data = response;
          }
          data.timestamp = now;
          vm.stateData.push(data);
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
          appIntfId: DashboardFactory.getSelectedApplicationInterface().id
        },
        function(response) {
          /*
           * Normalise the response until the latest drivers have been
           * deployed into production.
           */
          var data = {};
          var now = Date.now();
          if (!response.updated && !response.state) {
            /*
             * The data returned is in the old format... inject our own
             * updated timestamp and store the state in a state property.
             */
            data.updated = now;
            data.state = response; 
          } else {
            var updatedMillis = new Date(response.updated).getTime();
            response.updated = updatedMillis;
            data = response;
            
          }
          data.timestamp = now;
          vm.stateData.push(data);
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
     * state of the selected Device or Thing.  Given the checks that we have in
     * place this should never happen, but we should handle it just in case.
     */
    function onNoStateFoundResponse() {
      ActionToast.show({
        message: 'The selected device has no state Please select another Device or Thing whose state you want to view.',
        actionMessage: 'Show Device/Thing Selector',
        actionCallback: function(event) {
          $mdSidenav('left').toggle();
        }
      });
    } // onNoStateFoundResponse
  }
})();

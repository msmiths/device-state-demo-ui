(function() {
  'use strict';

  angular
    .module('demouiApp.main')
    .controller('MainController', MainController);

  MainController.$inject = ['$scope', '$http', '$q', '$interval', '$mdSidenav', 'DashboardFactory', 'Schema', 'DeviceType', 'ActionToast', 'CredentialsDialog'];

  function MainController($scope, $http, $q, $interval, $mdSidenav, DashboardFactory, Schema, DeviceType, ActionToast, CredentialsDialog) {
    /*jshint validthis: true */
    var vm = this;

	  vm.chartRefreshInterval = 5000;
	  vm.chartController = {};
    vm.colorScale = d3.scale.category10().range();
    vm.applicationInterfaceSchema = null;
	  vm.schemaProperties = [];
	  vm.deviceStateData = [];
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
              retrieveDeviceState();
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
          return DashboardFactory.getSelectedDeviceType();
        },
        onDeviceTypeSelected
      );
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedDevice();
        },
        onDeviceSelected
      );
    } // activate

    /**
     * Called when the user changes the application interface that is selected.
     * In response, we need to retrieve the schema for the selected application
     * interface and process the properties that it defines.
     */
    function onApplicationInterfaceSelected() {
      // First, reset the relevant view-model variables
      vm.applicationInterfaceSchema = null;
      vm.schemaProperties = [];
      vm.deviceStateData = [];
      
      // Now reset the chart
      vm.chartController.reset();
      
      // Retrieve the selected application interface
      var applicationInterface = DashboardFactory.getSelectedApplicationInterface();
      if (applicationInterface) {
        // Retrieve the schema for the selected application interface
        Schema.getContent(
          { schemaId: applicationInterface.schemaId },
          function(schema) {
            // Store the application interface
            vm.applicationInterfaceSchema = schema;

            // Normalise the properties into an array
            vm.schemaProperties = [];
            Object.keys(schema.properties).forEach(function (key) {
              var property = schema.properties[key];
              if (property.type && property.type == 'number') {
                property.name = key;
                vm.schemaProperties.push(property);
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
     * Called when the user changes the device type that is selected.
     * In response, we need to remove the current state data and reset the
     * chart. 
     */
    function onDeviceTypeSelected() {
      
      // Reset the relevant view-model variables and the chart
      vm.deviceStateData = [];
      
      // Now reset the chart
      vm.chartController.reset();
    }

    /**
     * Called when the user changes the device that is selected.
     * In response, we need to remove the current state data and reset the
     * chart. 
     */
    function onDeviceSelected() {
      
      // Reset the relevant view-model variables and the chart
      vm.deviceStateData = [];
      
      // Now reset the chart
      vm.chartController.reset();
    }

    /**
     * Retrieve the state of the currently selected device.
     */
    function retrieveDeviceState() {
      /*
       * If the user has selected the application interface, device type and
       * device, retrieve the current state of the selected device.
       */
      if (  DashboardFactory.getSelectedDeviceType()
         && DashboardFactory.getSelectedDevice()
         && DashboardFactory.getSelectedApplicationInterface()
         ) {
        DeviceType.getDeviceState(
          {
            typeId: DashboardFactory.getSelectedDeviceType().id,
            deviceId: DashboardFactory.getSelectedDevice().deviceId,
            appIntfId: DashboardFactory.getSelectedApplicationInterface().id
          },
          function(response) {
            // Inject our own timestamp into the response
            response.timestamp = Date.now();
            vm.deviceStateData.push(response);
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
      }
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

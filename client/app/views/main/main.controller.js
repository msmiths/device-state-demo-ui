(function() {
  'use strict';

  angular
    .module('demouiApp.main')
    .controller('MainController', MainController);

  MainController.$inject = ['$scope', '$http', '$q', '$interval', 'DashboardFactory', 'Schema', 'DeviceType'];

  function MainController($scope, $http, $q, $interval, DashboardFactory, Schema, DeviceType) {
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
       * This enables to change the selected application interface in the nav
       * view and pick up the change here to trigger retrieving the schema for
       * selected application interface.
       */
      $scope.$watch(
        function() {
          return DashboardFactory.getSelectedApplicationInterface();
        },
        function(newValue, oldValue) {
          if (newValue && newValue !== 'None') {
            // Clear the current application interface and properties
            vm.applicationInterfaceSchema = null;
            vm.schemaProperties = [];

            // Retrieve the schema for the selected application interface
            Schema.getContent(
              { schemaId: newValue.schemaId },
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
                debugger;
              }
            );
          } else {
            vm.applicationInterfaceSchema = null;
            vm.schemaProperties = [];
          }
        }
      );
    } // activate

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
            debugger;
          }
        );
      }
    } // retrieveDeviceState
  }
})();

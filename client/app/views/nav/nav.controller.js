(function() {
  'use strict';

  angular
    .module('demouiApp.nav')
    .controller('NavController', NavController);

  NavController.$inject = ['$scope', '$q', 'DashboardFactory', 'ApplicationInterface', 'DeviceType'];

  function NavController($scope, $q, DashboardFactory, ApplicationInterface, DeviceType) {
    /*jshint validthis: true */
    var vm = this;

    vm.isOpen = false;
    vm.applicationInterfaces = [];
    vm.deviceTypes = [];
    vm.devices = [];
    vm.applicationInterface = null;
    vm.deviceType = null;
    vm.device = null;

    /**
     * Activates the view... performs one off initialization.
     */
    activate();
    function activate() {
      /*
       * Watch the isOpen attribute so that we can trigger the retrieval of the
       * latest set of application interfaces whenever the nav panel is open.
       */
      $scope.$watch('vm.isOpen', function() {
        if (vm.isOpen) {
          retrieveApplicationInterfaces();
        }
      });

      /*
       * Watch the applicationInterface, deviceType and device attributes
       * because md-select does not appear to support the ng-change attribute
       * properly:
       *
       *   https://github.com/angular/material/issues/1576
       */
      $scope.$watch('vm.applicationInterface', function() {
        if (vm.applicationInterface) {
          if (vm.applicationInterface !== 'None') {
            onApplicationInterfaceSelected();
          } else {
            vm.deviceTypes = [];
            vm.devices = [];
            vm.deviceType = null;
            vm.device = null;
          }
        }
      });
      $scope.$watch('vm.deviceType', function() {
        if (vm.deviceType) {
          if (vm.deviceType !== 'None') {
            onDeviceTypeSelected();
          } else {
            vm.devices = [];
            vm.device = null;
          }
        }
      });
      $scope.$watch('vm.device', function() {
        if (vm.device) {
          if (vm.device !== 'None') {
            onDeviceSelected();
          } else {
            vm.device = null;
          }
        }
      });
    }

    /**
     * Retrieves the list of application interfaces and stores the results
     * locally in the applicationInterfaces attribute.  This attribute is used
     * to populate the select control in the nav panel.
     */
    function retrieveApplicationInterfaces() {
      ApplicationInterface.query(
        function(response) {
          // Store the list of application interfaces
          vm.applicationInterfaces = response.results;
        },
        function(response) {
          /*
           * Check specifically for a 401 response here.  This indicates that
           * the credentials entered by the user are incorrect/invalid.
           */
          debugger;
        }
      );
    }

    /**
     * Called when the user changes the application interface that is selected.
     * In response, we need to retrieve the devices/things that expose the
     * selected application interface.
     */
    function onApplicationInterfaceSelected() {
      // First, store the selected application interface in the DashboardFactory
      DashboardFactory.setSelectedApplicationInterface(vm.applicationInterface);

      /*
       * We need to retrieve all of the Device Types that have deployed
       * configuration and then, for each Device Type returned, retrieve the
       * Application Interfaces associated with the Device Type.  We then
       * need to check if the id of any of these Application Interfaces
       * matches the id of the selected Application Interface.
       *
       * Most of this code goes away once we have an applicationInterfaceId
       * filter on the Device Types REST API.
       */
      DeviceType.query(
       {excludeNotDeployed: true},
       function(response) {

            /*
             * Now retrieve the application interfaces associated with each of
             * returned Device Types.  Make all of these calls in parallel.
             */
            var promises = response.results.map(function(deviceType){
              return DeviceType.getApplicationInterfaces({ typeId: deviceType.id }).$promise;
            });

            // Wait until all of the requests have completed
            $q.all(promises).then(
              function(responses) {
                /*
                 * For each response, iterate over the array of Application
                 * Interfaces returned and check if it matches the selected
                 * Application Interface.
                 */
                angular.forEach(responses, function(deviceTypeAppIntfs, index) {
                  for (var i = 0; i < deviceTypeAppIntfs.length; i++) {
                    if (deviceTypeAppIntfs[i].id === vm.applicationInterface.id) {
                      vm.deviceTypes.push(response.results[index]);
                      break;
                    }
                  }
                });
              },
              function() {
              }
            );
          },
          function(response) {
            /*
             * Check specifically for a 401 response here.  This indicates that
             * the credentials entered by the user are incorrect/invalid.
             */
            debugger;
          }
        );
    }

    /**
     * Called when the user changes the device type that is selected. In
     * response, we need to retrieve all of the registered devices for the
     * selected Device Type.
     */
    function onDeviceTypeSelected() {
      // First, store the selected device type in the DashboardFactory
      DashboardFactory.setSelectedDeviceType(vm.deviceType);

      DeviceType.getDevices(
        { typeId: vm.deviceType.id },
        function(response) {
          // Store the list of devices
          vm.devices = response.results;
        },
        function(response) {
          /*
           * Check specifically for a 401 response here.  This indicates that
           * the credentials entered by the user are incorrect/invalid.
           */
          debugger;
        }
      );
    }

    /**
     * Called when the user changes the device that is selected.
     */
    function onDeviceSelected() {
      // Store the selected device in the DashboardFactory
      DashboardFactory.setSelectedDevice(vm.device);
    }

  }
})();

(function() {
  'use strict';

  angular
    .module('demouiApp.nav')
    .controller('NavController', NavController);

  NavController.$inject = ['$scope', '$q', 'DashboardFactory', 'ApplicationInterface', 'DeviceType', 'ActionToast', 'CredentialsDialog'];

  function NavController($scope, $q, DashboardFactory, ApplicationInterface, DeviceType, ActionToast, CredentialsDialog) {
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
          onApplicationInterfaceSelected();
        }
      });
      $scope.$watch('vm.deviceType', function() {
        if (vm.deviceType) {
            onDeviceTypeSelected();
        }
      });
      $scope.$watch('vm.device', function() {
        if (vm.device) {
          onDeviceSelected();
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
           * Check specifically for a 401 Unauthorized or a 403 Forbidden 
           * response here.  This indicates that the credentials entered by
           * the user are incorrect/invalid.
           */
          if (  response.status === 401
             || response.status === 403
             ) {
            onUnauthorizedOrForbiddenResponse();
          }
        }
      );
    }

    /**
     * Called when the user changes the application interface that is selected.
     * In response, we need to retrieve the devices/things that expose the
     * selected application interface.
     */
    function onApplicationInterfaceSelected() {
      // Reset the relevant view-model variables
      vm.deviceTypes = [];
      vm.devices = [];
      vm.deviceType = null;
      vm.device = null;

      /*
       * Now store the selected application interface, device type and device in
       * the DashboardFactory.
       */
      DashboardFactory.setSelectedApplicationInterface(vm.applicationInterface !== 'None' ? vm.applicationInterface : null);
      DashboardFactory.setSelectedDeviceType(vm.deviceType);
      DashboardFactory.setSelectedDevice(vm.device);

      /*
       * If a valid application interface was selected, we need to retrieve all
       * of the Device Types that have deployed configuration and then, for each
       * Device Type returned, retrieve the Application Interfaces associated
       * with the Device Type.  We then need to check if the id of any of these
       * Application Interfaces matches the id of the selected Application
       * Interface.
       *
       * Most of this code goes away once we have an applicationInterfaceId
       * filter on the Device Types REST API.
       */
      if (vm.applicationInterface !== 'None') {
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
             * Check specifically for a 401 Unauthorized or a 403 Forbidden 
             * response here.  This indicates that the credentials entered by
             * the user are incorrect/invalid.
             */
            if (  response.status === 401
               || response.status === 403
               ) {
              onUnauthorizedOrForbiddenResponse();
            }
          }
        );
      } // IF - vm.applicationInterface !== 'None'
    } // onApplicationInterfaceSelected

    /**
     * Called when the user changes the device type that is selected. In
     * response, we need to retrieve all of the registered devices for the
     * selected Device Type.
     */
    function onDeviceTypeSelected() {
      // First, store the selected device type in the DashboardFactory

      // Reset the relevant view-model variables
      vm.devices = [];
      vm.device = null;

      // Now store the selected device type and device in the DashboardFactory.
      DashboardFactory.setSelectedDeviceType(vm.deviceType !== 'None' ? vm.deviceType : null);
      DashboardFactory.setSelectedDevice(vm.device);

      /*
       * If a valid device type was selected, we need to retrieve all of the
       * devices of that type.
       */
      if (vm.deviceType !== 'None') {
        DeviceType.getDevices(
          { typeId: vm.deviceType.id },
          function(response) {
            // Store the list of devices
            vm.devices = response.results;
          },
          function(response) {
            /*
             * Check specifically for a 401 Unauthorized or a 403 Forbidden 
             * response here.  This indicates that the credentials entered by
             * the user are incorrect/invalid.
             */
            if (  response.status === 401
               || response.status === 403
               ) {
              onUnauthorizedOrForbiddenResponse();
            }
          }
        );
      } // IF - vm.deviceType !== 'None'
    } // onDeviceTypeSelected

    /**
     * Called when the user changes the device that is selected.
     */
    function onDeviceSelected() {
      // Store the selected device in the DashboardFactory
      DashboardFactory.setSelectedDevice(vm.device !== 'None' ? vm.device : null);
    } // onDeviceSelected
    
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
  }
})();

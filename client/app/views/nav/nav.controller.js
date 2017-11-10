(function() {
  'use strict';

  angular
    .module('demouiApp.nav')
    .controller('NavController', NavController);

  NavController.$inject = ['$scope', '$q', 'Constants', 'DashboardFactory', 'LogicalInterface', 'DraftDeviceType', 'DeviceType', 'ActionToast', 'CredentialsDialog'];

  function NavController($scope, $q, Constants, DashboardFactory, LogicalInterface, DraftDeviceType, DeviceType, ActionToast, CredentialsDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.isOpen = false;
    vm.logicalInterfaces = [];
    vm.logicalInterface = null;
    vm.types = [];
    vm.instances = [];
    vm.type = null;
    vm.instance = null;
    

    /**
     * Activates the view... performs one off initialization.
     */
    activate();
    function activate() {
      /*
       * Watch the isOpen attribute so that we can trigger the retrieval of the
       * latest set of logical interfaces whenever the nav panel is open.
       */
      $scope.$watch('vm.isOpen', function() {
        if (vm.isOpen) {
          retrieveLogicalInterfaces();
        }
      });

      /*
       * Watch the logicalInterface, deviceType and device attributes
       * because md-select does not appear to support the ng-change attribute
       * properly:
       *
       *   https://github.com/angular/material/issues/1576
       */
      $scope.$watch('vm.logicalInterface', function() {
        if (vm.logicalInterface) {
          onLogicalInterfaceSelected();
        }
      });
      $scope.$watch('vm.type', function() {
        if (vm.type) {
            onTypeSelected();
        }
      });
      $scope.$watch('vm.instance', function() {
        if (vm.instance) {
          onInstanceSelected();
        }
      });
    }

    /**
     * Retrieves the list of logical interfaces and stores the results
     * locally in the logicalInterfaces attribute.  This attribute is used
     * to populate the select control in the nav panel.
     */
    function retrieveLogicalInterfaces() {
      LogicalInterface.query(
        function(response) {
          // Store the list of logical interfaces
          vm.logicalInterfaces = response.results;
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
     * Called when the user changes the logical interface that is selected. In
     * response, we need to retrieve the devices that expose the selected
     * logical interface.
     */
    function onLogicalInterfaceSelected() {
      // Reset the relevant view-model variables
      vm.types = [];
      vm.instances = [];
      vm.type = null;
      vm.instance = null;

      /*
       * Now store the selected logical interface, device type and device in
       * the DashboardFactory.
       */
      DashboardFactory.setSelectedLogicalInterface(vm.logicalInterface !== 'None' ? vm.logicalInterface : null);
      DashboardFactory.setSelectedType(vm.type);
      DashboardFactory.setSelectedInstance(vm.instance);

      /*
       * If a valid active logical interface was selected, we need to retrieve
       * all of the active Device Types are associated with the logical
       * interface. Unfortunately, it is not yet possible to filter the device
       * types collection with a specific logicalInterfaceId... this will
       * come after GA.
       * 
       * For now, we need to retrieve all of the draft Device Types that are
       * associated with the specified logical interface and then attempt to
       * retrieve the logical interfaces for those device types to ensure that
       * the associated logical interface has been activated. 
       */
      if (vm.logicalInterface !== 'None') {
        /*
         * Retrieve all of the Device Types that are associated with the
         * selected logical interface
         */ 
        DraftDeviceType.query(
          {logicalInterfaceId: vm.logicalInterface.id},
          function(response) {
            /*
             * Now retrieve the logical interfaces associated with each of
             * returned Device Types.  Make all of these calls in parallel.
             */
            var devicePromises = response.results.map(function(deviceType){
              return DeviceType.getLogicalInterfaces({ typeId: deviceType.id }).$promise;
            });

            // Wait until all of the requests have completed
            $q.all(devicePromises).then(
              function(responses) {
                /*
                 * For each response, iterate over the array of active Logical
                 * Interfaces returned and check if it matches the selected
                 * Logical Interface.
                 */
                angular.forEach(responses, function(deviceTypeLogicalIntfs, index) {
                  for (var i = 0; i < deviceTypeLogicalIntfs.length; i++) {
                    if (deviceTypeLogicalIntfs[i].id === vm.logicalInterface.id) {
                      response.results[index].type = Constants.resourceType.DEVICE_TYPE;
                      vm.types.push(response.results[index]);
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
      } // IF - vm.logicalInterface !== 'None'
    } // onLogicalInterfaceSelected

    /**
     * Called when the user changes the type that is selected. In response, we
     * need to retrieve all of the Device instances for the selected type.
     */
    function onTypeSelected() {
      // First, store the selected type in the DashboardFactory

      // Reset the relevant view-model variables
      vm.instances = [];
      vm.instance = null;

      // Now store the selected device type and device in the DashboardFactory.
      DashboardFactory.setSelectedType(vm.type !== 'None' ? vm.type : null);
      DashboardFactory.setSelectedInstance(vm.instance);

      /*
       * If a valid type was selected, we need to retrieve all of the Devices
       * of that type.
       */
      if (vm.type !== 'None') {
        if (vm.type.type === Constants.resourceType.DEVICE_TYPE) {
          /*
           * The selected type is a Device Type. Retrieve all of the instances
           * of the Device Type.
           */
          DeviceType.getDevices(
              { typeId: vm.type.id },
              function(response) {
                // Normalize the ids
                var instances = response.results;
                angular.forEach(instances, function(instance) {
                  instance.id = instance.deviceId;
                });

                // Store the list of instances
                vm.instances = instances;
              },
              function(response) {
                /*
                 * Check specifically for a 401 Unauthorized or a 403 Forbidden 
                 * response here.  This indicates that the credentials entered
                 * by the user are incorrect/invalid.
                 */
                if (  response.status === 401
                   || response.status === 403
                   ) {
                  onUnauthorizedOrForbiddenResponse();
                }
              }
            );
        }
      } // IF - vm.type !== 'None'
    } // onTypeSelected

    /**
     * Called when the user changes the instance that is selected.
     */
    function onInstanceSelected() {
      // Store the selected instance in the DashboardFactory
      DashboardFactory.setSelectedInstance(vm.instance);

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

(function() {
  'use strict';

  angular
    .module('demouiApp.nav')
    .controller('NavController', NavController);

  NavController.$inject = ['$scope', '$q', 'Constants', 'DashboardFactory', 'ApplicationInterface', 'DeviceType', 'ThingType', 'ActionToast', 'CredentialsDialog'];

  function NavController($scope, $q, Constants, DashboardFactory, ApplicationInterface, DeviceType, ThingType, ActionToast, CredentialsDialog) {
    /*jshint validthis: true */
    var vm = this;

    vm.constants = Constants;
    vm.isOpen = false;
    vm.applicationInterfaces = [];
    vm.applicationInterface = null;
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
      vm.types = [];
      vm.instances = [];
      vm.type = null;
      vm.instance = null;

      /*
       * Now store the selected application interface, device type and device in
       * the DashboardFactory.
       */
      DashboardFactory.setSelectedApplicationInterface(vm.applicationInterface !== 'None' ? vm.applicationInterface : null);
      DashboardFactory.setSelectedType(vm.type);
      DashboardFactory.setSelectedInstance(vm.instance);

      /*
       * If a valid application interface was selected, we need to retrieve all
       * of the Device/Thing Types that have deployed configuration and then,
       * for each Device/Thing Type returned, retrieve the Application
       * Interfaces associated with the Type.  We then need to check if the id
       * of any of these Application Interfaces matches the id of the selected
       * Application Interface.
       *
       * Most of this code goes away once we have an applicationInterfaceId
       * filter on the Device/Thing Types REST APIs.
       */
      if (vm.applicationInterface !== 'None') {
        // Retrieve all of the Device Types that have depoloyed configuration
        DeviceType.query(
          {excludeNotDeployed: true},
          function(response) {
            /*
             * Now retrieve the application interfaces associated with each of
             * returned Device Types.  Make all of these calls in parallel.
             */
            var devicePromises = response.results.map(function(deviceType){
              return DeviceType.getApplicationInterfaces({ typeId: deviceType.id }).$promise;
            });

            // Wait until all of the requests have completed
            $q.all(devicePromises).then(
              function(responses) {
                /*
                 * For each response, iterate over the array of Application
                 * Interfaces returned and check if it matches the selected
                 * Application Interface.
                 */
                angular.forEach(responses, function(deviceTypeAppIntfs, index) {
                  for (var i = 0; i < deviceTypeAppIntfs.length; i++) {
                    if (deviceTypeAppIntfs[i].id === vm.applicationInterface.id) {
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
        
        // Retrieve all of the Thing Types that have depoloyed configuration
        ThingType.query(
          {excludeNotDeployed: true},
          function(response) {
            /*
             * Now retrieve the application interfaces associated with each of
             * returned Thing Types.  Make all of these calls in parallel.
             */
            var thingPromises = response.results.map(function(thingType){
              return ThingType.getApplicationInterfaces({ typeId: thingType.id }).$promise;
            });

            // Wait until all of the requests have completed
            $q.all(thingPromises).then(
              function(responses) {
                /*
                 * For each response, iterate over the array of Application
                 * Interfaces returned and check if it matches the selected
                 * Application Interface.
                 */
                angular.forEach(responses, function(thingTypeAppIntfs, index) {
                  for (var i = 0; i < thingTypeAppIntfs.length; i++) {
                    if (thingTypeAppIntfs[i].id === vm.applicationInterface.id) {
                      response.results[index].type = Constants.resourceType.THING_TYPE;
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
        
        
      } // IF - vm.applicationInterface !== 'None'
    } // onApplicationInterfaceSelected

    /**
     * Called when the user changes the type that is selected. In response, we
     * need to retrieve all of the Device/Thing instances for the selected type.
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
       * If a valid type was selected, we need to retrieve all of the 
       * Devices/Things of that type.
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
        } else if (vm.type.type === Constants.resourceType.THING_TYPE) {
          /*
           * The selected type is a Thing Type. Retrieve all of the instances
           * of the Thing Type.
           */
          ThingType.getThings(
              { typeId: vm.type.id },
              function(response) {
                // Normalize the ids
                var instances = response.results;
                angular.forEach(instances, function(instance) {
                  instance.id = instance.thingId;
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

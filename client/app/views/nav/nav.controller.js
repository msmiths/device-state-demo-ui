(function() {
  'use strict';

  angular
    .module('demouiApp.nav')
    .controller('NavController', NavController);

  NavController.$inject = ['$scope', '$q', 'Constants', 'DashboardFactory', 'LogicalInterface', 'DraftDeviceType', 'DeviceType', 'ThingType', 'ActionToast', 'CredentialsDialog'];

  function NavController($scope, $q, Constants, DashboardFactory, LogicalInterface, DraftDeviceType, DeviceType, ThingType, ActionToast, CredentialsDialog) {
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
       * Watch the logicalInterface, type and instance attributes because
       * md-select does not appear to support the ng-change attribute
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
     * response, we need to retrieve the devices/things that expose the
     * selected logical interface.
     */
    function onLogicalInterfaceSelected() {
      // Reset the relevant view-model variables
      vm.types = [];
      vm.instances = [];
      vm.type = null;
      vm.instance = null;

      /*
       * Now store the selected logical interface, type and instance in the
       * DashboardFactory.
       */
      DashboardFactory.setSelectedLogicalInterface(vm.logicalInterface !== 'None' ? vm.logicalInterface : null);
      DashboardFactory.setSelectedType(vm.type);
      DashboardFactory.setSelectedInstance(vm.instance);

      /*
       * If a valid active logical interface was selected, we need to retrieve
       * all of the active Device and Thing Types are associated with the
       * logical interface.
       */
      if (vm.logicalInterface !== 'None') {
        DeviceType.query(
          {logicalInterfaceId: vm.logicalInterface.id},
          function(response) {
            // Store the returned device types in the types collection
            var deviceTypes = response.results;
            angular.forEach(deviceTypes, function(deviceType) {
              deviceType.type = Constants.resourceType.DEVICE_TYPE;
              vm.types.push(deviceType);
            });
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

        ThingType.query(
          {logicalInterfaceId: vm.logicalInterface.id},
          function(response) {
            // Store the returned thing types in the types collection
            var thingTypes = response.results;
            angular.forEach(thingTypes, function(thingType) {
              thingType.type = Constants.resourceType.THING_TYPE;
              vm.types.push(thingType);
            });
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
     * need to retrieve all of the Device/Thing instances for the selected
     * type.
     */
    function onTypeSelected() {
      // First, store the selected type in the DashboardFactory

      // Reset the relevant view-model variables
      vm.instances = [];
      vm.instance = null;

      // Now store the selected device/thing type and device in the DashboardFactory.
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

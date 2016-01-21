/**
 * Created by nishant on 11/29/2015.
 */
contactsModule.controller('contactsController', ['databaseService', '$scope', '$rootScope', '$http', 'authService',
    '$location', '$window', '$timeout', 'config', 'socket', '$state',
    function (databaseService, $scope, $rootScope, $http, authService, $location, $window, $timeout, config, socket, $state) {
        'use strict';

        var vm = this;
        //vm.contacts = [];

        $scope.max = 3;
        $scope.selectedIndex = 1;
        $scope.findExpert = "";


        /*vm.loadContacts = function () {
         databaseService.loadContacts().then(function (data) {
         if (data.success) {
         vm.contacts = data['contacts'];

         updateOnlineStatus();

         console.log("navigation-tabs.ctrl.js >> loadContacts >> contacts");
         console.log(vm.contacts);
         } else {
         alert(data.message);
         }
         })
         };
         vm.loadContacts();*/

        var updateOnlineStatus = function () {
            for (var i = 0; i < $scope.appCtrl.contacts.length; i++) {
                var contact = $scope.appCtrl.contacts[i];
                contact.status = $scope.appCtrl.usersList.indexOf(contact.username) != -1;
            }
        };

        $rootScope.$on("updateOnlineStatus", function (e) {
            console.log("broadcast updateOnlineStatus");
            updateOnlineStatus();
        });

        $scope.videoCall = function (receivername) {
            var caller = {
                callername: $scope.appCtrl.user.username,
                callerinfo: $scope.appCtrl.user,
                receivername: receivername,
                roomname: $scope.$parent.navTabsCtrl.room,
                startDateTime: Date.now()
            };
            socket.emit('calling', JSON.stringify(caller));
            //$state.go('tabs.onlineMode');
        };

    }]);
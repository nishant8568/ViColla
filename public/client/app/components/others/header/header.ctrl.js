/**
 * Created by nishant on 11/21/2015.
 */
headerModule.controller('HeaderController', ['$scope', '$location', 'authService', 'socket', '$mdUtil', '$mdSidenav', '$state', 'utilityService',
    function ($scope, $location, authService, socket, $mdUtil, $mdSidenav, $state, utilityService) {
        'use strict';

        var vm = this;
        $scope.state = $state;
        $scope.toggleSidenavMenu = buildTogglerForMenu('leftMenu');
        $scope.utilityService = utilityService;

        $scope.logoutUser = function() {
            $scope.toggleSidenavMenu();
            $scope.logout();
        };

        $scope.logout = function () {
            var userinfo = {roomname: "ChatRoom", username: $scope.appCtrl.user.username};
            socket.emit('logoutme', JSON.stringify(userinfo));
            $scope.appCtrl.user = {};

            authService.logout()
                .then(function (data) {
                    $location.path('/login')
                })
        };
        $scope.showSettings = function () {
            alert("showSettings");
        };
        $scope.showInfo = function () {
            alert("showInfo");
        };
        $scope.showAccountDetails = function () {
            alert("showAccountDetails");
        };

        function buildTogglerForMenu(navID) {
            var debounceFn = $mdUtil.debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }, 300);

            return debounceFn;
        }
    }]);
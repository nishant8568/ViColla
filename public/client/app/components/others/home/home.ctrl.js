/**
 * Created by nishant on 11/21/2015.
 */
homeModule.controller('HomeController', ['$scope', 'authService', '$window', '$location', 'socket', 'utilityService',
    function ($scope, authService, $window, $location, socket, utilityService) {
        'use strict';

        var vm = this;
        vm.user = {
            username: "",
            password: "",
            loginAsExpert: false
        };

        vm.submitCredentials = function () {
            authService.login(vm.user)
                .then(function (data) {
                    if (data.success) {
                        $scope.appCtrl.user = data["user"];
                        localStorage.setItem('username', $scope.appCtrl.user.username);
                        console.log("emit user login");
                        $scope.appCtrl.loadContacts();
                        utilityService.setExpertFlag($scope.appCtrl.user.isExpert);
                        socket.emit('userLogin', $scope.appCtrl.user.username);
                        //if (utilityService.getExpertFlag()) {
                            $location.path('/callHistory');
                        //}
                        /*else {
                            $location.path('/experts');
                        }*/
                    } else {
                        $window.alert(data["message"]);
                    }
                })
        };

        vm.test_session = function () {
            authService.test_session()

        };

        vm.logout = function () {
            authService.logout()

        };
    }]);
/**
 * Created by nishant on 10.12.2015.
 */

app.controller('AbcAppLandingController', ['$scope', '$location', 'authService', 'socket', 'utilityService', 'databaseService',
    function ($scope, $location, authService, socket, utilityService, databaseService) {
        var vm = this;
        vm.usersList = [];
        $scope.appCtrl.contacts = [];
        $scope.loadContacts = vm.loadContacts;

        vm.loadContacts = function () {
            console.log("calling database-service to load contacts....");
            databaseService.loadContacts().then(function (data) {
                if (data.success) {
                    $scope.appCtrl.contacts = data['contacts'];
                    updateOnlineStatus();
                    console.log("navigation-tabs.ctrl.js >> loadContacts >> contacts");
                    console.log($scope.appCtrl.contacts);
                } else {
                    alert(data.message);
                }
            })
        };

        var updateOnlineStatus = function () {
            for (var i = 0; i < $scope.appCtrl.contacts.length; i++) {
                var contact = $scope.appCtrl.contacts[i];
                contact.status = $scope.appCtrl.usersList.indexOf(contact.username) != -1;
            }
        };

        authService.isLoggedIn().then(function (data) {
            if (data.success) {
                $scope.appCtrl.user = data["user"];
                console.log("emit user login");
                utilityService.setExpertFlag($scope.appCtrl.user.isExpert);
                socket.emit('userLogin', $scope.appCtrl.user.username);
                vm.loadContacts();
            } else {
                $location.path('/login');
            }
        });
    }]);

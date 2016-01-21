/**
 * Created by nishant on 11/21/2015.
 */
onlineModeModule.controller('onlineModeController', ['$scope', 'utilityService', 'databaseService',
    function ($scope, utilityService, databaseService) {
        'use strict';
        var vm = this;
        $scope.max = 3;
        $scope.selectedIndex = 0;
        $scope.utilityService = utilityService;

        vm.loadCallHistory = function () {
            databaseService.loadCallHistory($scope.appCtrl.user.id).then(function (data) {
                if (data.success) {
                    vm.callHistory = data["callHistory"];
                } else {
                    alert(data.message);
                }
            })
        };
        vm.loadCallHistory();
    }]);
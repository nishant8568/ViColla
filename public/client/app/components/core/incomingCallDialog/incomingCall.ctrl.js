/**
 * Created by nishant on 12/6/2015.
 */
incomingCallModule.controller('incomingCallDialogController', ['$scope', '$mdDialog', 'message', 'callerinfo',
    function ($scope, $mdDialog, message, callerinfo) {
        'use strict';

        $scope.user = callerinfo;

        $scope.userDetails = message;
        $scope.answer = function (answer) {
            if (answer == 'receive') {
                console.log("userDetails.................", $scope.userDetails);
                $mdDialog.hide($scope.userDetails.callername);
            }
            else
                $mdDialog.hide();
        };
    }]);
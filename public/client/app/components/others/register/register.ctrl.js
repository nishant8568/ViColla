/**
 * Created by nishant on 11/29/2015.
 */
registerModule.controller('RegisterController', ['$scope', 'authService', '$window', '$location',
    function ($scope, authService, $window, $location) {
        'use strict';

        var vm = this;

        vm.user = {
            userName: "",
            password: "",
            email: "",
            phone: "",
            address: "",
            firstName: "",
            lastName: "",
            birthDate: null,
            logo: null,
            photo: null,
            designation: "",
            tags: [],
            status: true
        };

        $scope.selectPhotoButton = document.getElementById('browsePhoto');

        vm.signUp = function () {
            vm.user.birthDate = (vm.user.birthDate != null) ? create_utc_date(vm.user.birthDate) : null;
            vm.user.status = true;
            registerUser(vm.user);
        };

        var registerUser = function (data) {
            console.log("register.ctrl >> registerUser()");
            console.log(JSON.stringify(data));
            authService.register(data).then(function (response) {
                if (response.success) {
                    console.log(JSON.stringify(response));
                    $scope.appCtrl.user = undefined;
                    if (data.logo != null) {
                        console.log("uploading photo : ", data.logo);
                        uploadLogo({'file': data.logo})
                    } else {
                        $window.alert("Account created");
                        authService.logout()
                            .then(function (data) {
                                $location.path('/login')
                            })
                    }
                } else {
                    $window.alert(response.message);
                }
            });
        };

        var uploadLogo = function (data) {
            authService.uploadLogo(data).success(function (response) {
                $window.alert("Account created");
                authService.logout()
                    .then(function (data) {
                        $location.path('/login')
                    })
            });
        };

        var create_utc_date = function (old_date) {
            console.log(old_date);
            return new Date(Date.UTC(old_date.getFullYear(), old_date.getMonth(), old_date.getDate()))
        };

        $scope.selectPhoto = function () {
            $scope.selectPhotoButton.click();
        }
    }]);
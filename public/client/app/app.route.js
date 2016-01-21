/**
 * Created by nishant on 11/21/2015.
 */
'use strict';

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
        .when('/', '/callHistory')
        .otherwise('/callHistory');

    $stateProvider
        .state('tabs', {
            abstract: true,
            url: '/',
            onEnter: function () {
                console.log("enter abstract state tabs")
            },
            template: '<navigation-tabs layout="column" flex></navigation-tabs>'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'app/components/others/home/home.tpl.html',
            controller: 'HomeController',
            controllerAs: 'homeCtrl'
        })
        .state('tabs.callHistory', {
            url: 'callHistory',
            data: {
                'selectedTab': 0
            },
            views: {
                'callHistory': {
                    template: '<online-mode></online-mode>'
                }/*,
                 'contacts': {
                 template: '<contacts layout="column"></contacts>'
                 }*/
            }
        })
        .state('tabs.offlineMode', {
            url: 'offlineMode',
            data: {
                'selectedTab': 1
            },
            views: {
                'offlineMode': {
                    template: '<offline-mode></offline-mode>'
                }
            }
        })
        .state('tabs.onlineM', {
            abstract: true,
            url: 'onlineMode',
            template: '<div ui-view></div>'
        })
        .state('tabs.onlineM.onlineMode', {
            url: '',
            data: {
                'selectedTab': 2
            },
            template: '<videochat layout="column" layout-fill="" videouser="videoChat"></videochat>'
        })
        .state('tabs.onlineM.call', {
            url: '/call',
            template: '<videochat layout="column" layout-fill="" videouser="videoChat"></videochat>'
        })
        .state('tabs.onlineM.collaborate', {
            url: '/collaborate',
            controller: function ($scope, $state) {
                console.log("collaborate tab");
                $scope.options = $scope.$parent.options;

                $scope.optionClicked = function (option) {
                    switch (option.name) {
                        case "call":
                            $state.go("tabs.onlineM.call");
                            break;
                        case "collaborate":
                            $state.go("tabs.onlineM.collaborate");
                            break;
                        case "annotate":
                            $state.go("tabs.onlineM.annotate");
                            break;
                    }
                    $scope.$parent.optionSelected = option.name;
                    $scope.isExpert = $scope.$parent.isExpert;
                };
            },
            templateUrl: 'app/components/core/video-chat/collaborate/collaborate-online.html'
        })
        .state('tabs.onlineM.annotate', {
            url: '/annotate',
            templateUrl: 'app/components/core/video-chat/annotate/annotate-online.html',
            controller: function ($scope, $state) {
                console.log("annotate tab");
                $scope.options = $scope.$parent.options;

                $scope.optionClicked = function (option) {
                    switch (option.name) {
                        case "call":
                            $state.go("tabs.onlineM.call");
                            break;
                        case "collaborate":
                            $state.go("tabs.onlineM.collaborate");
                            break;
                        case "annotate":
                            $state.go("tabs.onlineM.annotate");
                            break;
                    }
                    $scope.$parent.optionSelected = option.name;
                    $scope.isExpert = $scope.$parent.isExpert;
                };
            }
        })
        .state('tabs.experts', {
            url: 'experts',
            data: {
                'selectedTab': 3
            },
            views: {
                'contacts': {
                    template: '<contacts layout="column"></contacts>'
                }
            }
        })
}]);
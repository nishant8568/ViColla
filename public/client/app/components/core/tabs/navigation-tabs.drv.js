/**
 * Created by nishant on 11/21/2015.
 */
navTabsModule.directive('navigationTabs', function() {
   return {
       restrict: 'E',
       templateUrl: 'app/components/core/tabs/navigation-tabs.tpl.html',
       controller: 'NavTabsController',
       controllerAs: 'navTabsCtrl'
   }
});
/**
 * Created by nishant on 11/21/2015.
 */
offlineModeModule.directive('offlineMode', function () {
   return {
       restrict: 'E',
       templateUrl: 'app/components/core/offline-mode/offline-mode.tpl.html',
       controller: 'offlineModeController',
       scope: {}
   }
});
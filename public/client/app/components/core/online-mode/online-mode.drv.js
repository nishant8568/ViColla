/**
 * Created by nishant on 11/21/2015.
 */
onlineModeModule.directive('onlineMode', function () {
   return {
       restrict: 'E',
       templateUrl: 'app/components/core/online-mode/online-mode.tpl.html',
       controller: 'onlineModeController',
       controllerAs: 'onlineModeCtrl',
       bindToController: true
   }
});
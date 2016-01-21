/**
 * Created by nishant on 11/27/2015.
 */
snapshotsModule.directive('snapshots', function(){
    return {
        restrict: 'E',
        templateUrl: 'app/components/core/snapshots/snapshots.tpl.html',
        controller: 'snapshotsController',
        replace: true
    }
});
/**
 * Created by nishant on 11/27/2015.
 */
toolsModule.directive('tools', function () {
    return {
        restrict: 'E',
        scope: {
            tool: "=",
            colorSelected: "=strokeColor",
            undo: "&",
            save: "&"
        },
        require: "^offlineMode",
        templateUrl: 'app/components/core/tools/tools.tpl.html',
        controller: 'toolsController'
    }
});
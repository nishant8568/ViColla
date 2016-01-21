/**
 * Created by nishant on 11/27/2015.
 */
toolsModule.controller('toolsController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {

    'use strict';

    $scope.tools = [
        {
            name: 'pen',
            icon: 'create'
        },
        {
            name: 'line',
            icon: 'remove'
        },
        {
            name: 'circle',
            icon: 'panorama_fish_eye'
        },
        {
            name: 'rectangle',
            icon: 'crop_5_4'
        },
        {
            name: 'triangle',
            icon: 'change_history'
        },
        {
            name: 'text',
            icon: 'text_format'
        }
    ];
    $scope.colors = [
        {
            name: ['darkred', 'mediumvioletred', 'red', 'orangered']
        },
        {
            name: ['darkgreen', 'green', 'darkolivegreen', 'greenyellow']
        },
        {
            name: ['darkblue', 'blue', 'lightskyblue', 'lightblue']
        }
    ];
    $scope.actions = [
        /*{
            name: 'undo',
            icon: 'undo',
            method: 'undo'
        },*/
        {
            name: 'save',
            icon: 'save',
            method: 'saveSnapshot'
        }
    ];

    $scope.disableTools = false;

    $scope.$on('toggleDisable', function(e) {
        $scope.disableTools = !$scope.disableTools;
    });

    $scope.toolClicked = function ($index) {
        $scope.tool = $scope.tools[$index].name;
    };

    $scope.colorClicked = function (parentIndex, $index) {
        $scope.colorSelected = $scope.colors[parentIndex].name[$index];
    };

    $scope.actionClicked = function ($index) {
        if ($scope.actions[$index].method == "undo") {
            $scope.undo();
        } else {
            $scope.save();
        }
    };
}]);
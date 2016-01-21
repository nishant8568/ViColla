videochatModule.directive('videochat', function () {
    return {
        restrict: 'E',
        scope: {
            videoChat: '=videouser'
        },
        templateUrl: 'app/components/core/video-chat/video-chat.tpl.html',
        controller: 'videoChatController',
        controllerAs: 'vdoChatCtrl',
        bindToController: true,
        replace: true
    }
});
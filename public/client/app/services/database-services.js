/**
 * Created by nishant on 09.12.2015.
 */


var databaseModule = angular.module('databaseModule', []);
databaseModule.service('databaseService', ['$rootScope', '$http', '$q', function ($rootScope, $http, $q) {
    return ({
        loadContacts: loadContacts,
        loadCallHistory: loadCallHistory,
        loadImages: loadImages,
        saveImage: saveImage,
        removeImage: removeImage,
        updateImage: updateImage,
        videoChatData: videoChatData,
        addItem: addItem
    });
    function addItem() {
        //$rootScope.$broadcast('eventFired', {
        //    data: 'something'
        //});
    }

    function loadImages(videoName) {
        var request = $http({
            method: 'get',
            url: 'api/images',
            params: {
                videoName: videoName
            }
        });
        return (request.then(handleSuccess, handleError))
    }

    function saveImage(imageInfo) {
        var request = $http({
            method: 'post',
            url: 'api/save/image',
            data: {
                imageInfo: imageInfo
            }
        });
        return (request.then(handleSuccess, handleError))
    }

    function removeImage(snapshotId) {
        var request = $http({
            method: 'post',
            url: '/api/remove/image',
            data: {
                imageId: snapshotId
            }
        });
        return (request.then(handleSuccess, handleError))
    }

    function updateImage(imageInfo) {
        var request = $http({
            method: 'post',
            url: '/api/update/image',
            data: {
                imageInfo: imageInfo
            }
        });
        return (request.then(handleSuccess, handleError))
    }

    function loadContacts() {
        var request = $http({
            method: 'get',
            url: '/api/contacts'
        });
        return (request.then(handleSuccess, handleError))
    }

    function loadCallHistory(userId) {
        var request = $http({
            method: 'get',
            url: 'api/call/history',
            params: {
                userId: userId
            }
        });
        return (request.then(handleSuccess, handleError))
    }

    function videoChatData(userId) {
        var request = $http({
            method: 'get',
            url: 'api/videoCalling',
            params: {
                userId: userId
            }

        });
        return (request.then(handleSuccess, handleError))
    }


    // I transform the error response, unwrapping the application data from
    // the API response payload.
    function handleError(response) {

        // The API response from the server should be returned in a
        // normlized format. However, if the request was not handled by the
        // server (or what not handles properly - ex. server error), then we
        // may have to normalize it on our end, as best we can.
        if (
            !angular.isObject(response.data) || !response.data.message
        ) {

            return ( $q.reject("An unknown error occurred.") );
        }

        // Otherwise, use expected error message.
        return ( $q.reject(response.data.message) );
    }

    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess(response) {
        return ( response.data );
    }

}]);

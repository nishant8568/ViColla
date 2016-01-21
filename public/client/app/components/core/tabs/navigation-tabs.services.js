/**
 * Created by nishant on 06.12.2015.
 */

var callHistoryModule = angular.module('callHistoryModule', []);

callHistoryModule.service('callHistoryService', ['$http', '$q', function($http, $q){
    return({
        getCallHistory: getCallHistory
    });

    function getCallHistory(){
       var request = $http({
           method: 'get',
           url: '/api/call/history'
       });
       return (request.then(handleSuccess, handleError))
    }

    // I transform the error response, unwrapping the application data from
    // the API response payload.
    function handleError( response ) {

        // The API response from the server should be returned in a
        // normlized format. However, if the request was not handled by the
        // server (or what not handles properly - ex. server error), then we
        // may have to normalize it on our end, as best we can.
        if (
            ! angular.isObject( response.data ) ||
            ! response.data.message
        ) {

            return( $q.reject( "An unknown error occurred." ) );
        }

        // Otherwise, use expected error message.
        return( $q.reject( response.data.message ) );
    }

    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess( response ) {
        return( response.data );
    }
}]);

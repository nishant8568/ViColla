/**
 * Created by nishant on 06.12.2015.
 */

authModule.service('authService', ['$http', '$q', function ($http, $q) {
    var username;
    return ({
        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        test_session: test_session,
        register: register,
        getUsername: getUsername,
        setUsername: setUsername,
        uploadLogo: uploadLogo
    });

    function login(userCredentials) {
        var request = $http({
            method: "post",
            url: "/api/login",
            data: userCredentials
        });

        return (request.then(handleSuccess, handleError));
    }

    function logout() {
        var request = $http({
            method: 'get',
            url: '/api/logout'
        });
        localStorage.removeItem('username');
        return (request.then(handleSuccess, handleError));
    }

    function isLoggedIn() {
        var request = $http({
            method: "get",
            url: "/api/check/session"
        });
        return (request.then(handleSuccess, handleError))
    }

    function uploadLogo(data){
        var fd = new FormData();
        for (var key in data)
            fd.append(key, data[key]);

        return $http.post("/api/upload", fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        })
    }

    function register(credentials) {
      //console.log("credentials:"+JSON.stringify(credentials));
        var request = $http({
            method: "post",
            url: "/api/signup",
            data: credentials
        });

        return (request.then(handleSuccess, handleError))
    }

    function test_session() {
        $http.get("/api/test").success(function (data) {
            console.log(data)
        }).error(function (data) {
            console.log(data)
        });
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
    function handleSuccess( response ) {
        return( response.data );
    }

    function getUsername() {
        return username;
    }

    function setUsername(user) {
        username = user;
    }
}]);
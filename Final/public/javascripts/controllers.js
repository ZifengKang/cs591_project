angular.module('cs411', ['ngRoute', 'ngCookies'])

    .controller('cs411ctrl', function ($scope, $http, $cookies) {


        //READ Weathers and restaurants
        $scope.getRestaurants = function () {
            $http.get('http://localhost:3000/api/allres')
                .then(function (response) {
                    $scope.restaurants = response.data;

                })
        };
        $scope.getWeathers = function () {
            $http.get('http://localhost:3000/api/allwea')
                .then(function (response) {
                    $scope.weathers = response.data;

                })
        };


        //UPDATE Weathers and restaurants
        $scope.updateWeather = function (city) {
            $http.get('http://localhost:3000/api/weatherupdate/' + city)
            $http.get('http://localhost:3000/api/allwea')
                .then(function (response) {
                    $scope.weathers = response.data;

                })
        };
        $scope.findres = function (city) {
            $http.get('http://localhost:3000/api/findres/' + city)

        };
        $scope.show = function () {
            $http.get('http://localhost:3000/api/allres')
                .then(function (response) {
                    $scope.restaurants = response.data;

                })
        }



        //DELETE weathers and restaurants
        $scope.delete = function (city) {
            $http.delete('http://localhost:3000/api/removeres')
            $http.get('http://localhost:3000/api/allres')
                .then(function (response) {
                    $scope.restaurants = response.data;

                })
        };
        $scope.deletewea = function (city) {
            $http.delete('http://localhost:3000/api/removewea')
            $http.get('http://localhost:3000/api/allwea')
                .then(function (response) {
                    $scope.weathers = response.data;

                })
        };

        //initialize the app
        $scope.initApp = function () {
            $scope.buttonState = "create";
            $scope.h2message="Update Weathers and Search Restaurants";
            $scope.buttonMessage = "Update Weathers";
            $scope.buttonMessage1 = "Search Restaurants";
            $scope.buttonMessage2 = "Reset Weathers";
            $scope.buttonMessage3 = "Reset Restaurants";
            $scope.getRestaurants();
            $scope.getWeathers();
            let authCookie = $cookies.get('authStatus')
            $scope.authorized = !!authCookie
        }


        //Twitter Oauth
        $scope.logout = function () {
            $http.get('/auth/logout')
                .then(function (response) {
                    $scope.authorized = false
                })
        }
        $scope.login = function () {
            const request = {
                method: 'post',
                url: 'http://localhost:3000/auth/login',
                data: {
                    username: $scope.username,
                    password: $scope.password
                }
            }
            $http(request)
                .then(function (response) {
                        $scope.authorized = true
                        $scope.showLogin = false
                    },
                    function (err) {
                        $scope.authorized = false
                    }
                )
        }

        $scope.register = function () {

            const request = {
                method: 'post',
                url: '/auth/register',
                data: {
                    name: $scope.name,
                    username: $scope.username,
                    password: $scope.password
                }
            }
            $http(request)
                .then(function (response) {
                        $scope.authorized = true
                        $scope.showLogin = false
                    },
                    function (error) {
                        if (error.status === 401) {
                            $scope.authorized = false
                            $scope.h2message = "Error registering"
                            console.log(error)
                        }
                    }
                )
        }

        $scope.showLoginForm = function () {
            $scope.showLogin = true
        }

        $scope.doTwitterAuth = function () {
            var openUrl = '/auth/twitter/'
            //Total hack, this:
            $scope.authorized = true
            window.location.replace(openUrl)

        }

    })




    //This controller handles toggling the display of details in the user list
    .controller('listController', function ($scope) {
        $scope.display = false

        $scope.showInfo = function () {
            $scope.display = !$scope.display
        }
    })

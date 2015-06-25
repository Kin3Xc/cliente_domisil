var app = angular.module('domisilapp', ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
});


app.controller('HomeCtrl', ['$scope', function($scope){
	
}]);
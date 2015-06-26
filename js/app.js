
var app = angular.module('domisilapp', ['ngRoute', 'ngAnimate']);

app.config(function($routeProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})

		.when('/registro',{
			templateUrl: 'partials/registro.html'
			// controller: 'RegistroCtrl'
		});
});


app.controller('HomeCtrl', ['$scope', function($scope){
	
}]);

// Agrego una factoria donde estaran los diferentes metodos
// encargados de trabajar con el mapa de Google
app.factory('renderMap', function(){
	var service = {};
	
	var originLat; 
	var originLng;
	
	var map;
	var Origen;
	var Destino;
	var directionsDisplay;
	var directionsService;

	var originMarker;
	var originLatLon;
	var destinyMarker;
	var destinyLatLon;

	var originCoords;
	var destinyCoords;


	// Metodo para inicializar el mapa con la pocision actual 
	// // del usuario
	service.initialize = function(position){
		// var a = [position.coords.latitude, position.coords.longitude];
		// var b = [originLat, originLng];

		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer();

		var location =  new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		var mapOptions = {
			zoom: 16,
			center: location,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		map = new google.maps.Map(document.getElementById('map_canvas'),
			mapOptions);	

		directionsDisplay.setMap(map);

		originMarker = new google.maps.Marker({
			map: map,
			// position: location,
			// title: 'Ubicación'
		});
		// originLatLon = location;

		Origen = new google.maps.places.Autocomplete((document.getElementById('origen')),{ country: ['co'] });
		google.maps.event.addListener(Origen, 'place_changed', function() {
			service.posicionOrigen();
		});
		Destino = new google.maps.places.Autocomplete((document.getElementById('destino')),{ country: ['co'] });
		google.maps.event.addListener(Destino, 'place_changed', function() {
			service.posicionDestino();
		});
	}

	//Metodo para marcar la direccion de origen que ingresa el usuario
	service.posicionOrigen = function(){
		originMarker.setMap(null);
		var place = Origen.getPlace();
		originLatLon = place.geometry.location;
		originMarker = new google.maps.Marker({
			map: map,
			title: place.name,
			position: place.geometry.location
		});
		map.setCenter(place.geometry.location);
	}
	//Metodo para marlar la direccion de destino que el usuario ingresa
	service.posicionDestino = function(){
		if (destinyMarker) {destinyMarker.setMap(null)};
		var place = Destino.getPlace();
		destinyLatLon = place.geometry.location;
		destinyMarker = new google.maps.Marker({
			map: map,
			title: place.name,
			position: place.geometry.location
		});
		map.setCenter(place.geometry.location);
	}

	// Metodo que permite octener la posicion actual del usuario
	service.geoposicion = function(f1, f2){
		navigator.geolocation.getCurrentPosition(f1, f2,{maximumAge: 30000,timeout: 5000,enableHighAccuracy: true});
		
	}
	service.geoloc = function(){}

	//Metodo para marcar las direcciones de origen y destino y el recorrido
	//ademas de calcular la distancia y el tiempo de recorrido aprx.
	service.ruta = function(){
		originMarker.setMap(null);
		destinyMarker.setMap(null);
		var request = {
			origin:originLatLon,
			destination:destinyLatLon,
			travelMode: google.maps.TravelMode.DRIVING
		};

		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				var distancia = response.routes[0].legs[0].distance.value / 1000;
				var tiempo =response.routes[0].legs[0].duration.text;
				console.log(distancia);
			}
		});
	}
	return service;
});

// Creo un controlador para manejar la parte de la cotización
// del usuario
app.controller('cotizadorController', ['$scope', 'renderMap', '$http', function($scope, renderMap, $http){
	$scope.ver = false;
	 renderMap.geoposicion(renderMap.initialize, renderMap.geoloc);
	 //renderMap.ruta;
	//Funcion para mostrar el mapa al hacer clic en Cotizar

	$scope.mostrarInfo = function(){
	  $scope.ver = true;
	  renderMap.geoposicion(renderMap.initialize, renderMap.geoloc);
	  renderMap.ruta();

	  $http.defaults.headers.common["X-Custom-Header"] = "Angular.js";
	  $http.get('http://192.168.0.26:3000/api/emp-domiciliarios').
	  	success(function(data, status, headers, config){
	  		$scope.empresas = data;
	  	});
	};

}]);

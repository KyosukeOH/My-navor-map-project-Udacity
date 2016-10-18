// Models
function hotPlaces(data) {
//Declare how we will use Foursqare data for each venues in list
  var self = this;
  self.name = ko.observable(data.name);
  self.hereNow = ko.observable(data.hereNow.count);
  self.lat = ko.observable(data.location.lat);
  self.lng = ko.observable(data.location.lng);


//Declare to how we throw Foursquare data to Google Map marker API
  self.marker = new google.maps.Marker({
    position: new google.maps.LatLng(self.lat(), self.lng()),
    map: map,
    title: self.name()
  });


//https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
//To show venue name on infowindow. 
  self.contentString = ko.computed(function() {
    return '<h1>' + self.name() + '</h1>';
  });


  self.infowindow = new google.maps.InfoWindow({
    content: self.contentString()
  })
  
//Show marker on the map 
  self.marker.setMap(map);

//Show info window when marker is clicked 
  self.marker.addListener('click', function() {
    self.infowindow.open(map, self.marker);  

    //Set Time out for infowindow to close 
    setTimeout(function() {
      self.infowindow.close();
    }, 1000);  
  })


  //This is for when user clicked list names. This is saying, treat it as if user clicked marker.
  self.animateClick = function(e) {
    google.maps.event.trigger(self.marker, 'click');
  };
}






// Declare map location variable for each city with JSON

var centerLocations = {

  "tokyo" : {

      "lat": 35.697241, "lng": 139.747257, "zoom": 12

    },

  "kanagawa" : {

      "lat": 35.384118, "lng": 139.383734, "zoom": 11

  }

};

// Declare map's zoom level. Initial data is given at Octopus
var mapZoom;




// Map styles variable declared with custom design
var mapStyles = [

  {

    featureType: 'water',

    stylers: [

      { color: '#051a2f' }

    ]

  },{

    featureType: 'administrative',

    elementType: 'labels.text.stroke',

    stylers: [

      { color: '#ffffff' },

      { weight: 6 }

    ]

  },{

    featureType: 'administrative',

    elementType: 'labels.text.fill',

    stylers: [

      { color: '#e85113' }

    ]

  },{

    featureType: 'road.highway',

    elementType: 'geometry.stroke',

    stylers: [

      { color: '#003366' },

      { lightness: -40 }

    ]

  },{

    featureType: 'transit.station',

    stylers: [

      { weight: 9 },

      { hue: '#e85113' }

    ]

  },{

    featureType: 'road.highway',

    elementType: 'labels.icon',

    stylers: [

      { visibility: 'off' }

    ]

  },{

    featureType: 'water',

    elementType: 'labels.text.stroke',

    stylers: [

      { lightness: 100 }

    ]

  },{

    featureType: 'water',

    elementType: 'labels.text.fill',

    stylers: [

      { lightness: -100 }

    ]

  },{

    featureType: 'poi',

    elementType: 'geometry',

    stylers: [

      { visibility: 'on' },

      { color: '#f0e4d3' }

    ]

  },{

    featureType: 'road.highway',

    elementType: 'geometry.fill',

    stylers: [

      { color: '#efe9e4' },

      { lightness: -25 }

    ]

  }

];

// Octopus
// Set initial location of map as Tokyo
var mapLat = centerLocations.tokyo.lat;
var mapLng = centerLocations.tokyo.lng; 
mapZoom = centerLocations.tokyo.zoom;

// Function to move city to new place, but it won't do anything here. This will be used inside viewModel to do things.
function moveCity() {
  var newLocation = new google.maps.LatLng(mapLat, mapLng)
  map.setCenter(newLocation);
  map.setZoom(mapZoom);

};


// ViewModel of Knockout where this app gets data from forsquare and create new hotPlaces objects to show in html
function viewModel() {

  var self = this;
  self.Venues = ko.observableArray([]);

//This function tells Foursqare and Map API to switch city
  self.clickToMoveKanagawa = function(e) {
    mapLat = centerLocations.kanagawa.lat;
    mapLng = centerLocations.kanagawa.lng;
	mapZoom = centerLocations.kanagawa.zoom;
    getData();
	moveCity();
  }
  
  self.clickToMoveTokyo = function(e) {
    mapLat = centerLocations.tokyo.lat;
    mapLng = centerLocations.tokyo.lng;
	mapZoom = centerLocations.tokyo.zoom;
    getData();
	moveCity();
  }
  
//Function to fetch data from Foursqare API
function getData() {
  self.latToSearch = ko.observable(mapLat);
  self.lngToSearch = ko.observable(mapLng);
  
    var forsquareURL = "https://api.foursquare.com/v2/venues/trending?ll=" + self.latToSearch() + "," + self.lngToSearch() + "&limit=20&radius=50000&oauth_token=Y0RX04KYHWR0MDKUDTHAUSSQKUXZU0DEJHRW5XTRSX5KKCTM&v=20161002";

 //get JSON data from forsqare and change it into array
    $.getJSON( 

        forsquareURL,

      function(data) {

        var venueInfo = $.map(data.response.venues, function(spot) { return new hotPlaces(spot);});
        self.Venues(venueInfo);
      }
    ).fail(function(){
      alert("Couldn't download venue info");
    });
  };

  getData();

}

ko.applyBindings(new viewModel());





// Views
function initMap() {

  // Constructor creates a new map - only center and zoom are required.

  map = new google.maps.Map(document.getElementById('map'), {

    center: {lat: mapLat, lng: mapLng},

    zoom: mapZoom,

    styles: mapStyles,

    mapTypeControl: false

  });


}



// Google Maps Error Handling
//https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282#checking-fallback-technique

function googleError() {
    alert("Google Maps has failed to load for some reason or another. It is not your fault. Grab a beer.")
}
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


// Models
function hotPlaces(data) {
//Declare how we will use Foursqare data for each venues in list
  var self = this;
  self.name = data.name;
  self.hereNow = data.hereNow.count;
  self.lat = data.location.lat;
  self.lng = data.location.lng;

//Declare to how we throw Foursquare data to Google Map marker API
  self.marker = new google.maps.Marker({
    position: new google.maps.LatLng(self.lat, self.lng),
	animation: google.maps.Animation.DROP,
    map: map,
	title: self.name
  });

//https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
//To show venue name on infowindow. 
  self.contentString = ko.computed(function() {
    return '<h1>' + self.name + '</h1>' + 
	  '<h2>' + self.hereNow + 'people at this place now' + '</h2>'
	  ;
  });

  self.infowindow = new google.maps.InfoWindow({
    content: self.contentString()
  });
  
  
//https://developers.google.com/maps/documentation/javascript/examples/marker-animations?hl=ja
//function to make marker bounce
self.toggleBounce = function(e) {
	self.marker.setAnimation(google.maps.Animation.BOUNCE);
};
  
//Show info window when marker is clicked 
  self.marker.addListener('click', function() {
    self.infowindow.open(map, self.marker);  
	self.toggleBounce();
    //Set Time out for marker bounce 
    setTimeout(function() {
      self.marker.setAnimation(null);
    }, 700);  
    //Set Time out for infowindow to close 
    setTimeout(function() {
      self.infowindow.close();
    }, 1000);  
  });
  
  //This is for when user clicked list names. This is saying, treat it as if user clicked marker.
  self.animateClick = function(e) {
    google.maps.event.trigger(self.marker, 'click');
  };
  
//Add marker on the map
  self.marker.setMap(map);
}

// Declare map location variable for each city with JSON. Only Tokyo is necessary, and Kanagawa was just an back up.
var centerLocations = {
  "tokyo" : {
      "lat": 35.697241, "lng": 139.747257, "zoom": 12
    },
  "kanagawa" : {
      "lat": 35.384118, "lng": 139.383734, "zoom": 11
  }
};

// Octopus
// Set initial location of map as Tokyo
var mapLat = centerLocations.tokyo.lat;
var mapLng = centerLocations.tokyo.lng; 

// ViewModel of Knockout where this app gets data from forsquare and create new hotPlaces objects to show in html
function viewModel() {

  var self = this;
  self.Venues = ko.observableArray([]);
  self.search = ko.observable("");
    
//Function to fetch data from Foursqare API
function getData() {
  self.latToSearch = mapLat;
  self.lngToSearch = mapLng;
  var forsquareURL;
  //If API search failed because of missing location info, we'll notify user with this.
  if (self.latToSearch === null || self.lngToSearch === null) {
	alert("Couldn't search the place, because location to search is not defined.");
  }
  else{
  	forsquareURL = "https://api.foursquare.com/v2/venues/trending?ll=" + self.latToSearch + "," + self.lngToSearch + "&limit=20&radius=50000&oauth_token=Y0RX04KYHWR0MDKUDTHAUSSQKUXZU0DEJHRW5XTRSX5KKCTM&v=20161002";
  }
  
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
  }

  getData();
  
  self.search = ko.observable('');
  //Filter and shows result on list and map
  //http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html	

  self.filterVenues = ko.computed(function() {
	  var filter = self.search().toLowerCase();
	  
	  return ko.utils.arrayFilter(self.Venues(), function(venuesItem) {
		  if (!self.search()) {
			  //This put markers back on map, when user deleted all search term
			  venuesItem.marker.setVisible(true);
		  	  return self.Venues();
			  //http://stackoverflow.com/questions/28042344/filter-using-knockoutjs
			  //with this filter object which starts with same text as user typed in
		  }else if (venuesItem.name.toLowerCase().substring(0, filter.length) === filter) {
				venuesItem.marker.setVisible(true);
				return venuesItem.name.toLowerCase().substring(0, filter.length) === filter;
			}else{
				venuesItem.marker.setVisible(false);
			}
	  	});
	  }, self);
}

// Views
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.697241, lng: 139.747257},
    zoom: 12,
    styles: mapStyles,
    mapTypeControl: false,
  });
  	ko.applyBindings(new viewModel());
}

// Google Maps Error Handling
//https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282#checking-fallback-technique

function googleError() {
    alert("Failed to download Google Maps data.");
}


// Mobile only function to hide menu and slide it in
//http://stackoverflow.com/questions/10901626/hide-menu-onclick
function mobileMenu() {
	$(".list-box").slideUp("fast");
}
//kick off mobile only menu function when screen size changed
if($(window).width()<=900){
	mobileMenu();
	//Hide list when user chose venue from list
	$(".shop-info").click(function(){
		$(".list-box").slideUp("fast");
	});
}
//Show list when user clicked "See List"
$(".list-cta").click(function() {
	$(".list-box").slideDown("slow");
});

// Reload page after user finished changing window size. 
//http://kadoppe.com/archives/2012/02/jquery-window-resize-event.html
var timer = false;
$(window).resize(function() {
    if (timer !== false) {
        clearTimeout(timer);
    }
    timer = setTimeout(function() {
        location.reload();
    }, 200);
});
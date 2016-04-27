function createSearchBox(map, inputElement) {
  searchBox = new google.maps.places.SearchBox(inputElement);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputElement);

  searchBox.addListener('places_changed', function() {
    
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    add_record({
      "action":"searchPlace",
      "value": $("#pac-input").val()
    });

    var bounds = new google.maps.LatLngBounds();
    // TODO, might only get the first one
    places.forEach(function(place) {
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });

    // TODO, the logic here might be changing later
    // current when the map fit to the bounds, there might be an "idle" event triggerred. 
    // which will cause the a new event request. 
    map.fitBounds(bounds);
    getEvents();

  });
  return searchBox;
}

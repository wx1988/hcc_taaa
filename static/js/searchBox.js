function createSearchBox(map, inputElement) {
  searchBox = new google.maps.places.SearchBox(inputElement);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputElement);

  searchBox.addListener('places_changed', function() {
    add_record('searchPlace');
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }

    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
    getEvents();
  });
  return searchBox;
}

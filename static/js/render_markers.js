function render_markers(map, accidents)
{
  pt_list = [];
  marker_list = [];
  var infowindow = new google.maps.InfoWindow();
  for(var i = 0; i < accidents.length; ++i)
  {
    pt_list[i] = new google.maps.LatLng(
        accidents[i].lat, accidents[i].lng);

    marker_list[i] = new google.maps.Marker({
      position: pt_list[i],
      map: map,
      icon: '/static/imgs/red_cross_12.png'
    });
    makeInfoWindowEvent(map, infowindow, "test" + i, marker_list[i]);
  }
}

function makeInfoWindowEvent(map, infowindow, contentString, marker)
{
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
}

/**
 * Created by sumeetsingharora on 4/16/16.
 */

var map, heatmap;

function initMap() {
  map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: 13,
        center: {lat: 35, lng: -78},
        mapTypeId: google.maps.MapTypeId.SATELLITE
      }
      );
  getEvents();
}

function getEvents(){
  bound = map.getBounds();
  if(bound == undefined){
    bounddic = {
      'filtertype':'bound',
      'left':-78.1,
      'right':-78,
      'top':35.1,
      'down':35
    };
  } else {
    ne = bound.getNorthEast();
    sw = bound.getSouthWest();
    // access the map bound
    bounddic = {
      'filtertype':'bound',
      'left':-sw.lng,
      'right':ne.lng,
      'top':ne.lat,
      'down':sw.lat,
      'time_of_day_range': [0, 6*60*60]
    };
  }
  jQuery.post(
      "/get_accidents",
      bounddic,
      geteventcb,
      'json');
}

function geteventcb(data){
  if(data.status != 0){
    alert(data.data);
    return;
  }
  console.log("get events");
  acc_list = data.data;
  pt_list = [];
  marker_list = [];
  var infowindow = new google.maps.InfoWindow();

  for(var i=0;i < acc_list.length;i++){
    pt_list[i] = new google.maps.LatLng(
        acc_list[i].lat, acc_list[i].lng);
    marker_list[i] = new google.maps.Marker({
      position: pt_list[i],
      map: map,
      icon: '/static/imgs/red_cross_12.png'
    });

    makeInfoWindowEvent(map, infowindow, "test" + i, marker_list[i]);
  }
}

function makeInfoWindowEvent(map, infowindow, contentString, marker) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
}

$(function() {
  initMap();
});

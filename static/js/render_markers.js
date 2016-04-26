function getAccidentMarkerCB(map, accidents) {
  /* main entrance to render the markers
   */
  clearVisual();
  set_markers(homeJS.onscreenMarker, null);
  homeJS.onscreenMarker = getAndRenderMarkers(map, accidents);
  var accNumInfo = homeJS.onscreenMarker.length + " accident(s) showing in screen";
  $('#info-box').html(accNumInfo);

  // TODO, why set the visual mode here? should be controled by human?
  homeJS.currentVisualMode = 'markers';
  
  console.log("rendering the accident marker");
}

function set_markers(markers, map){
  /* add the markers to map
   */
  for(var i = 0; i < markers.length; ++i) {
    markers[i].setMap(map);
  }
}

function getAccidentIcon(accident){
  /* severity K,A,B,C correspond to color (black, red, orange, green)
     the icon will change based on the accident collsion type
   */
  // the severity only for the worst case
  var severityLevel = 'green';
  if(accident.num_b>0) severityLevel = 'orange';
  if(accident.num_a>0) severityLevel = 'red';
  if(accident.num_k>0) severityLevel = 'black';

  // collision type priority
  // pedestrian 14
  // cyclist 15
  // head-on 27
  // rear end 21, 22
  console.log(accident.events);
  var collision_type = '';
  if( accident.events.length > 1){
    if( (21 in accident.events) || (22 in accident.events))
      collision_type = 'rear_end';
    if( 27 in accident.events)
      collision_type = 'head_on';
    if( 15 in accident.events)
      collision_type = 'bicycle';
    if(14 in accident.events)
      collision_type = 'pedestrian';
    if( 17 in accident.events)
      collision_type = 'dear';
  }
  if( accident.events.length == 1 ){
    if( (21 == accident.events[0]) || (22 == accident.events[0]))
      collision_type = 'rear_end';
    if( 27 == accident.events[0])
      collision_type = 'head_on';
    if( 15 == accident.events[0])
      collision_type = 'bicycle';
    if(14 == accident.events[0])
      collision_type = 'pedestrian';
    if(17 == accident.events[0])
      collision_type = 'dear';
  }

  var image = undefined;
  if(collision_type == ""){
    // TODO, create four level of dead for this icon
    image = '/static/imgs/cross_12_'+severityLevel+'.png';
  }else{
    image = new google.maps.MarkerImage(
        '/static/imgs/collision/'+collision_type+'_'+severityLevel+'.png',
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        //null, /* anchor is bottom center of the scaled image */
        new google.maps.Point(30, -30),
        new google.maps.Size(30, 30)
        );  
    image = '/static/imgs/collision/'+collision_type+'_'+severityLevel+'_50p.png';
  }
  
  return image;
}

function getAndRenderMarkers(map, accidents) {
  /* create markers for the accidents and initialize them on the map
   */
  var pt_list = [];
  var marker_list = [];
  var infowindow = new google.maps.InfoWindow();
  for(var i = 0; i < accidents.length; ++i)
  {
    pt_list[i] = new google.maps.LatLng(
        accidents[i].lat, accidents[i].lng);

    marker_list[i] = new google.maps.Marker({
      position: pt_list[i],
      map: map,
      accidentID: accidents[i].caseno,
      //icon: '/static/imgs/red_cross_12.png'
      icon: getAccidentIcon(accidents[i])
    });
    makeAccInfowindowEvent(map, infowindow, 
        get_acc_details(accidents[i]), marker_list[i]);
  }
  return marker_list;
}

function renderNewMarkers(map, oldMarkers, newMarkers){
  /* remove old markers from map and put new markers on the map
   */
  set_markers(oldMarkers, null);
  set_markers(newMarkers, map);
}

function makeAccInfowindowEvent(map, infowindow, contentString, marker)
{
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
}

function get_acc_details(accident) {
  acc_info = 'Lat: ' + accident.lat + '<br />' + 'Lng: ' + accident.lng;
  if(accident.acc_date != 'NAN') { acc_info += '<br />' + 'Data: ' + accident.acc_date; }
  if(accident.time != 'NAN') { acc_info += '<br />' + 'Time: ' + accident.time; }
  if(accident.weather1 != 'NAN') { acc_info += '<br />' + 'Weather: ' + accCode.weather[accident.weather1]; }
  if(accident.rdsurf != 'NAN') { acc_info += '<br />' + 'Road Surface: ' + accCode.rdsurf[accident.rdsurf]; }
  if(accident.caseno != 'NAN') { acc_info += '<br />' + 'Case Number: ' + accident.caseno; }
  if(accident.rte_nbr != 'NAN') { acc_info += '<br />' + 'Route Number: ' + accident.rte_nbr; }
  if(accident.alcflag!= 'NAN') { acc_info += '<br />' + 'Alcohol Flag: ' + accident.alcflag; }
  if(accident.light!= 'NAN') { acc_info += '<br />' + 'Light Condition: ' + accCode.light[accident.light]; }
  if(accident.drv_sex!= 'NAN') { acc_info += '<br />' + 'Driver Gender: ' + accCode.drv_sex[accident.drv_sex]; }
  if(accident.drv_age!= 'NAN') { acc_info += '<br />' + 'Driver Age: ' + accident.drv_age; }
  if(accident.loc_type!= 'NAN') { acc_info += '<br />' + 'Location type: ' + accCode.loc_type[accident.loc_type]; }
  if(accident.num_k!= 'NAN') { acc_info += '<br />' + 'Number of K: ' + accident.num_k; }
  if(accident.num_a!= 'NAN') { acc_info += '<br />' + 'Number of A: ' + accident.num_a; }
  if(accident.num_b!= 'NAN') { acc_info += '<br />' + 'Number of B: ' + accident.num_b; }
  if(accident.num_c!= 'NAN') { acc_info += '<br />' + 'Number of C: ' + accident.num_c; }
  return acc_info;
}



function drawMarkerInfoBox(acc_num){
  var accNumInfo = acc_num + " accident(s) showing in screen";
  var colorInfo = "Color: severity <span title='people killed'>K</span>"+
    ", <span style='color:red' title='disabling injury'>A</span>, "+
    "<span style='color:orange;' title='evident injury'>B</span>, "+
    "<span style='color:green' title='possible injury'>C</span>";
  var iconInfo = "<img src='/static/imgs/collision/head_on_black_50p.png' /> Head on<br/>"+
    "<img src='/static/imgs/collision/rear_end_black_50p.png' />Rear end <br/>"+
    "<img src='/static/imgs/collision/pedestrian_black_50p.png' />Pedestrian<br/>"+
    "<img src='/static/imgs/collision/bicycle_black_50p.png' />Bicycle<br/>"+
    "<img src='/static/imgs/collision/dear_black_50p.png' />Animal<br/>"+
    "<img src='/static/imgs/cross_12_black.png' />Others";
  
  var whoInfo = accNumInfo+"<br/>"+colorInfo+"<br/>"+iconInfo;
  $('#info-box').html(whoInfo);
}

function getAccidentMarkerCB(map, accidents) {
  /* main entrance to render the markers
   */
  clearVisual();
  set_markers(homeJS.onscreenMarker, null);
  homeJS.onscreenMarker = getAndRenderMarkers(map, accidents);
  drawMarkerInfoBox(  homeJS.onscreenMarker.length );

  // TODO, Yue, why set the visual mode here? should be controled by human?
  // The currentMode is set after the render, due to the need to clear the object of previous state
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
  var collision_type = '';
  if( $.inArray(accCodeEnum.event.Animal, accident.events) >= 0 )
    collision_type = 'dear';
  if( ($.inArray(accCodeEnum.event.RearEndSlowOrStop, accident.events) >= 0 ) || ($.inArray(accCodeEnum.event.RearEndTurn, accident.events)>=0 ) )
    collision_type = 'rear_end';
  if( $.inArray(accCodeEnum.event.HeadOn, accident.events) >= 0)
    collision_type = 'head_on';
  if( $.inArray(accCodeEnum.event.PedalCyclist, accident.events) >= 0)
    collision_type = 'bicycle';
  if( $.inArray(accCodeEnum.event.Pedstrian, accident.events) >= 0)
    collision_type = 'pedestrian';
  //console.log( accident.events );
  //console.log( collision_type );

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
  for(var i = 0; i < accidents.length; ++i) {
    pt_list[i] = new google.maps.LatLng(
        accidents[i].lat, accidents[i].lng);

    marker_list[i] = new google.maps.Marker({
      position: pt_list[i],
      map: map,
      accidentID: accidents[i].caseno,
      //icon: '/static/imgs/red_cross_12.png'
      icon: getAccidentIcon(accidents[i])
    });

    // TODO, Xingwang, make this information window more complete
    google.maps.event.addListener( marker_list[i], 'click', function(){
      var tmpMarker = this;
      // TODO, create ajax call to get more complete information
      $.post(
        '/get_accident_by_caseno',
        {'caseno': this.accidentID}, 
        function(res){
          if(res.status != 0){
            alert(res.data);
            return;
          }

          var tmpInfoWindow = new google.maps.InfoWindow();
          var tmpContent = getAccDetailsFull( res.data ); 
          tmpInfoWindow.setContent(tmpContent);
          tmpInfoWindow.open(map, tmpMarker);
        },
        'json');
    });  
    /*
    makeAccInfowindowEvent(map, infowindow, 
        get_acc_details(accidents[i]), marker_list[i]);
        */
  }
  return marker_list;
}

function renderNewMarkers(map, oldMarkers, newMarkers) {
  /* remove old markers from map and put new markers on the map
   */
  set_markers(oldMarkers, null);
  set_markers(newMarkers, map);
}

function makeAccInfowindowEvent(map, infowindow, contentString, marker) {
  google.maps.event.addListener(marker, 'click', function() {
    add_record_refined({
      "action": "markerClicked", 
      "caseno": marker.accidentID,
      "bound": getMapBound(map),
      "facetObj": homeJSLocal.facetObj
    });
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
}

function get_acc_details(accident) {
  acc_info = '(Lat, Lng): ' + accident.lat.toFixed(3)+',' + accident.lng.toFixed(3);
  acc_info +=  '; Datatime: ' + accident.acc_date +' ' +accident.time;
  
  var env_info = "";
  if(accident.light!= 'NAN') { env_info += '; ' + accCode.light[accident.light]; }
  if(accident.weather1 != 'NAN') { env_info += '; ' + accCode.weather[accident.weather1]; }
  if(accident.rdsurf != 'NAN') { env_info += ';Road Surface( ' + accCode.rdsurf[accident.rdsurf] +')'; }
  acc_info += "<br/> Environment: "+ env_info;

  var driver_info = "";
  if(accident.drv_sex!= 'NAN') { driver_info += 'Gender('+accCode.drv_sex[accident.drv_sex]+'), '; }
  if(accident.drv_age!= 'NAN') { driver_info += 'Age(' + accident.drv_age+'), '; }
  if(accident.alcflag!= 'NAN') { driver_info += 'Alcohol(' + accident.alcflag+')'; }
  acc_info += "<br/> Driver: "+driver_info;

  acc_info += '<br />' + 'Number of injury with severity K, A, B, C: (' + accident.num_k + ', '+ 
    accident.num_a + ', '+accident.num_b + ', '+  accident.num_c+')';
  return acc_info;
}


function getVehDetails(vehList) {
  // List contributing factors and sequence of event
  vehList = vehList.sort(function(a,b){return a.vehno - b.vehno;});
  var veh_str = "";
  for(var i = 0;i < vehList.length;i++){
    var one_veh_str = "Vehicle "+(i+1)+": ";
    var contrib_str = "";
    for(var j = 1; j < 5;j++){
      var k = 'contrib'+j;
      if( vehList[i][k] != null && vehList[i][k] != undefined){
        contrib_str += vehList[i][k]+',';
      }
    }
    var event_str = "";
    for(var j = 1; j < 5;j++){
      var k = 'event'+j;
      if( vehList[i][k] != null && vehList[i][k] != undefined){
        event_str += vehList[i][k]+',';
      }
    }
    one_veh_str += contrib_str +';'+event_str;
    veh_str += one_veh_str+"<br/>";
  }
  return veh_str;
}

function getAccDetailsFull(accident) {
  /*
   * accident Detail includes the vehicle information and the road detail.
   * */
  var acc_info = get_acc_details(accident.acc);

  var veh_info = '';
  if(accident.veh_list != undefined) {
    veh_info = getVehDetails(accident.veh_list);
  }

  var road_info = "";
  if(accident.route != undefined) {
    road_info = get_seg_details(accident.route);
  }
  return acc_info + '<hr/>'+veh_info +'<hr/>'+ road_info;
}

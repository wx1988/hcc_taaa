/**
 * Created by sumeetsingharora on 4/16/16.
 */

var homeJS = {
  onscreenMarker: [],
  selectedMarker: [],
  lastShape: undefined,
  maptToPlot: "heatmap"
}

var homeJSLocal = {
  roadsegments: undefined,
  map: undefined,
  visual_mode: undefined,
  facetObj: undefined,
  searchBox: undefined
}

function initMap() {
  google.maps.visualRefresh = true;

  homeJSLocal.map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: 13,
        center: {lat: 35, lng: -78},

        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.LEFT_TOP,
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.TERRAIN,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.HYBRID
          ]}
      });

  addClearSelection(homeJSLocal.map);
  addDrawing(homeJSLocal.map);

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  homeJSLocal.searchBox = createSearchBox(homeJSLocal.map, input);

  homeJSLocal.map.addListener('idle', function() {
    getEvents();
    homeJSLocal.searchBox.setBounds(homeJSLocal.map.getBounds());
  });

  getEvents();
}

function getEvents(){
  bound = homeJSLocal.map.getBounds();
  if(bound == undefined){
    // call this function later until the map is loaded
    setTimeout(getEvents, 100);
    return;
  }

  ne = bound.getNorthEast();
  sw = bound.getSouthWest();
  // access the map bound
  bounddic = {
    'left':sw.lng,
    'right':ne.lng,
    'top':ne.lat,
    'down':sw.lat,
    'facetObj':JSON.stringify(homeJSLocal.facetObj)
  };

  if(homeJS.maptToPlot == "roadsegments") {
    jQuery.post(
        "/get_segs",
        bounddic,
        getEventCB,
        'json');
  }else{
    jQuery.post(
        "/get_accidents",
        bounddic,
        getEventCB,
        'json');
  }
}

function clearVisual(){
  if(homeJSLocal.visual_mode == undefined)  return;
  if(homeJSLocal.visual_mode === 'markers') {
    set_markers(homeJS.onscreenMarker, null); 
  } else if(homeJSLocal.visual_mode === 'segments') {
    setSegments(homeJSLocal.roadsegments, null);
  } else {
    homeJSLocal.visual_mode.setMap(null); 
  }
}

function getEventCB(data){
  if(homeJS.lastShape != undefined){
    homeJS.lastShape.setMap(null);
  }
  if(data.status != 0){
    alert(data.data);
    return;
  }
  console.log(homeJS.maptToPlot);
  acc_list = data.data;
  if(homeJS.maptToPlot == "heatmap") {
    clearVisual();
    homeJSLocal.visual_mode = getAndRenderHeatmap(homeJSLocal.map, acc_list);
    console.log("rendering the heat map");
  } else if(homeJS.maptToPlot == "roadsegments") {
    clearVisual();
    homeJSLocal.roadsegments = getAndRenderRoadsegments(homeJSLocal.map, acc_list);
    console.log("rendering the road segments");
    homeJSLocal.visual_mode = 'segments';
  } else {
    clearVisual();
    set_markers(homeJS.onscreenMarker, null);
    homeJS.onscreenMarker = getAndRenderMarkers(homeJSLocal.map, data.data);
    document.getElementById('info-box').textContent = homeJS.onscreenMarker.length + " accident(s) showing in screen";
    homeJSLocal.visual_mode = 'markers';
    console.log("rendering the accident marker");
  }
}

$(function() {
  add_record('homepage'); 
  homeJSLocal.facetObj = constructEmptyFacetObj(homeJSLocal.facetObj);
  $('#facets :checkbox').click(function(){
    getFacetsCheckboxes(homeJSLocal.facetObj);
    logFacetObj(homeJSLocal.facetObj);
    getEvents();
  });

  $('#facets :radio').click(function(){
    getFacetsRadiobuttons(homeJSLocal.facetObj);
    logFacetObj(homeJSLocal.facetObj);
    getEvents();
  });

  $("#start-date").datepicker({
    onSelect: function(dateText) {
      homeJSLocal.facetObj.date_range[0] = dateText;
      logFacetObj(homeJSLocal.facetObj);
      getEvents();
    }
  });

  $("#end-date").datepicker({
    onSelect: function(dateText) {
      homeJSLocal.facetObj.date_range[1] = dateText;
      logFacetObj(homeJSLocal.facetObj);
      getEvents();
    }
  });

  $("#start-time").timepicker({
    change: function(time) {
      var element =  $(this), text;
      var timepicker = element.timepicker();
      text = timepicker.format(time);
      var seconds = getSeconds(text);
      homeJSLocal.facetObj.timeofday_range[0] = seconds;
      logFacetObj(homeJSLocal.facetObj);
      getEvents();
    }
  });

  $("#end-time").timepicker({
    change: function(time) {
      var element =  $(this), text;
      var timepicker = element.timepicker();
      text = timepicker.format(time);
      var seconds = getSeconds(text);
      homeJSLocal.facetObj.timeofday_range[1] = seconds;
      logFacetObj(homeJSLocal.facetObj);
      getEvents();
    }
  });

  $('#accidents').click(function () {
    homeJS.maptToPlot = "accidents";
    getEvents();
  });

  $('#roadsegments').click(function () {
    homeJS.maptToPlot = "roadsegments";
    getEvents();
  });

  $('#heatpmap').click(function () {
    homeJS.maptToPlot = "heatmap";
    getEvents();
  });

  initMap();

  // get user information
  jQuery.post(
      "/get_user_info",
      {},
      function(data){
        if(data.status != 0){
          alert('user information error'+data.data);
          return;
        }
        user_info = data.data;
        tmp_str = "You are user "+user_info.user_id;
        $('#userinfo').html(tmp_str);
      },
      'json');
});

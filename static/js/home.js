/**
 * Created by sumeetsingharora on 4/16/16.
 */

//TODO Do not know what is this, can not refactored
var globalDataList = undefined;

var homeJS = {
  onscreenMarker: [],
  selectedMarker: [],
  lastShape: undefined,
  roadsegments: undefined,
  heatmap: undefined,
  currentVisualMode: undefined
}

var homeJSLocal = {
  visualModeToApply: "heatmap",
  map: undefined,
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

  if(homeJSLocal.visualModeToApply == "segments") {
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
  if(homeJS.currentVisualMode == undefined)  return;
  if(homeJS.currentVisualMode === 'markers') {
    set_markers(homeJS.onscreenMarker, null); 
  } else if(homeJS.currentVisualMode === 'segments') {
    setSegments(homeJS.roadsegments, null);
  } else {
    homeJS.heatmap.setMap(null); 
  }
}

function getEventCB(data){
  if(homeJS.lastShape != undefined ){
    homeJS.lastShape.setMap(null);
  }
  if(data.status != 0){
    alert(data.data);
    return;
  }

  //TODO do not know what is this
  globalDataList = data.data;

  if(homeJSLocal.visualModeToApply == "heatmap") {
    getAccidentHeatmapCB(homeJSLocal.map, data.data);
  } else if(homeJSLocal.visualModeToApply == "segments") {
    getRoadSegmentsCB(homeJSLocal.map, data.data);
  } else {
    getAccidentMarkerCB(homeJSLocal.map, data.data);
  }
}

// TO DO plot the actual data instead of the dummy data.
function drawTableEvent() {
      google.charts.setOnLoadCallback(drawTable);
      function drawTable() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('number', 'Salary');
        data.addColumn('boolean', 'Full Time Employee');
        data.addRows([
          ['Mike',  {v: 10000, f: '$10,000'}, true],
          ['Jim',   {v:8000,   f: '$8,000'},  false],
          ['Alice', {v: 12500, f: '$12,500'}, true],
          ['Bob',   {v: 7000,  f: '$7,000'},  true]
        ]);

        var table = new google.visualization.Table(document.getElementById('table_div'));

        table.draw(data, {showRowNumber: true, width: '100%', height: '20%'});
      }
}

$(function() {
  google.charts.load('current', {'packages':['table']});
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
    homeJSLocal.visualModeToApply = "markers";
    getEvents();
  });

  $('#roadsegments').click(function () {
    homeJSLocal.visualModeToApply = "segments";
    getEvents();
  });

  $('#heatpmap').click(function () {
    homeJSLocal.visualModeToApply = "heatmap";
    getEvents();
  });

 $('#details').click(function () {
      if(state == "off") {
          state = "on";
          $('#details').text('Hide details');
          $("#map").css("height", "50%");
          drawTableEvent();

      } else {
        state = "off";
         $('#details').text('View details');
         $("#map").css("height", "100%");
         $('#table_div').remove();
         $('#table_row').append('<div id="table_div"></div>');
      }
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

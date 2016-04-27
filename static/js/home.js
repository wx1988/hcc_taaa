/**
 * Created by sumeetsingharora on 4/16/16.
 */

var homeJS = {
  onscreenMarker: [], // on the markers 
  selectedMarker: [], // markers in the selected region
  lastShape: undefined, // the selected region
  roadsegments: undefined,
  heatmap: undefined,
  currentVisualMode: 'markers', // other two options, 'segments', 'heatmap'
  globalDataList: undefined    
}

var homeJSLocal = {        
  visualModeToApply: "markers", // to keep the old visual mode and clear existing things
  map: undefined,
  facetObj: undefined,
  searchBox: undefined,
  drawingManager: undefined,
  clearSelectAreaButton: undefined,
  detailViewState: false
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

  homeJSLocal.clearSelectAreaButton = createAndRenderClearSelection(homeJSLocal.map);
  homeJSLocal.drawingManager = createAndRenderDrawing(homeJSLocal.map);  

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  homeJSLocal.searchBox = createSearchBox(homeJSLocal.map, input);

  homeJSLocal.map.addListener('idle', function() {
    if(homeJS.lastShape != undefined) {
      if(homeJS.currentVisualMode === 'markers'
          &&  homeJSLocal.visualModeToApply === 'markers') return;
    }
    getEvents();
    homeJSLocal.searchBox.setBounds(homeJSLocal.map.getBounds());
  });

  getEvents();
}

function getEvents(){

  // clear the old data
  homeJS.globalDataList = undefined;

  var bound = homeJSLocal.map.getBounds();
  if(bound == undefined){
    // call this function later until the map is loaded
    setTimeout(getEvents, 100);
    return;
  }

  var ne = bound.getNorthEast();
  var sw = bound.getSouthWest();

  // NOTE: when the height is set to 50%, the get bound is still get the old boundary 
  // access the map bound
  var down = sw.lat();
  if(homeJSLocal.detailViewState){
    down = (ne.lat() + sw.lat())/2;
  }
  var filterDic = {
    'left':sw.lng(),
    'right':ne.lng(),
    'top':ne.lat(),
    'down':down,
    'facetObj':JSON.stringify(homeJSLocal.facetObj)
  };
  console.log(filterDic);
  if( homeJSLocal.visualModeToApply == "segments"){
    jQuery.post(
        "/get_segs",
        filterDic,
        getEventCB,
        'json');
  }else{
    jQuery.post(
        "/get_accidents",
        filterDic,
        getEventCB,
        'json');
  }
}

function enableDrawing() {
  if(homeJS.currentVisualMode != 'markers') {
    homeJSLocal.drawingManager.setMap(homeJSLocal.map);
    homeJSLocal.map.controls[google.maps.ControlPosition.TOP_CENTER].push(homeJSLocal.clearSelectAreaButton);
  }
}

function disableDrawing() {
  if(homeJS.currentVisualMode === 'markers') {
    homeJSLocal.drawingManager.setMap(null);
    homeJSLocal.map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
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
  if(data.status != 0){
    alert(data.data);
    return;
  }

  // default way
  //
  homeJS.globalDataList = data.data;
  if(homeJS.lastShape != undefined && homeJS.currentVisualMode == 'markers'){
    // TODO, filter the event based on the shape
    
    // TODO, this should not be cleared
    // NOTE, only clear by the event
    //homeJS.lastShape.setMap(null);
    
    var dlist = data.data;
    var newDataList = [];
    for(var i = 0;i < dlist.length;i++){
      var tmpp = {
        lat: function(){return dlist[i].lat;}, 
        lng: function(){return dlist[i].lng;}};
      if( pointInShape(tmpp, homeJS.lastShape) ){
        //newDataList[newDataList.length] = dlist[i];
        newDataList.push( dlist[i] );
      }
    }
    homeJS.globalDataList = newDataList;
  }

  if(homeJSLocal.visualModeToApply == "heatmap") {
    disableDrawing();
    getAccidentHeatmapCB(homeJSLocal.map, homeJS.globalDataList);
  } else if(homeJSLocal.visualModeToApply == "segments") {
    disableDrawing();
    getRoadSegmentsCB(homeJSLocal.map, homeJS.globalDataList);
  } else {
    enableDrawing();
    getAccidentMarkerCB(homeJSLocal.map, homeJS.globalDataList);
  }

  // udpate the table
  if(homeJSLocal.detailViewState){
    drawTableEvent();
  }
}

function facetSelectionInit(){
  $('#facets :checkbox').click(function(){
    var status = "disabled"
    if(this.checked) status = "enabled";
    if(this.name == 'severity'){
      add_record('severity-'+this.value+'-'+status);
    }else if(this.name == "Col-type"){
      add_record('collisionType-'+this.value+'-'+status);
    }else if(this.name == "nbrlane"){
      add_record('laneNumber-'+this.value+'-'+status);
    }
    else{
      console.log("WARNING: unknow checkbox type");
    }

    getFacetsCheckboxes(homeJSLocal.facetObj);
    logFacetObj(homeJSLocal.facetObj);
    getEvents();
  });

  $('#facets :radio').click(function(){
    //console.log(this);
    if(this.name == 'loc-type'){
      add_record('locationType-'+this.value+'-enabled');      
    }else{
      console.log("WARNING: unknow radio button type");
    }

    getFacetsRadiobuttons(homeJSLocal.facetObj);
    logFacetObj(homeJSLocal.facetObj);
    getEvents();
  });

  $("#start-date").datepicker({
    defaultDate: new Date(2009,1,1),
    changeMonth: true,
    changeYear:true,
    onSelect: function(dateText) {
      add_record_refined({
        "action":"changeStartDate",
        "value":dateText
      });

      homeJSLocal.facetObj.date_range[0] = dateText;
      logFacetObj(homeJSLocal.facetObj);
      getEvents();
    }
  });

  $("#end-date").datepicker({
    defaultDate: new Date(2014,12,31),
    changeMonth: true,
    changeYear: true,
    onSelect: function(dateText) {
      add_record_refined({
        "action":"changeEndDate",
        "value":dateText
      });
      
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
      add_record_refined({
        "action":"changeStartTime",
        "value":seconds
      });
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
      add_record_refined({
        "action":"changeEndTime",
        "value":seconds
      });
      logFacetObj(homeJSLocal.facetObj);
      getEvents();
    }
  });
}

function viewModeSelectionInit(){
  $('#accidents').click(function () {
    add_record("accidentViewMode");
    homeJSLocal.visualModeToApply = "markers";
    document.getElementById("details").disabled = false;
    document.getElementById("export").disabled = false;
    getEvents();
  });

  $('#roadsegments').click(function () {
    add_record("roadViewMode");
    document.getElementById("details").disabled = true;
    document.getElementById("export").disabled = true;
    homeJSLocal.visualModeToApply = "segments";

    if(homeJSLocal.detailViewState == true)
      closeDetailPanel();
    getEvents();
  });

  $('#heatpmap').click(function () {
    add_record("heatmapViewMode");
    document.getElementById("details").disabled = true;
    document.getElementById("export").disabled = true;
    homeJSLocal.visualModeToApply = "heatmap";

    if(homeJSLocal.detailViewState == true)
      closeDetailPanel();
    getEvents();
  });
}

function openDetailPanel(){
  homeJSLocal.detailViewState = true;
  $('#details').text('Hide details');
  $("#map").css("height", "50%");
}

function closeDetailPanel(){
  homeJSLocal.detailViewState = false;
  $('#details').text('View details');
  $("#map").css("height", "100%");
  $('#table_div').remove();
  $('#table_row').append('<div id="table_div"></div>');
}

function viewDetailSelectionInit(){
  $("#export").click(function(){
    add_record("exportData");
    exportData();
  });

  $('#details').click(function () {
    if( homeJSLocal.visualModeToApply != "markers"){
      alert("Only Accident View support ViewDetail");
      return;
    }

    if(homeJSLocal.detailViewState == false) {
      add_record("viewDetail");
      openDetailPanel();
    } else {
      add_record("closeViewDetail");
      closeDetailPanel();
    }
    // re-get the events, and the draw table will be called after data is loaded.
    getEvents();    
  });
}

function initUserInfoPanel(){
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
}

function initFacetPanelLogger(){
  $('.panel').on('hidden.bs.collapse', function(e){
    add_record(this.id+'Close');
  });
  $('.panel').on('show.bs.collapse', function(e){
    add_record(this.id+'Open');
  });

}

$(function() {
  add_record('homepage'); 
  google.charts.load('current', {'packages':['table']});
  homeJSLocal.facetObj = constructEmptyFacetObj(homeJSLocal.facetObj);

  facetSelectionInit();
  viewModeSelectionInit();
  viewDetailSelectionInit();    
  initUserInfoPanel();
  initMap();

  initMapLogger(homeJSLocal.map);
  initFacetPanelLogger();
});

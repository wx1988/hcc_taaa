/**
 * Created by sumeetsingharora on 4/16/16.
 */

onscreenMarker = [];
selectedMarker = [];
var map = undefined;
var heatmap;
var shift_draw, lastShape;
var facetObj;
var searchBox;
var maptToPlot = "heatmap";

function ClearSelectControl(controlDiv) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to clear the selected';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '10px';
  controlText.style.lineHeight = '20px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Clear Selected';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', function() {
    if (lastShape != undefined) {
      lastShape.setMap(null);
      lastShape = undefined;
    }
    getEvents();
  });

}

function SetClearSelectControl(map) {
  var centerControlDiv = document.createElement('div');
  var centerControl = new ClearSelectControl(centerControlDiv, map);
  centerControlDiv.index = 1;
  centerControlDiv.style['padding-top'] = '5px';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}

function SetDrawingEvent(drawingManager, map) {
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    if (lastShape != undefined) {
      lastShape.setMap(null);
    }

    lastShape = e.overlay;
    lastShape.type = e.type;
    if (lastShape.type == google.maps.drawing.OverlayType.RECTANGLE) {
      lastBounds = lastShape.getBounds();
      selectedMarker = [];
      for(var i = 0; i < onscreenMarker.length; ++i) {
        if(lastBounds.contains(onscreenMarker[i].getPosition())) {
          selectedMarker.push(onscreenMarker[i]);
        }
      }
    } else if (lastShape.type == google.maps.drawing.OverlayType.POLYGON) {
      selectedMarker = [];
      for(var i = 0; i < onscreenMarker.length; ++i) {
        if (google.maps.geometry.poly.containsLocation(onscreenMarker[i].getPosition(), lastShape)) {
          selectedMarker.push(onscreenMarker[i]);
        }
      }
    }
    document.getElementById('info-box').textContent = selectedMarker.length + " accident(s) has been selected";
    renderNewMarkers(map, onscreenMarker, selectedMarker);
    drawingManager.setDrawingMode(null);
  });
}

function SetDrawingControl(map) {
  //Drawing control
  var shapeOptions = {
    strokeWeight: 1,
    strokeOpacity: 1,
    fillOpacity: 0.2,
    editable: false,
    clickable: false,
    strokeColor: '#3399FF',
    fillColor: '#3399FF'
  };

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.RECTANGLE
      ]},
    rectangleOptions: shapeOptions,
    position: google.maps.ControlPosition.TOP_RIGHT,
    polygonOptions: shapeOptions,
    map: map
  });

  SetDrawingEvent(drawingManager, map); 
}

function initMap() {
  google.maps.visualRefresh = true;

  map = new google.maps.Map(
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

  SetClearSelectControl(map);
  SetDrawingControl(map);

  map.addListener('idle', function() {
    getEvents();
    searchBox.setBounds(map.getBounds());
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  searchBox.addListener('places_changed', function() {
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
  getEvents();
}

function getEvents(){
    bound = map.getBounds();
    if(bound == undefined){
        // call this function later until the map is loaded
        setTimeout(getEvents, 100);
    }

    ne = bound.getNorthEast();
    sw = bound.getSouthWest();
    // access the map bound
    bounddic = {
        'left':sw.lng,
        'right':ne.lng,
        'top':ne.lat,
        'down':sw.lat,
        'facetObj':JSON.stringify(facetObj)
    };

    if(maptToPlot == "roadsegments") {
        jQuery.post(
            "/get_segs",
            bounddic,
            geteventcb,
            'json');
    }else{
        jQuery.post(
            "/get_accidents",
            bounddic,
            geteventcb,
            'json');
    }
}

function getEventCB(data){
  if(data.status != 0){
    alert(data.data);
    return;
  }
  if(lastShape == undefined) {
    set_markers(onscreenMarker, null);
    onscreenMarker = getAndRenderInitMarkers(map, data.data);
    document.getElementById('info-box').textContent = onscreenMarker.length + " accident(s) showing in screen"
  }
  acc_list = data.data;
  if(maptToPlot == "heatmap") {
    render_heatmap(map,acc_list);
    console.log("rendering the heat map");
  } else if(maptToPlot == "roadsegments") {
    render_roadsegments(map, acc_list);
    console.log("rendering the road segments");
  } else {
    render_markers(map, acc_list);
    console.log("rendering the accident marker");
  }
}

$(function() {
  facetObj = constructEmptyFacetObj(facetObj);
  $('#facets :checkbox').click(function(){
    getFacetsCheckboxes(facetObj);
    logFacetObj(facetObj);
    getEvents();
  });

  $('#facets :radio').click(function(){
    getFacetsRadiobuttons(facetObj);
    logFacetObj(facetObj);
    getEvents();
  });

  $("#start-date").datepicker({
    onSelect: function(dateText) {
      facetObj.date_range[0] = dateText;
      logFacetObj(facetObj);
      getEvents();
    }
  });

  $("#end-date").datepicker({
    onSelect: function(dateText) {
      facetObj.date_range[1] = dateText;
      logFacetObj(facetObj);
      getEvents();
    }
  });

  $("#start-time").timepicker({
    change: function(time) {
      var element =  $(this), text;
      var timepicker = element.timepicker();
      text = timepicker.format(time);
      var seconds = getSeconds(text);
      facetObj.timeofday_range[0] = seconds;
      logFacetObj(facetObj);
      getEvents();
    }
  });

  $("#end-time").timepicker({
    change: function(time) {
      var element =  $(this), text;
      var timepicker = element.timepicker();
      text = timepicker.format(time);
      var seconds = getSeconds(text);
      facetObj.timeofday_range[1] = seconds;
      logFacetObj(facetObj);
      getEvents();
    }
  });

  $('#accidents').click(function () {
    maptToPlot = "accidents";
    getEvents();
  });

  $('#roadsegments').click(function () {
    maptToPlot = "roadsegments";
    getEvents();
  });

  $('#heatpmap').click(function () {
    maptToPlot = "heatmap";
    getEvents();
  });

  initMap();
});

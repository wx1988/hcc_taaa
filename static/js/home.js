/**
 * Created by sumeetsingharora on 4/16/16.
 */

onscreenMarker = [];
selectedMarker = [];
var map, heatmap;
var shift_draw, lastShape;
var facetObj;


function CenterClearControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to clear the selected';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Clear Selected';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    if (lastShape != undefined) {
      lastShape.setMap(null);
      lastShape = undefined;
    }
    getEvents();
  });
}

function initMap() {
  google.maps.visualRefresh = true;
  map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: 13,
        center: {lat: 35, lng: -78},
        mapTypeId: google.maps.MapTypeId.SATELLITE
      }
      );

  //Center Button
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterClearControl(centerControlDiv, map);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

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

  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControlOptions: {drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.RECTANGLE]},
    rectangleOptions: shapeOptions,
    polygonOptions: shapeOptions,
    map: map
  });

  map.addListener('idle', function() {
    getEvents();
  });

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

    renderNewMarkers(map, onscreenMarker, selectedMarker);
    drawingManager.setDrawingMode(null);
  });

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
      'left':sw.lng(),
      'right':ne.lng(),
      'top':ne.lat(),
      'down':sw.lat(),
      'facetObj':facetObj
    };
  }
  jQuery.post(
      "/get_accidents",
      bounddic,
      getEventCB,
      'json');
}

function getEventCB(data){
  console.log("Refresh map");
  if(data.status != 0){
    alert(data.data);
    return;
  }
  if(lastShape == undefined) {
    set_markers(onscreenMarker, null);
    onscreenMarker = getAndRenderInitMarkers(map, data.data);
  }
}

$(function() {
  facetObj = constructEmptyFacetObj(facetObj);
  $('#facets :checkbox').click(function(){
    getFacetsCheckboxes(facetObj);
    logFacetObj(facetObj);
    initMap();
  });

  $('#facets :radio').click(function(){
    getFacetsRadiobuttons(facetObj);
    logFacetObj(facetObj);
    initMap();
  });

  $("#start-date").datepicker({
    onSelect: function(dateText) {
      facetObj.date_range[0] = dateText;
      logFacetObj(facetObj);
      initMap();
    }
  });

  $("#end-date").datepicker({
    onSelect: function(dateText) {
      facetObj.date_range[1] = dateText;
      logFacetObj(facetObj);
      initMap();
    }
  });

  initMap();
});

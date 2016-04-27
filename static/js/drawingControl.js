

function createAndRenderDrawing(map) {
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
      ]
    },
    rectangleOptions: shapeOptions,
    position: google.maps.ControlPosition.TOP_RIGHT,
    polygonOptions: shapeOptions,
    map: map
  });

  SetDrawingEvent(drawingManager, map); 
  return drawingManager;
}

function clearDrawingButton(controlDiv) {
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
    if (homeJS.lastShape != undefined) {
      homeJS.lastShape.setMap(null);
      homeJS.lastShape = undefined;
    }
    getEvents();
  });
}

function createAndRenderClearSelection(map) {
  var centerControlDiv = document.createElement('div');
  var centerControl = new clearDrawingButton(centerControlDiv, map);
  centerControlDiv.index = 1;
  centerControlDiv.style['padding-top'] = '5px';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
  return centerControlDiv;
}

function SetDrawingEvent(drawingManager, map) {
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    if (homeJS.lastShape != undefined) {
      homeJS.lastShape.setMap(null);
    }
    drawingManager.setDrawingMode(null);

    homeJS.lastShape = e.overlay;
    homeJS.lastShape.type = e.type;
    if(homeJS.currentVisualMode != "markers") return;

    if (homeJS.lastShape.type == google.maps.drawing.OverlayType.RECTANGLE) {
      var lastBounds = homeJS.lastShape.getBounds();
      homeJS.selectedMarker = [];
      for(var i = 0; i < homeJS.onscreenMarker.length; ++i) {
        if(lastBounds.contains(homeJS.onscreenMarker[i].getPosition())) {
          homeJS.selectedMarker.push(homeJS.onscreenMarker[i]);
        }
      }
    } else if (homeJS.lastShape.type == google.maps.drawing.OverlayType.POLYGON) {
      homeJS.selectedMarker = [];
      for(var i = 0; i < homeJS.onscreenMarker.length; ++i) {
        if (google.maps.geometry.poly.containsLocation(homeJS.onscreenMarker[i].getPosition(), homeJS.lastShape)) {
          homeJS.selectedMarker.push(homeJS.onscreenMarker[i]);
        }
      }
    }
    document.getElementById('info-box').textContent = homeJS.selectedMarker.length + " accident(s) has been selected";
    renderNewMarkers(map, homeJS.onscreenMarker, homeJS.selectedMarker);
  });
}

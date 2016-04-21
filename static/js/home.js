/**
 * Created by sumeetsingharora on 4/16/16.
 */

var map, heatmap;
var facetObj;

function initMap()
{
	map = new google.maps.Map(
			document.getElementById('map'), {
				zoom: 13,
				center: {lat: 35, lng: -78},
				mapTypeId: google.maps.MapTypeId.SATELLITE
			}
			);


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

	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
		if (lastShape != undefined) {
			lastShape.setMap(null);
		}
		// cancel drawing mode
		if (shift_draw == false) { drawingManager.setDrawingMode(null); }

		lastShape = e.overlay;
		lastShape.type = e.type;


		if (lastShape.type == google.maps.drawing.OverlayType.RECTANGLE) {

			lastBounds = lastShape.getBounds();

			// determine if marker1 is inside bounds:
			if (lastBounds.contains(m1.getPosition())) {
				$('#inside').html('Yup!');
			} else {
				$('#inside').html('Nope...');
			}

		} else if (lastShape.type == google.maps.drawing.OverlayType.POLYGON) {

			// determine if marker is inside the polygon:
			// (refer to: https://developers.google.com/maps/documentation/javascript/reference#poly)
			if (google.maps.geometry.poly.containsLocation(m1.getPosition(), lastShape)) {
				$('#inside').html('Yup!');
			} else {
				$('#inside').html('Nope...');
			}
		}
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
            'left':-sw.lng,
            'right':ne.lng,
            'top':ne.lat,
            'down':sw.lat,
            'facetObj':facetObj
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
	render_markers(map, acc_list);
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
    initMap();
});

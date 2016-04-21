/**
 * Created by sumeetsingharora on 4/16/16.
 */

var map, heatmap;
var facetObj;
var searchBox;
var maptToPlot = "heatmap";
function initMap() {

    map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: 13,
        center: {lat: 35, lng: -78},
        mapTypeId: google.maps.MapTypeId.SATELLITE
      }
    );

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
    });

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

/**
 * Created by sumeetsingharora on 4/16/16.
 */

var map, heatmap;
var facetObj;
var maptToPlot = "heatmap";
function initMap() {
    map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: 13,
        center: {lat: 35, lng: -78},
        mapTypeId: google.maps.MapTypeId.SATELLITE
      }
      );
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

    $("#start-time").timepicker({
        change: function(time) {
            var element =  $(this), text;
            var timepicker = element.timepicker();
            text = timepicker.format(time);
            var seconds = getSeconds(text);
            facetObj.timeofday_range[0] = seconds;
            logFacetObj(facetObj);
            initMap();
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
            initMap();
        }
    });

    $('#accidents').click(function () {
        maptToPlot = "accidents";
        initMap();
    });

    $('#roadsegments').click(function () {
        maptToPlot = "roadsegments";
        initMap();
    });

     $('#heatpmap').click(function () {
        maptToPlot = "heatmap";
        initMap();
    });

    initMap();
});

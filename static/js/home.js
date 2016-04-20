/**
 * Created by sumeetsingharora on 4/16/16.
 */

var map, heatmap;
var facetObj;

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
  render_markers(map, acc_list);
}

$(function() {
    facetObj = constructEmptyFacetObj(facetObj);
    $('#facets :checkbox').click(function(){
        getFacetsCheckboxes(facetObj.collisionType, facetObj.severity, facetObj.noOfLanes);
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

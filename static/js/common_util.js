////////////////
// common functions, TODO
////////////////
//http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
        });
  };
}

function urlParam(name){
  //http://www.sitepoint.com/url-parameters-jquery/
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
  }
  else{
    return results[1] || 0;
  }
}

function getMapBound(map){
  var bound = map.getBounds();
  if(bound == undefined) {
    return undefined;
  }
  var ne = bound.getNorthEast();
  var sw = bound.getSouthWest();
  return {
    'left':sw.lng(),
    'right':ne.lng(),
    'top':ne.lat(),
    'down':sw.lat()
  };  
}

function getFacetsCheckboxes(facetObj) {
  facetObj.collision.length = 0 ;
  $('.collision-type input:checked').each(function() {
      facetObj.collision.push($(this).attr('value'));
      });

  facetObj.severity.length = 0;
  $('.severity input:checked').each(function() {
      facetObj.severity.push($(this).attr('value'));
      });

  facetObj.no_of_lanes.length = 0;
  $('.no-of-lanes input:checked').each(function() {
      facetObj.no_of_lanes.push($(this).attr('value'));
      });
}

function getFacetsRadiobuttons(facetObj) {
  facetObj.loc_type = $('input[name=loc-type]:checked', '.location-type').val();
  if(facetObj.loc_type == undefined) {
    facetObj.loc_type = "both";
  }

  // TODO seems like bug at the backend. Uncomment when resolved.

  facetObj.driver_sex = $('input[name=Gender-type]:checked', '.gender-type').val();
  if(facetObj.driver_sex == undefined) {
    facetObj.driver_sex = "both";
  }

  facetObj.alcflag = $('input[name=Alcohol-type]:checked', '.alcohol-type').val();
  if(facetObj.alcflag == undefined) {
    facetObj.alcflag = "N";
  }

}

function constructEmptyFacetObj(facetObj) {
  var collision = [];
  var severity = [];
  var no_of_lanes = [];
  var loc_type = "both";
  var timePeriod = ["-1/-1/-1", "-1/-1/-1"];
  var timeOfDay = ["-1", "-1"];
  var driver_age_range = ["0", "100"];
  var driver_sex = "both";
  var alcflag = "N";

  //TODO uncomment whatever is commented once it is working
  facetObj = {
    'collision': collision, 'severity': severity, 'no_of_lanes': no_of_lanes, 'loc_type': loc_type,
    'date_range': timePeriod, 'timeofday_range': timeOfDay, 'alcflag': alcflag,
    'driver_age_range' : driver_age_range, 'driver_sex' : driver_sex};
  return facetObj;
}

function  logFacetObj(facetObj) {
  console.log("Started logging the faceted filter object");
  console.log("The collision array is " + facetObj.collision);
  console.log("The Severity array is " + facetObj.severity);
  console.log("Number of lanes array is " + facetObj.no_of_lanes);
  console.log("Location type is " + facetObj.loc_type);
  console.log("Time period is " +  facetObj.date_range);
  console.log("Time of day is " + facetObj.timeofday_range );
  console.log("alcohol fla is " + facetObj.alcflag);
  //TODO uncomment once working
  console.log("Range for driver age is " + facetObj.driver_age_range);
  console.log("Driver Sex is " + facetObj.driver_sex);
}

function  getSeconds(time) {
  var timeArray = time.split(' ');

  var timeParts = timeArray[0].split(':');
  var hours = parseInt(timeParts[0]);
  var minutes = parseInt(timeParts[1]);

  var seconds;
  if(hours == 12) {
    hours = 0;
  }

  if(timeArray[1] == "PM") {

    hours = hours + 12;
  }
  seconds = hours * 60 * 60 + minutes * 60;
  return seconds
}

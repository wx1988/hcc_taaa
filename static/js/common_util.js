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
}

function constructEmptyFacetObj(facetObj) {
     var collision = [];
     var severity = [];
     var no_of_lanes = [];
     var loc_type = "both";
     var timePeriod = ["-1/-1/-1", "-1/-1/-1"];
     var timeOfDay = ["-1", "-1"];

    facetObj = {'collision' : collision, 'severity' : severity, 'no_of_lanes' : no_of_lanes, 'loc_type' : loc_type,
    'date_range' : timePeriod, 'timeofday_range' : timeOfDay};
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
}
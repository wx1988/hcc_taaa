function getFacetsCheckboxes(collisionType, severity, noOfLanes) {
        collisionType.length = 0 ;
        $('.collision-type input:checked').each(function() {
            collisionType.push($(this).attr('value'));
        });

        severity.length = 0;
        $('.severity input:checked').each(function() {
            severity.push($(this).attr('value'));
        });

        noOfLanes.length = 0;
        $('.no-of-lanes input:checked').each(function() {
            noOfLanes.push($(this).attr('value'));
        });
}

function getFacetsRadiobuttons(facetObj) {
        facetObj.locationType = $('input[name=loc-type]:checked', '.location-type').val();
        facetObj.timePeriod = $('input[name=time-period]:checked', '.time-period').val();
        facetObj.timeOfDay = $('input[name=time-of-day]:checked', '.time-of-day').val();

        if(facetObj.locationType == undefined) {
            facetObj.locationType = "";
        }

        if(facetObj.timePeriod == undefined) {
            facetObj.timePeriod = "";
        }

        if(facetObj.timeOfDay == undefined) {
            facetObj.timeOfDay = "";
        }
}

function constructEmptyFacetObj(facetObj) {
     var collisionType = [];
     var severity = [];
     var noOfLanes = [];
     var locationType = "";
     var timePeriod = "";
     var timeOfDay = "";

    facetObj = {'collisionType' : collisionType, 'severity' : severity, 'noOfLanes' : noOfLanes, 'locationType' : locationType,
    'timePeriod' : timePeriod, 'timeOfDay' : timeOfDay};
    return facetObj;
}

function  logFacetObj(facetObj) {
    console.log("Started logging the faceted filter object");
    console.log("The collision array is " + facetObj.collisionType);
    console.log("The Severity array is " + facetObj.severity);
    console.log("Number of lanes array is " + facetObj.noOfLanes);
    console.log("Location type is " + facetObj.locationType);
    console.log("Time period is " +  facetObj.timePeriod);
    console.log("Time of day is " + facetObj.timeOfDay);
}
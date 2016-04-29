function add_record(action)
{
  add_record_refined({'action':action});  
}

function add_record_refined(action_dic)
{
  var log_info = action_dic;
  log_info["timestamp"] = (new Date()).getTime();    
  log_info["currentVisualMode"] = homeJS.currentVisualMode;
  log_info["detailViewState"] = homeJSLocal.detailViewState;

  jQuery.post(
      "/add_log",
      {'info': JSON.stringify(log_info)}
      )
}

function initMapLogger(map){
  /*
  map.addListener('zoom_changed', function() {
    add_record_refined({
      'action': "zoomChanged", 
      'level': map.getZoom(), 
      'center': [map.getCenter().lat(), map.getCenter().lng()]
    });    
  });  
  */

  /*
  // This is similar with the map moved or idle part
  map.addListener('center_changed', function() {
    add_record_refined({
      'action': "centerChanged", 
      'level': map.getZoom(), 
      'center': [map.getCenter().lat(), map.getCenter().lng()]
    });    
  });  
  */

  homeJSLocal.map.addListener('idle', function() {
    add_record_refined({
      'action': "mapMoved", 
      'level': map.getZoom(), 
      'center': [map.getCenter().lat(), map.getCenter().lng()],
      'bound': getMapBound(map)
    });    
  });
}

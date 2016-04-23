function getAndRenderHeatmap(map, accidents) {
  var pt_list = [];
  for(var i = 0; i < accidents.length; ++i) {
    pt_list[i] = new google.maps.LatLng(
        accidents[i].lat, accidents[i].lng);
  }

  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: pt_list
      ,map: map
  });

  return heatmap;
}

function getAccidentHeatmapCB(map, accidents) {
  clearVisual();
  homeJS.currentVisualMode = 'heatmap';
  homeJS.heatmap = getAndRenderHeatmap(map, accidents);
  document.getElementById('info-box').textContent = homeJS.heatmap.data.length + " accident(s) showing in screen";
}

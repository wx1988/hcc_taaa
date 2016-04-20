function render_heatmap(map, accidents)
{

  pt_list = [];
  for(var i = 0; i < accidents.length; ++i)
  {
    pt_list[i] = new google.maps.LatLng(
        accidents[i].lat, accidents[i].lng);
  }

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: pt_list
      ,map: map
  });
}

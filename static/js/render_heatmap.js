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
// TODO, comment based on Sumeet's convention
// map, the javascript map variable
// accidents, list of accidents, 
// example of one accident
/*
   [_id] => MongoId Object (
   [$id] => 570575bfe0f045734cc836d5
   )
   [weather1] => 1
   [weather2] => NAN
   [rte_nbr] => 30000024
   [cnty_rte] => 2530000024
   [light] => 4
   [pop_grp] => 130692
   [roadcnt2] => NAN
   [caseno] => 102482979
   [roadcnt1] => 0
   [milepost] => 12.29
   [time] => 12:06 AM
   [rdsurf] => 1
   [acc_date] => 01/01/2009
   [lat] => 35.06366418185
   [lng] => -78.893594512873
   [alcflag] => N
   [loc_type] => 0
   [nbr_lane] => 6
   [num_a] => 0
   [num_b] => 0
   [num_k] => 0
   [num_c] => 0
   [events] => Array (
   [0] => 32
   [1] => 23
   )
   */
}

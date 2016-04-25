function getAndRenderRoadsegments(map, roadsegments)
{
  var infowindow = new google.maps.InfoWindow();
  var segment = [];  
  for(var i = 0; i < roadsegments.length; ++i)
  {
    var plist = roadsegments[i].plist;
    var localCoords = [];

    for(var j = 0; j < plist.length; j++)
    {
      localCoords[j] = {lat: plist[j][1], lng:plist[j][0]};
    }

    var acc_num = 0;
    if(roadsegments[i].casenolist != undefined)
    {
      acc_num =roadsegments[i].casenolist.length;
    }

    var localColor = HSVtoRGB( sigmoid(acc_num), 1, 1);
    segment[i] = new google.maps.Polyline({
      path: localCoords
        ,accNum: acc_num
        ,geodesic: true
        ,strokeColor: localColor
        ,strokeOpacity: 1.0
        ,strokeWeight: 1 + sigmoid(acc_num) * 5
    });
    segment[i].setMap(map);
    make_seg_infowindow_event(map, infowindow, get_seg_details(roadsegments[i]), segment[i])
  }
  return segment;
}

function setSegments(segments, map)
{
  for(var i = 0; i < segments.length; ++i) {
    segments[i].setMap(map);
  }
}

function getNumAccidentsFromSegments(segments)
{
  if(segments == undefined) return 0;
  else {
    var numAcc = 0;
    for(var i = 0; i < segments.length; ++i){
      numAcc += segments[i].accNum;
    }
    return numAcc;
  }
}

function make_seg_infowindow_event(map, infowindow, contentString, line)
{
  google.maps.event.addListener(line, 'click', function(event) {
    infowindow.setContent(contentString);
    infowindow.setPosition(event.latLng);
    infowindow.open(map);
  });
}

function getRoadSegmentsCB(map, segments) {
  clearVisual();
  homeJS.roadsegments = getAndRenderRoadsegments(map, segments);

  var numSegments = 0;
  if(homeJS.roadsegments != undefined){
    numSegments = homeJS.roadsegments.length;
  }
  
  // TODO, rename tmp_res
  var tmp_res = "<div>";
  for(var acc_num =0; acc_num < 30;acc_num+=4){
    var tmpColor = HSVtoRGB( sigmoid(acc_num), 1,1 );
    tmp_res += "<span style='background-color:"+tmpColor+";'>";
    tmp_res += acc_num+"|";
    tmp_res += "</span>";
  }
  tmp_res += "</div>";

  $('#info-box').html( 
    tmp_res + 
    numSegments +  
    " segments showing in screen <br/> including " + 
    getNumAccidentsFromSegments(homeJS.roadsegments) + ' accident(s)');

  console.log("rendering the road segments");
  homeJS.currentVisualMode = 'segments';
}

function get_seg_details(seg)
{
  var seg_info = '';
  if(seg.rte_nbr != 'NAN') { seg_info += '<br />' + 'Route Number: ' + seg.rte_nbr; }
  if(seg.begmp != 'NAN') { seg_info += '<br />' + 'Begin milepost: ' + seg.begmp; }
  if(seg.endmp != 'NAN') { seg_info += '<br />' + 'End milepost: ' + seg.endmp; }
  if(seg.spd_limt != 'NAN') { seg_info += '<br />' + 'Speed limit: ' + seg.spd_limt; }
  if(seg.aadt != 'NAN') { seg_info += '<br />' + 'AADT: ' + seg.aadt; }
  if(seg.lshl_typ != 'NAN') { seg_info += '<br />' + 'Left Shoulder Type: ' + shoulder_type[seg.lshl_typ]; }
  if(seg.lshldwid != 'NAN') { seg_info += '<br />' + 'Left Shoulder Width: ' + seg.lshldwid; }
  if(seg.rshl_typ != 'NAN') { seg_info += '<br />' + 'Right Shoulder Type: ' + shoulder_type[seg.rshl_typ]; }
  if(seg.rshldwid != 'NAN') { seg_info += '<br />' + 'Right Shoulder Width: ' + seg.rshldwid; }
  if(seg.surf_wid != 'NAN') { seg_info += '<br />' + 'Surface Width: ' + seg.surf_wid; }
  if(seg.medwid != 'NAN') { seg_info += '<br />' + 'Median Width: ' + seg.medwid; }
  if(seg.med_type != 'NAN') { seg_info += '<br />' + 'Median Type: ' + median_type[seg.med_type]; }
  if(seg.surf_typ != 'NAN') { seg_info += '<br />' + 'Surface Type: ' + surface_type[seg.surf_typ]; }
  if(seg.yradd != 'NAN') { seg_info += '<br />' + 'Build Time: ' + seg.yradd.split(' ')[0]; }

  return seg_info;
}

function sigmoid(t)
{
  // re-scaled illustration
  return 1/(1+Math.pow(Math.E, -0.1*t));
}

function decimalToHex(d, padding)
{
  var hex = Number(d).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding)
  {
    hex = "0" + hex;
  }
  return hex;
}

function HSVtoRGB(h, s, v)
{
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1)
  {
    s = h.s, v = h.v, h = h.h;
  }

  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6)
  {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return "#" + decimalToHex(Math.round(r * 255)) + decimalToHex(Math.round(g * 255)) + decimalToHex(Math.round(b * 255));
}

/*
   {
   "rodwycls": "08", 
   "lshl_typ": "06", 
   "terrain": "1", 
   "bound": {"down": 34.993755374310105, "top": 35.000532882557636, "right": -78.08931884788728, "left": -78.09195681900657}, 
   "rshldwid": 0.0, 
   "id": "570815bae0f0456756a8a71f", 
   "yr_impr1": "1988-12-31 00:00:00", 
   "plist": [[-78.08931884788728, 34.993755374310105], [-78.089578586, 34.994433079], [-78.090038439, 34.9956429430001], [-78.090489162, 34.9967743400001], [-78.0909961359999, 34.998103373], [-78.0915046929999, 34.999366632], [-78.0915046929999, 34.999366632], [-78.091720086, 34.999891969], [-78.0918854289999, 35.0003387240001], [-78.09195681900657, 35.000532882557636]], 
   "surf_typ": "63", 
   "yradd": "1901-12-31 00:00:00", 
   "rshl_typ": "06", 
   "begmp": 20.163, 
   "spd_limt": "35", 
   "rte_nbr": "20000117", 
   "medwid": 0.0, 
   "aadt": 3800.0, 
   "med_type": "0", 
   "casenolist": [103201618.0, 103395223.0, 103553310.0, 103553311.0, 104044290.0], 
   "cntyrte": "3020000117", 
   "surf_wid": 42.0, 
   "lshldwid": 0.0, 
   "endmp": 20.650000000000002} 
   */

//This may need to be moved to somewhere else
shoulder_type = {
  01: 'Grass/Sod',
  02: 'Gravel',
  B3: 'Paved 1-2 ft',
  B4: 'Paved 3-4 ft',
  B5: 'Paved 5-6 ft',
  B6: 'Paved 7-8 ft',
  B7: 'Paved 9 ft',
  B8: 'Paved 10+ ft',
  B9: 'Curb',
  C3: 'P.C. Concrete 1-2 ft',
  C4: 'P.C. Concrete 3-4 ft',
  C5: 'P.C. Concrete 5-6 ft',
  C6: 'P.C. Concrete 7-8 ft',
  C7: 'P.C. Concrete 9 ft',
  C8: 'P.C. Concrete 10+ ft',
  C9: 'P.C. Concrete Curb',
  T4: 'P.C.C. 3-4 ft w/ Tie Bars',
  T5: 'P.C.C. 5-6 ft w/ Tie Bars',
  T6: 'P.C.C. 7-8 ft w/ Tie Bars',
  T7: 'P.C.C. 9 ft w/ Tie Bars',
  T8: 'P.C.C. 10+ ft w/ Tie Bars',
  00: 'Unknown',
  03: 'Bituminous Material',
  04: 'Curb Bituminous (Butimouns with Curb)',
  05: 'Concrete (Portland Cement Concrete Surface)',
  06: 'Curb Concrete (Concrete Curb)',
  07: 'Tie Bar (Shoulder Contains Tie Bars)'
}

median_type = {
  0: 'Undivided Roadway',
  1: 'Rigid Pos Barrier',
  2: 'Continuous Turn Lane',
  3: 'Paved Mountable',
  4: 'Curb',
  5: 'Grass',
  6: 'Positive Barrier',
  7: 'Parkland, Business',
  8: 'Couplet',
  9: 'Flexible Pos Barrier',
  10: 'Striped',
  11: 'Semi-Rigid Pos Barrier'
}

surface_type = {
  00: 'Primitive (Not Use don State System)',
  10: 'Unimproved',
  20: 'Graded and Drained',
  30: 'Soil Surfaced',
  41: 'Gravel or Stone',
  51: 'Bituminous Surf Treatment on Topsoil',
  52: 'Bituminous Surf Treatment on Gravel or Stone',
  60: 'Mixed Bituminous, Non-Rigid Base',
  61: 'Mixed Bituminous, Rigid Base',
  62: 'Bituminous Penetration, Rigid Base',
  63: 'Bituminous Penetration, Non-Rigid Base',
  65: 'Sand Asphalt on Types Other Than 66, 67',
  66: 'Sand Asphalt on Bituminous Concrete',
  67: 'Bituminous Concrete',
  70: 'Portland Cement Concrete',
  80: 'Brick',
  90: 'Block',
  99: 'Hard Surface',
}

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

  var route_basic_info = "";
  if(seg.rte_nbr == 'NAN' || seg.begmp == 'NAN' || seg.endmp == 'NAN'){
    console.log("route basic information error");
    return;
  }
  route_basic_info = 'Route #: ' + seg.rte_nbr+', '; 
  route_basic_info += 'Milepost Range:[' + seg.begmp.toFixed(2) + 
    ',' + seg.endmp.toFixed(2) + '], ';
  route_basic_info += "SpeedLimit: "+ seg.spd_limt+', ';
  route_basic_info += "AADT: "+ seg.aadt+', ';

  var pavement_width = "Pavement Condition (Type, Width):";
  var shoulder = "Shoulder: ";
  shoulder += "L: ("+ roadCode.shoulder_type[seg.lshl_typ]+", "+ seg.lshldwid+"), ";
  shoulder += "R: ("+ roadCode.shoulder_type[seg.lshl_typ]+", "+ seg.lshldwid+")";
  var median = "Median: ";
  median += "("+ roadCode.median_type[seg.med_type]+','+ seg.medwid+")";
  var surface = "Surface: "; 
  surface += "("+ roadCode.surface_type[seg.surf_typ] + ', ' + seg.surf_wid + ")";
  pavement_width += "<br/>"+shoulder +"<br/>"+median+"<br/>"+surface;

  var build_time = 'Build Time: ' + seg.yradd.split(' ')[0];
  
  seg_info += route_basic_info+"<br/>"+pavement_width+"<br/>"+build_time;
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


